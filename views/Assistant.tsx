
import React, { useState, useRef, useEffect } from 'react';
import { securityService } from '../geminiService.ts';
import { Message } from '../types.ts';
import { Button } from '../components/Button.tsx';

const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Aegis AI online. I am optimized for deep security analysis and privacy consulting. How can I assist your operations today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await securityService.analyzeDeeply(input);
      setMessages(prev => [...prev, { role: 'model', text: response, timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: Neural link disrupted. Failed to compute security logic.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-cyber-gray/50 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
             <i className="fas fa-robot text-neon-cyan text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase">Security Analyst</h3>
            <p className="text-[9px] text-neon-green uppercase animate-pulse">Deep Thought Mode Active</p>
          </div>
        </div>
        <div className="text-[10px] text-gray-500 font-mono">
          MODEL: GEMINI_3_PRO_THINKING
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-neon-cyan/10 border border-neon-cyan/20 text-white rounded-tr-none' 
                : 'bg-black/50 border border-white/5 text-gray-300 rounded-tl-none'
            }`}>
              <div className="prose prose-invert prose-sm">
                {msg.text.split('\n').map((line, j) => <p key={j} className="mb-2 last:mb-0">{line}</p>)}
              </div>
              <div className="text-[9px] mt-2 opacity-30 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-black/50 border border-white/5 p-3 rounded-xl rounded-tl-none flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                <div className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce [animation-delay:-0.2s]"></div>
              </div>
              <span className="text-[10px] uppercase text-gray-500 font-mono">Analyzing vectors...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about encryption, vulnerabilities, or privacy protocols..."
            className="flex-1 bg-cyber-black border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-neon-cyan focus:outline-none transition-all placeholder:text-gray-700"
          />
          <Button 
            onClick={handleSend} 
            loading={loading}
            className="shrink-0"
          >
            <i className="fas fa-paper-plane"></i>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
