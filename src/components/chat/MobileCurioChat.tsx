import React, { useRef, useEffect, useState, memo } from 'react';
import { Message } from "@/lib/storage";

const ms = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
const msFill = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";

interface MobileCurioChatProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  onNavigate: (view: 'home' | 'chat' | 'kb') => void;
  userEmail: string;
  generationState: string;
}

const ConversationBubble = memo(function ConversationBubble({ message, userEmail }: { message: Message, userEmail: string }) {
  const isAssistant = message.role === 'assistant';
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isAssistant) {
    return (
      <div className="flex items-end gap-2 max-w-[88%] mb-6">
        <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-slate-100 overflow-hidden shadow-sm mb-1">
          <img src="/mobile-assets/curio.png" alt="Curio" className="w-full h-full object-contain p-0.5" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-bl-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="text-[14px] leading-relaxed text-slate-800 font-medium whitespace-pre-wrap">
              {message.content || <span className="animate-pulse">Thinking...</span>}
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium ml-2 uppercase tracking-wide">
            {timestamp}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 ml-auto max-w-[88%] mb-6 justify-end">
      <div className="flex flex-col items-end gap-1">
        <div className="bg-[#EBF3FF] p-4 rounded-3xl rounded-br-xl">
          <div className="text-[14px] leading-relaxed text-slate-800 font-medium whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium mr-2 uppercase tracking-wide">
          {timestamp}
        </span>
      </div>
      <div className="w-6 h-6 rounded-full bg-blue-500 overflow-hidden shadow-sm mb-1 shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
         {userEmail?.[0]?.toUpperCase() || "U"}
      </div>
    </div>
  );
});

export function MobileCurioChat({ messages, onSendMessage, onNavigate, userEmail, generationState }: MobileCurioChatProps) {
  const messageListRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  useEffect(() => {
    const listEl = messageListRef.current;
    if (listEl) listEl.scrollTop = listEl.scrollHeight;
  }, [messages, generationState]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
    setIsKeyboardMode(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFCFF] text-slate-900 font-sans relative overflow-hidden">
      
      <header className="shrink-0 px-4 py-4 flex justify-between items-center z-10 bg-white/80 backdrop-blur-md">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-1 text-slate-800 active:opacity-50 transition-opacity">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: ms }}>arrow_back_ios_new</span>
          <span className="font-bold text-[16px] tracking-tight">Curio AI</span>
        </button>
        <button className="text-slate-500 p-1 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: ms }}>more_horiz</span>
        </button>
      </header>

      <div ref={messageListRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6 scroll-smooth">
        {messages.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-60">
             <img src="/mobile-assets/curio.png" alt="Curio Robot" className="w-24 h-24 object-contain mb-4" />
             <p className="text-slate-500 text-sm font-medium">I'm Curio, your intelligent assistant. How can I help you today?</p>
           </div>
        ) : (
          messages.map(msg => (
            <ConversationBubble key={msg.id} message={msg} userEmail={userEmail} />
          ))
        )}
      </div>

      <div className="shrink-0 px-6 pt-4 pb-[max(env(safe-area-inset-bottom),24px)] flex flex-col gap-4 bg-gradient-to-t from-white via-white to-transparent z-20">
        
        {isKeyboardMode ? (
          <div className="flex items-end gap-2 w-full bg-white border border-slate-200 rounded-3xl p-2 shadow-lg">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask Curio anything..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-3 px-4 text-slate-800 placeholder:text-slate-400 text-[15px]"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-10 h-10 shrink-0 bg-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
            >
               <span className="material-symbols-outlined" style={{ fontVariationSettings: msFill }}>arrow_upward</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center w-full">
            <button onClick={() => setIsKeyboardMode(true)} className="w-10 h-10 flex items-center justify-center text-slate-500 bg-white border border-slate-100 rounded-full shadow-sm active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: ms }}>keyboard</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="absolute w-[80px] h-[80px] rounded-full border-2 border-blue-400/40 animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="absolute w-[66px] h-[66px] rounded-full bg-blue-100/50 blur-md"></div>
              
              <button 
                onClick={() => setIsKeyboardMode(true)}
                className="relative w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)] active:scale-95 transition-transform z-10"
              >
                 <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: msFill }}>mic</span>
              </button>
            </div>

            <button onClick={() => onNavigate('home')} className="w-10 h-10 flex items-center justify-center text-slate-500 bg-white border border-slate-100 rounded-full shadow-sm active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: ms }}>close</span>
            </button>
          </div>
        )}
        
      </div>
      
    </div>
  );
}
