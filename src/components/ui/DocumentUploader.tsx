"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

interface DocumentUploaderProps {
  onDocumentsProcessed: (docs: { text: string; filename: string }[]) => void;
  isProcessing: boolean;
}

export const DocumentUploader = ({ onDocumentsProcessed, isProcessing }: DocumentUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingFiles, setProcessingFiles] = useState<{name: string, status: "pending" | "done"}[]>([]);

  const processFiles = async (files: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles = Array.from(files).filter(f => f.type === "application/pdf" || f.type === "text/plain");
    
    if (validFiles.length === 0) {
      setErrorMsg("No valid files. Please upload PDF or TXT.");
      return;
    }

    setProcessingFiles(validFiles.map(f => ({ name: f.name, status: "pending" })));
    const processedDocs: { text: string; filename: string }[] = [];

    try {
      for (let fileIndex = 0; fileIndex < validFiles.length; fileIndex++) {
        const file = validFiles[fileIndex];
        let extractedText = "";

        if (file.type === "application/pdf") {
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
          
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n";
          }
          extractedText = fullText;
        } else {
          extractedText = await file.text();
        }

        if (extractedText.trim()) {
          processedDocs.push({ text: extractedText, filename: file.name });
        }

        setProcessingFiles(prev => prev.map((pf, i) => i === fileIndex ? { ...pf, status: "done" } : pf));
      }

      if (processedDocs.length === 0) {
        throw new Error("No readable text found in the documents.");
      }

      onDocumentsProcessed(processedDocs);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process documents.");
      setProcessingFiles([]);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full lg:max-w-2xl mx-auto mt-20 lg:mt-32 px-4"
    >
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={clsx(
          "relative flex flex-col items-center justify-center text-center transition-all duration-300 backdrop-blur-xl bg-[var(--color-glass)]",
          "p-6 rounded-2xl border border-white/10 shadow-xl", 
          "lg:p-12 lg:rounded-3xl lg:border-2 lg:border-dashed",
          isDragging ? "border-[var(--color-accent)] bg-blue-900/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]" : "hover:border-white/20",
          isProcessing && processingFiles.length === 0 && "opacity-50 pointer-events-none"
        )}
      >
        <AnimatePresence mode="wait">
          {processingFiles.length > 0 ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center space-y-4 w-full"
            >
              <h3 className="text-xl font-semibold text-white mb-2">Processing Documents...</h3>
              <div className="w-full max-w-md space-y-3 relative">
                {processingFiles.map((file, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-lg"
                    style={{ zIndex: processingFiles.length - i }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-200 truncate">{file.name}</span>
                    </div>
                    {file.status === "pending" ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center space-y-4 lg:space-y-6 w-full"
            >
              <div className="hidden lg:flex p-4 bg-white/5 rounded-full border border-white/10 text-gray-300">
                <UploadCloud className="w-10 h-10" />
              </div>
              
              <div className="space-y-1 lg:space-y-2">
                <h3 className="text-xl lg:text-2xl font-semibold text-white">Upload Knowledge Base</h3>
                <p className="text-sm lg:text-base text-gray-400 hidden lg:block">Drag & drop multiple PDF or TXT files here, or click to browse.</p>
                <p className="text-sm text-gray-400 lg:hidden">Tap below to select PDF or TXT files.</p>
              </div>

              <label className="cursor-pointer group w-full lg:w-auto">
                <div className="px-6 py-3 min-h-[44px] rounded-xl lg:rounded-full bg-white/10 hover:bg-white/20 transition-all font-medium text-white flex items-center justify-center gap-2 border border-white/5">
                  <FileText className="w-5 h-5 lg:w-4 lg:h-4" />
                  Select Files
                </div>
                <input 
                  type="file" 
                  accept=".pdf,.txt" 
                  multiple
                  className="hidden" 
                  onChange={onFileInput}
                />
              </label>
              
              {errorMsg && (
                <div className="px-4 py-2 bg-red-500/20 text-red-300 text-sm rounded-lg border border-red-500/20 w-full mt-4">
                  {errorMsg}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
