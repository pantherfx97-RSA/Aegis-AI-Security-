
import React, { useState, useRef, useEffect } from 'react';
import { securityService } from '../geminiService.ts';

const VoiceCore: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const decodeAudio = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const encodePCM = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (inputAudioCtxRef.current) inputAudioCtxRef.current.close();
    if (outputAudioCtxRef.current) outputAudioCtxRef.current.close();
    setIsActive(false);
    setIsConnecting(false);
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = securityService.connectVoice({
        onopen: () => {
          setIsActive(true);
          setIsConnecting(false);
          const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
          const processor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            sessionPromise.then(s => s.sendRealtimeInput({ 
              media: { data: encodePCM(inputData), mimeType: 'audio/pcm;rate=16000' } 
            }));
          };
          source.connect(processor);
          processor.connect(inputAudioCtxRef.current!.destination);
        },
        onmessage: async (msg: any) => {
          const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64 && outputAudioCtxRef.current) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtxRef.current.currentTime);
            const buffer = await decodeAudioData(decodeAudio(audioBase64), outputAudioCtxRef.current);
            const source = outputAudioCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(outputAudioCtxRef.current.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => stopSession(),
        onerror: () => stopSession()
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      stopSession();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-14rem)] flex flex-col items-center justify-center space-y-12 animate-fade-in relative">
      <div className="absolute top-0 left-0 right-0 text-center">
        <h2 className="text-xl font-black uppercase tracking-[0.4em] text-white">Neural_Comm_Link</h2>
        <p className="text-[10px] text-neon-cyan font-mono uppercase tracking-widest mt-2">Bi-Directional PCM Pipeline v4.1</p>
      </div>

      <div className="relative group">
        {/* Animated Waveform HUD */}
        <div className={`w-64 h-64 rounded-full border-2 transition-all duration-700 flex items-center justify-center relative ${
          isActive ? 'border-neon-cyan shadow-neon scale-110' : 'border-white/10 grayscale opacity-50'
        }`}>
          <div className={`absolute inset-0 rounded-full border border-neon-cyan/20 ${isActive ? 'animate-[ping_3s_linear_infinite]' : ''}`}></div>
          <div className={`absolute inset-4 rounded-full border border-neon-purple/20 ${isActive ? 'animate-[ping_4s_linear_infinite]' : ''}`}></div>
          
          <div className="flex items-center gap-1.5 h-12">
            {[...Array(isActive ? 12 : 5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1 rounded-full bg-gradient-to-t from-neon-cyan to-neon-purple transition-all duration-300 ${
                  isActive ? 'animate-[wave_1s_ease-in-out_infinite]' : 'h-2'
                }`}
                style={{ animationDelay: `${i * 0.1}s`, height: isActive ? `${Math.random() * 40 + 10}px` : '4px' }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center space-y-6">
        <div className="px-6 py-2 rounded-full border border-white/5 bg-cyber-gray/50 backdrop-blur-md">
           <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
             {isActive ? 'STATUS: UPLINK_ESTABLISHED' : isConnecting ? 'STATUS: INITIALIZING_NEURAL_LINK...' : 'STATUS: COMM_LINK_IDLE'}
           </p>
        </div>

        <button 
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all duration-500 shadow-2xl ${
            isActive ? 'bg-threat-high text-white hover:rotate-90' : 'bg-neon-cyan text-black hover:scale-110'
          }`}
        >
          {isConnecting ? <i className="fas fa-circle-notch animate-spin"></i> : <i className={`fas ${isActive ? 'fa-phone-slash' : 'fa-microphone-lines'}`}></i>}
        </button>

        <div className="max-w-xs text-[10px] text-gray-600 font-mono uppercase leading-relaxed tracking-wider">
          Direct low-latency access to AEGIS AI SECURITY Intelligence. Vault-encrypted audio processing remains on-device.
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2.5); }
        }
      `}</style>
    </div>
  );
};

export default VoiceCore;
