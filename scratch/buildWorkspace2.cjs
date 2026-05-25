const fs = require('fs');

const dashboardJSX = fs.readFileSync('scratch/dashboard_jsx.txt', 'utf8');

let finalJSX = dashboardJSX;

// Replace toggle actions
finalJSX = finalJSX.replace(/onClick="toggleMobileNav\(\)"/g, 'onClick={() => setIsSidebarOpen(!isSidebarOpen)}');
finalJSX = finalJSX.replace(/onClick="toggleSettings\(\)"/g, 'onClick={() => setIsSettingsOpen(!isSettingsOpen)}');
finalJSX = finalJSX.replace(/onClick="toggleAccordion\(this\)"/g, 'onClick={() => toggleAccordion("citation-1")}');

// Update Sidebar classes to respond to state
finalJSX = finalJSX.replace(
  /<aside className="bg-surface-container h-screen w-sidebar-width fixed md:relative z-40 transform -translate-x-full md:translate-x-0 transition-transform duration-300 border-r border-outline-variant\/20 flex flex-col py-lg" id="sidebar">/g,
  `<aside className={\`bg-surface-container h-screen w-[280px] fixed md:relative z-40 transform \${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 border-r border-outline-variant/20 flex flex-col py-lg\`} id="sidebar">`
);

// Update Settings Panel classes to respond to state
finalJSX = finalJSX.replace(
  /<aside className="hidden xl:flex w-\[320px\] bg-surface-container-low border-l border-outline-variant\/20 flex-col py-lg px-md overflow-y-auto transform xl:translate-x-0 transition-transform duration-300" id="settings-panel">/g,
  `<aside className={\`xl:flex w-[320px] bg-surface-container-low border-l border-outline-variant/20 flex-col py-lg px-md overflow-y-auto transform \${isSettingsOpen ? 'translate-x-0 fixed right-0 h-screen z-50 flex' : 'translate-x-full hidden'} xl:translate-x-0 xl:relative xl:flex transition-transform duration-300\`} id="settings-panel">`
);

// Update Accordion content visibility
finalJSX = finalJSX.replace(
  /<div className="accordion-content">/g,
  `<div className={\`accordion-content overflow-hidden transition-all duration-300 \${openAccordions["citation-1"] ? 'max-h-96' : 'max-h-0'}\`}>`
);
// And chevron rotation
finalJSX = finalJSX.replace(
  /<span className="material-symbols-outlined text-sm transition-transform duration-300 chevron-icon">expand_more<\/span>/g,
  `<span className={\`material-symbols-outlined text-sm transition-transform duration-300 chevron-icon \${openAccordions["citation-1"] ? 'rotate-180' : ''}\`}>expand_more</span>`
);

const replacementStr = `<div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-lg flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-outline text-3xl mb-sm group-hover:text-primary transition-colors group-hover:scale-110 duration-200">cloud_upload</span>
            <p className="font-label-md text-label-md text-on-surface">Drop files to ingest</p>
            <p className="text-[11px] text-outline mt-xs">PDF, CSV, JSON, Markdown</p>
          </div>
          
          <div className="mt-lg flex flex-col gap-sm max-h-[300px] overflow-y-auto">
            {documents.map(doc => (
              <div key={doc.id} className="bg-surface-container-high rounded-lg p-sm border border-outline-variant/10 flex flex-col gap-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-on-surface truncate w-3/4">{doc.file_name}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc); }} className="text-outline hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-outline">{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                  <span className="text-[9px] text-secondary">
                    {doc.vector_status === 'pending' ? 'Pending' : 'Indexed'}
                  </span>
                </div>
              </div>
            ))}
            
            {isUploading && (
              <div className="mt-sm">
                <div className="flex justify-between items-center mb-xs">
                  <span className="text-[10px] font-bold text-on-surface truncate">Uploading...</span>
                  <span className="text-[10px] text-secondary font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full transition-all duration-300" style={{ width: uploadProgress + '%' }}></div>
                </div>
              </div>
            )}
          </div>`;

finalJSX = finalJSX.replace(/<div className="border-2 border-dashed[\s\S]*?<\/div>/, replacementStr);
finalJSX = finalJSX.replace(/rows="1"/, "rows={1}");

const fullCode = `"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentItem {
  id: string;
  file_name: string;
  file_size_bytes: number;
  storage_path: string;
  vector_status: string;
  chunks?: string[];
}

export default function WorkspacePage() {
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<{title: string, error: boolean} | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const showToast = (title: string, error: boolean = false) => {
    setToastMessage({ title, error });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profile) setUserProfile(profile);

    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (docs) setDocuments(docs);
  };

  const executeDocumentUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const limit = userProfile?.plan_tier === 'pro' ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
      const currentUsed = userProfile?.storage_used_bytes || 0;

      if (currentUsed + file.size > limit) {
        throw new Error("Storage limit exceeded for your tier.");
      }

      setUploadProgress(30);

      const filePath = \`\${user.id}/\${Date.now()}_\${file.name}\`;
      const { error: uploadError } = await supabase.storage
        .from('nexus_docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      const { data: docData, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_size_bytes: file.size,
          storage_path: filePath,
          vector_status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(80);

      const newStorageUsed = currentUsed + file.size;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ storage_used_bytes: newStorageUsed })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setDocuments(prev => [docData, ...prev]);
      setUserProfile((prev: any) => ({ ...prev, storage_used_bytes: newStorageUsed }));
      showToast("Document uploaded successfully");

    } catch (err: any) {
      showToast(err.message || "Upload failed", true);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      executeDocumentUpload(file);
    }
  };

  const handleDeleteDocument = async (doc: DocumentItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { error: storageError } = await supabase.storage
        .from('nexus_docs')
        .remove([doc.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      const currentUsed = userProfile?.storage_used_bytes || 0;
      const newStorageUsed = Math.max(0, currentUsed - doc.file_size_bytes);
      
      await supabase
        .from('profiles')
        .update({ storage_used_bytes: newStorageUsed })
        .eq('id', user.id);

      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      setUserProfile((prev: any) => ({ ...prev, storage_used_bytes: newStorageUsed }));
      showToast("Document deleted successfully");

    } catch (err: any) {
      showToast(err.message || "Delete failed", true);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen font-body-md overflow-hidden dark">
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={\`fixed top-4 right-4 z-[100] px-lg py-sm rounded-lg shadow-2xl \${toastMessage.error ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}\`}
          >
            {toastMessage.title}
          </motion.div>
        )}
      </AnimatePresence>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.txt,.md,.csv,.json" 
      />
      
      ` + finalJSX + `
    </div>
  );
}
`;

fs.writeFileSync('src/app/workspace/page.tsx', fullCode);
console.log('Done');
