import { SupabaseClient } from '@supabase/supabase-js';

export interface IngestionChunk {
  content: string;
  fingerprint: string;
  metadata: any;
  page_number?: number;
}

export class IngestionClient {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Initializes a new document upload or a new version of an existing document.
   * Handles File-Level deduplication.
   */
  async initializeUpload(workspaceId: string, filename: string, fileChecksum: string) {
    // 1. Check if document with this name already exists in the workspace
    const { data: existingDoc } = await this.supabase
      .from('documents')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('name', filename)
      .single();

    let documentId = existingDoc?.id;

    if (!documentId) {
      // Create new document
      const { data: newDoc, error: docError } = await this.supabase
        .from('documents')
        .insert({ workspace_id: workspaceId, name: filename })
        .select('id')
        .single();
      
      if (docError) throw docError;
      documentId = newDoc.id;
    }

    // 2. Check if this exact file checksum already exists across any version of this document
    const { data: existingVersion } = await this.supabase
      .from('document_versions')
      .select('id, status')
      .eq('document_id', documentId)
      .eq('checksum', fileChecksum)
      .single();

    if (existingVersion) {
      // File-level deduplication: The file already exists. 
      // Just ensure the document points to it.
      await this.supabase
        .from('documents')
        .update({ current_version_id: existingVersion.id })
        .eq('id', documentId);
      
      return { 
        documentId, 
        versionId: existingVersion.id, 
        status: existingVersion.status,
        isDuplicate: true 
      };
    }

    // 3. Create new version
    const { data: lastVersion } = await this.supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (lastVersion?.version_number || 0) + 1;

    const { data: newVersion, error: verError } = await this.supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: nextVersionNumber,
        checksum: fileChecksum,
        status: 'uploaded'
      })
      .select('id')
      .single();

    if (verError) throw verError;

    // Update document's active pointer
    await this.supabase
      .from('documents')
      .update({ current_version_id: newVersion.id })
      .eq('id', documentId);

    // 4. Initialize Telemetry Job
    await this.supabase
      .from('ingestion_jobs')
      .insert({ document_version_id: newVersion.id, status: 'running' });

    return { 
      documentId, 
      versionId: newVersion.id, 
      status: 'uploaded',
      isDuplicate: false 
    };
  }

  /**
   * Links chunks to a document version, performing Chunk-Level Deduplication.
   * Returns the IDs of chunks that were newly inserted and need embedding.
   */
  async processChunks(workspaceId: string, versionId: string, chunks: IngestionChunk[]) {
    const chunksNeedingEmbedding: string[] = [];

    for (const chunk of chunks) {
      // 1. Try to find existing chunk by fingerprint
      let { data: existingChunk } = await this.supabase
        .from('document_chunks')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('fingerprint', chunk.fingerprint)
        .single();

      let chunkId = existingChunk?.id;

      // 2. Insert new chunk if it doesn't exist
      if (!chunkId) {
        const { data: newChunk, error } = await this.supabase
          .from('document_chunks')
          .insert({
            workspace_id: workspaceId,
            content: chunk.content,
            fingerprint: chunk.fingerprint,
            metadata: chunk.metadata,
            chunk_type: 'text' // default for now
          })
          .select('id')
          .single();
        
        if (error) throw error;
        chunkId = newChunk.id;
        chunksNeedingEmbedding.push(chunkId);
      }

      // 3. Link the chunk to this specific document version (Lineage)
      // This is a join table, so it handles incremental updates beautifully.
      await this.supabase
        .from('document_version_chunks')
        .upsert({
          document_version_id: versionId,
          chunk_id: chunkId,
          page_number: chunk.page_number,
          hierarchy: chunk.metadata?.hierarchy || []
        }, { onConflict: 'document_version_id, chunk_id' });
    }

    return chunksNeedingEmbedding;
  }

  /**
   * Updates the state machine for the document version.
   */
  async updateVersionStatus(versionId: string, status: 'queued' | 'processing' | 'embedding' | 'indexing_graph' | 'completed' | 'failed') {
    await this.supabase
      .from('document_versions')
      .update({ status })
      .eq('id', versionId);
  }

  /**
   * Completes the telemetry job tracking.
   */
  async finalizeJobTelemetry(versionId: string, metrics: { parsing: number, chunking: number, embedding: number, extraction: number, total: number }, status: 'completed' | 'failed') {
    await this.supabase
      .from('ingestion_jobs')
      .update({
        parsing_time_ms: metrics.parsing,
        chunking_time_ms: metrics.chunking,
        embedding_time_ms: metrics.embedding,
        extraction_time_ms: metrics.extraction,
        total_time_ms: metrics.total,
        status: status
      })
      .eq('document_version_id', versionId);
  }
}
