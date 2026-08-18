import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, HelpCircle } from 'lucide-react';
import { askAppSupport } from '../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const SUGGESTIONS = [
  "How does mood detection work?",
  "Is my video data private?",
  "Why did my focus score drop?",
  "How do posture alerts work?",
  "How do I see past sessions?"
];

const AppSupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('studysense_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    } else {
      setMessages([{
        id: 'init', 
        role: 'model', 
        text: "Hello! I'm your StudySense guide. I can explain how the features work or help you troubleshoot. What would you like to know?"
      }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('studysense_chat_history', JSON.stringify(messages.slice(-20)));
    }
    if (scrollRef.current) {
        setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, text: m.text }));
      const response = await askAppSupport(text, history);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: response }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
       {/* Trigger Button */}
       {!isOpen && (
         <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 group flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-full shadow-lg shadow-cyan-500/30 border border-cyan-400/50 hover:scale-110 transition-transform"
            aria-label="Open App Support Chat"
         >
            <div className="absolute right-full mr-3 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              App Help
            </div>
            <HelpCircle className="w-7 h-7 text-white" />
         </button>
       )}

       {/* Chat Panel */}
       {isOpen && (
         <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-[350px] h-[500px] max-w-[calc(100vw-32px)] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out] overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700">
               <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                     <Bot className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">StudySense Support</h3>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
                    </p>
                  </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/30" ref={scrollRef}>
                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 mb-6">
                   {SUGGESTIONS.map(s => (
                      <button 
                        key={s}
                        onClick={() => handleSend(s)}
                        className="text-xs bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 px-3 py-1.5 rounded-full transition-colors text-left"
                      >
                        {s}
                      </button>
                   ))}
                </div>

                {messages.map((msg) => (
                   <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                         msg.role === 'user' 
                         ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none' 
                         : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                      }`}>
                         {msg.text}
                      </div>
                   </div>
                ))}
                {loading && (
                   <div className="flex justify-start">
                      <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                         <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></div>
                         <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></div>
                         <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></div>
                      </div>
                   </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-700 bg-slate-900">
               <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                    placeholder="Ask about features..."
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                  <button 
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || loading}
                    className="absolute right-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-700 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
       )}
    </>
  );
};
export default AppSupportChat;