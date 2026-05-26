"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  memo,
} from 'react';
import Link from 'next/link';

const ICON_BASE = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
const ICON_FILLED = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";

type MessageRole = 'assistant' | 'user';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  citations?: { title: string; similarity: string; excerpt: string }[];
  latencyMs?: number;
  tokenCount?: number;
}

interface ConversationBubbleProps {
  message: ChatMessage;
  onOpenCitations: (citations: ChatMessage['citations']) => void;
}

const ConversationBubble = memo(function ConversationBubble({
  message,
  onOpenCitations,
}: ConversationBubbleProps) {
  const isAssistant = message.role === 'assistant';

  if (isAssistant) {
    return (
      <div className="flex flex-col items-start gap-1 max-w-[88%]">
        <div className="bg-[#1b202b] border-l-2 border-[#4cd7f6] p-3 rounded-xl rounded-tl-none shadow-sm">
          <p className="text-[14px] leading-relaxed text-[#dee2f2]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {message.content}
            {message.citations && message.citations.length > 0 && (
              <button
                onTouchEnd={() => onOpenCitations(message.citations)}
                onClick={() => onOpenCitations(message.citations)}
                className="inline-flex items-center bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 rounded-full px-2 py-0.5 ml-1.5 active:bg-[#4cd7f6]/25 active:scale-95 transition-transform"
              >
                <span className="text-[11px] text-[#4cd7f6] font-bold" style={{ fontFamily: 'monospace' }}>
                  CITATIONS [{message.citations.length}]
                </span>
              </button>
            )}
          </p>
          {(message.latencyMs || message.tokenCount) && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {message.latencyMs && (
                <span className="bg-[#303541] border border-[#464554]/30 px-2 py-0.5 rounded text-[10px] text-[#908fa0]" style={{ fontFamily: 'monospace' }}>
                  latency: {message.latencyMs}ms
                </span>
              )}
              {message.tokenCount && (
                <span className="bg-[#303541] border border-[#464554]/30 px-2 py-0.5 rounded text-[10px] text-[#908fa0]" style={{ fontFamily: 'monospace' }}>
                  tokens: {message.tokenCount}
                </span>
              )}
            </div>
          )}
        </div>
        <span className="text-[11px] text-[#908fa0] px-1 italic" style={{ fontFamily: 'Inter, sans-serif' }}>
          Nexus Assistant • {message.timestamp}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 ml-auto max-w-[88%]">
      <div className="bg-[#0e131e] border border-[#c0c1ff]/40 p-3 rounded-xl rounded-tr-none">
        <p className="text-[14px] leading-relaxed text-[#dee2f2]" style={{ fontFamily: 'Inter, sans-serif' }}>
          {message.content}
        </p>
      </div>
      <span className="text-[11px] text-[#908fa0] px-1 italic" style={{ fontFamily: 'Inter, sans-serif' }}>
        You • {message.timestamp}
      </span>
    </div>
  );
});

function LiveStreamBubble({ streamBuffer }: { streamBuffer: React.RefObject<string> }) {
  const [renderedText, setRenderedText] = useState('');
  const frameHandle = useRef<number>(0);

  useEffect(() => {
    const executeMobileScrollAnchor = () => {
      if (streamBuffer.current !== renderedText) {
        setRenderedText(streamBuffer.current ?? '');
      }
      frameHandle.current = requestAnimationFrame(executeMobileScrollAnchor);
    };
    frameHandle.current = requestAnimationFrame(executeMobileScrollAnchor);
    return () => cancelAnimationFrame(frameHandle.current);
  }, [streamBuffer, renderedText]);

  return (
    <div className="flex flex-col items-start gap-1 max-w-[88%]">
      <div className="bg-[#1b202b] border-l-2 border-[#4cd7f6] p-3 rounded-xl rounded-tl-none shadow-sm min-w-[180px]">
        {renderedText ? (
          <p className="text-[14px] leading-relaxed text-[#dee2f2]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {renderedText}
          </p>
        ) : (
          <>
            <div className="flex gap-1.5 items-center py-1 mb-1">
              <div className="w-1.5 h-1.5 bg-[#4cd7f6] rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />
              <div className="w-1.5 h-1.5 bg-[#4cd7f6] rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }} />
              <div className="w-1.5 h-1.5 bg-[#4cd7f6] rounded-full animate-bounce" />
            </div>
            <p className="text-[13px] text-[#c7c4d7] italic" style={{ fontFamily: 'Inter, sans-serif' }}>
              Retrieving context from documentation...
            </p>
            <div className="mt-3 h-1 bg-[#303541] w-full rounded-full overflow-hidden">
              <div className="h-full bg-[#4cd7f6] w-2/3 shadow-[0_0_8px_rgba(76,215,246,0.5)] animate-pulse" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const DEMO_HISTORY: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content:
      'Based on the current knowledge base, the Enterprise Workspace is optimized for v2.4.0. The RAG pipeline is currently processing 14 disparate data sources including your internal Wiki and API documentation.',
    timestamp: '10:12 AM',
    citations: [
      {
        title: '[1] Infrastructure_Specs_v2.pdf',
        similarity: '0.98',
        excerpt: '"...indexing latency reduced by 42% following the implementation of the HNSW algorithm..."',
      },
      {
        title: '[2] API-Docs-Endpoint-Refresh',
        similarity: '0.84',
        excerpt: '"...tokenization pipeline now supports multi-modal embeddings for PDF and Excel ingestion..."',
      },
    ],
    latencyMs: 240,
    tokenCount: 142,
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'Can you summarize the performance impact of the new vector indexing update?',
    timestamp: '10:14 AM',
  },
];

export default function MobileChatbot() {
  const [conversationHistory] = useState<ChatMessage[]>(DEMO_HISTORY);
  const [isStreaming] = useState(true);
  const [activeCitations, setActiveCitations] = useState<ChatMessage['citations'] | null>(null);
  const [composedMessage, setComposedMessage] = useState('');

  const streamBuffer = useRef('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  const expandTextareaToContent = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  const handleOpenCitations = useCallback(
    (citations: ChatMessage['citations']) => setActiveCitations(citations),
    []
  );

  const handleCloseCitations = useCallback(() => setActiveCitations(null), []);

  const handleSendMessage = useCallback(() => {
    if (!composedMessage.trim()) return;
    setComposedMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [composedMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  useEffect(() => {
    const listEl = messageListRef.current;
    if (listEl) listEl.scrollTop = listEl.scrollHeight;
  }, [conversationHistory, isStreaming]);

  return (
    <div className="flex flex-col h-full bg-[#0e131e] text-[#dee2f2] overflow-hidden">
      <style>{`
        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #464554; border-radius: 10px; }
      `}</style>

      <header className="shrink-0 bg-[rgba(14,19,30,0.97)] backdrop-blur-md border-b border-[#464554]/30 px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c0c1ff] text-[22px]" style={{ fontVariationSettings: ICON_BASE }}>hub</span>
          <div className="flex flex-col">
            <span className="font-semibold text-[15px] text-[#dee2f2] leading-tight tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Nexus RAG</span>
            <span className="text-[11px] text-[#4cd7f6] flex items-center gap-1" style={{ fontFamily: 'Geist, sans-serif' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse inline-block" />
              Connected to 14 Sources
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[#c7c4d7] active:text-[#4cd7f6] transition-colors p-1">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ICON_BASE }}>more_vert</span>
          </button>
        </div>
      </header>

      <div
        ref={messageListRef}
        className="flex-1 min-h-0 overflow-y-auto chat-scroll px-4 py-4 space-y-4"
      >
        {conversationHistory.map(msg => (
          <ConversationBubble
            key={msg.id}
            message={msg}
            onOpenCitations={handleOpenCitations}
          />
        ))}

        {isStreaming && <LiveStreamBubble streamBuffer={streamBuffer} />}
      </div>

      <div className="shrink-0 flex flex-col bg-[rgba(14,19,30,0.97)] border-t border-[#464554]/20 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto px-3 pt-2 pb-1" style={{ scrollbarWidth: 'none' }}>
          <button className="flex items-center gap-1 bg-[#252a35] border border-[#464554]/30 px-2.5 py-1 rounded-full whitespace-nowrap text-[#c7c4d7] active:scale-95 transition-transform text-[12px]" style={{ fontFamily: 'Geist, sans-serif' }}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: ICON_BASE }}>psychology</span>
            Nexus-v4 (Pro)
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: ICON_BASE }}>expand_more</span>
          </button>
          <button className="flex items-center gap-1 bg-[#252a35] border border-[#464554]/30 px-2.5 py-1 rounded-full whitespace-nowrap text-[#c7c4d7] active:scale-95 transition-transform text-[12px]" style={{ fontFamily: 'Geist, sans-serif' }}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: ICON_BASE }}>tune</span>
            Temp: 0.7
          </button>
          <button className="flex items-center gap-1 bg-[#252a35] border border-[#464554]/30 px-2.5 py-1 rounded-full whitespace-nowrap text-[#c7c4d7] active:scale-95 transition-transform text-[12px]" style={{ fontFamily: 'Geist, sans-serif' }}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: ICON_BASE }}>history_edu</span>
            Summary
          </button>
        </div>

        <div className="flex items-end gap-2 mx-3 mb-2 bg-[#303541] rounded-2xl border border-[#464554]/50 px-3 py-2">
          <button className="text-[#908fa0] active:text-[#c0c1ff] transition-colors shrink-0 mb-1 p-0.5">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: ICON_BASE }}>attach_file</span>
          </button>
          <textarea
            ref={textareaRef}
            value={composedMessage}
            onChange={e => setComposedMessage(e.target.value)}
            onInput={expandTextareaToContent}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none resize-none text-base text-[#dee2f2] placeholder:text-[#908fa0]/60 max-h-32 overflow-y-auto py-0.5 leading-snug"
            placeholder="Ask anything about your data..."
            rows={1}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
          />
          <button
            onTouchEnd={handleSendMessage}
            onClick={handleSendMessage}
            className="w-9 h-9 bg-[#c0c1ff] text-[#1000a9] rounded-full flex items-center justify-center shadow-lg active:bg-[#8083ff] active:scale-90 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: ICON_FILLED }}>send</span>
          </button>
        </div>
      </div>

      <nav className="shrink-0 bg-[#303541] border-t border-[#464554]/30 flex justify-around items-center min-h-[56px] pb-[env(safe-area-inset-bottom)] px-4">
        <div className="flex flex-col items-center justify-center text-[#4cd7f6] bg-[rgba(76,215,246,0.1)] rounded-xl px-4 py-1">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ICON_FILLED }}>chat</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Chat</span>
        </div>
        <Link href="/mobile/kb" className="flex flex-col items-center justify-center text-[#c7c4d7] active:text-[#4cd7f6] transition-colors">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ICON_BASE }}>storage</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Data</span>
        </Link>
        <Link href="/mobile/home" className="flex flex-col items-center justify-center text-[#c7c4d7] active:text-[#4cd7f6] transition-colors">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ICON_BASE }}>home</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Home</span>
        </Link>
        <div className="flex flex-col items-center justify-center text-[#c7c4d7]">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ICON_BASE }}>person</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Profile</span>
        </div>
      </nav>

      {activeCitations && (
        <div
          className="absolute inset-0 z-50 flex items-end"
          style={{ backgroundColor: 'rgba(14,19,30,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div onClick={handleCloseCitations} className="absolute inset-0" />
          <div className="relative w-full bg-[#1b202b] rounded-t-3xl border-t border-[#464554]/30 p-5 z-10 pb-[max(env(safe-area-inset-bottom),20px)]">
            <div className="w-10 h-1 bg-[#464554] rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[17px] font-semibold text-[#dee2f2]" style={{ fontFamily: 'Geist, sans-serif' }}>Source Citations</h3>
              <button onTouchEnd={handleCloseCitations} onClick={handleCloseCitations} className="p-1 active:scale-90 transition-transform">
                <span className="material-symbols-outlined text-[#c7c4d7]" style={{ fontVariationSettings: ICON_BASE }}>close</span>
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto chat-scroll">
              {activeCitations.map((citation, index) => (
                <div key={index} className="p-3 bg-[#171c27] border border-[#464554]/20 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[#4cd7f6] font-medium" style={{ fontFamily: 'Geist, sans-serif' }}>{citation.title}</span>
                    <span className="text-[10px] bg-[#4cd7f6]/10 px-1.5 py-0.5 rounded text-[#4cd7f6]" style={{ fontFamily: 'monospace' }}>
                      Sim: {citation.similarity}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#c7c4d7] italic" style={{ fontFamily: 'Inter, sans-serif' }}>{citation.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
