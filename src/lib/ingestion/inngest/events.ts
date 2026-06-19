export type DocumentUploadedEvent = {
  data: {
    workspaceId: string;
    documentId: string;
    versionId: string;
    filePath: string;
    fileName: string;
  };
};

export type Events = {
  "doc.uploaded": DocumentUploadedEvent;
};
