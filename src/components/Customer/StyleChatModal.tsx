import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Layers, 
  Scissors, 
  Sparkles,
  Phone,
  Video,
  Play,
  Pause,
  Image as ImageIcon,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { ChatMessage, MeasurementSheet } from '../../types';

interface StyleChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  tailorName: string;
  tailorAvatar?: string;
  customerName: string;
  customerAvatar?: string;
  measurements: MeasurementSheet;
  messages: ChatMessage[];
  onSendMessage: (text: string, type?: 'TEXT' | 'IMAGE' | 'MEASUREMENT_CARD' | 'FABRIC_SWATCH' | 'AUDIO_VOICE_NOTE', extra?: any) => void;
  onOpenFabricLibrary?: () => void;
}

export const StyleChatModal: React.FC<StyleChatModalProps> = ({
  isOpen,
  onClose,
  tailorName,
  tailorAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  customerName,
  customerAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  measurements,
  messages,
  onSendMessage,
  onOpenFabricLibrary,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    onSendMessage(userText, 'TEXT');
    setInputText('');

    // Simulate real-time Master Darzi reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Ji bilkul! Master Darzi notes noted. We will adjust the cutting and share photo proof right away.';
      const lower = userText.toLowerCase();
      if (lower.includes('margin') || lower.includes('fitting')) {
        replyText = 'Haanji Ananya ji! We always keep 2.5-inch inner alteration margin inside both sides of the choli/bodice with soft cotton piping.';
      } else if (lower.includes('photo') || lower.includes('swatch') || lower.includes('fabric')) {
        replyText = 'Sending you a macro photograph of the pure raw silk fabric under natural daylight. The gold dabka zari shine is breathtaking!';
      } else if (lower.includes('neck') || lower.includes('dori') || lower.includes('latkan')) {
        replyText = 'Confirmed! Back neck depth set to 9.5 inches with handmade matching zardozi flower latkans on the dori.';
      } else if (lower.includes('delivery') || lower.includes('date') || lower.includes('dispatch')) {
        replyText = 'Your ensemble is on schedule for dispatch via BlueDart Couture Air. We will provide live tracking as soon as it is picked up!';
      }
      
      onSendMessage(replyText, 'TEXT');
    }, 1200);
  };

  const handleQuickQuestion = (promptText: string) => {
    onSendMessage(promptText, 'TEXT');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      onSendMessage('Bahut khoob! We have noted this specification into your order card and informed our karigars.', 'TEXT');
    }, 1100);
  };

  const handleAttachMeasurements = () => {
    onSendMessage(`Attached 14-point Indian measurement sheet: Bust ${measurements.bust}", Waist ${measurements.waist}", Blouse Length ${measurements.blouseLength || 14.5}", Front Neck ${measurements.frontNeckDepth || 7.5}", Back Neck ${measurements.backNeckDepth || 9.5}", Lehenga Length ${measurements.lehengaLength || 42}".`, 'MEASUREMENT_CARD');
  };

  const handleAttachFabricSwatch = () => {
    onSendMessage('Bangalore Pure Raw Silk (360 GSM) - Rani Pink Swatch Request', 'FABRIC_SWATCH');
  };

  const togglePlayAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      setTimeout(() => setPlayingAudioId(null), 6000);
    }
  };

  return (
    <div 
      id="chat-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="chat-modal-container"
        className="bg-[#FFFDF9] rounded-2xl max-w-xl w-full h-[620px] max-h-[92vh] border border-[#E8DFC8] shadow-2xl flex flex-col overflow-hidden my-auto"
      >
        {/* Chat Header */}
        <div className="p-4 bg-gradient-to-r from-[#3D2C24] via-[#523A2E] to-[#3D2C24] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={tailorAvatar}
                alt={tailorName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37] shadow-sm"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#3D2C24]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif text-sm sm:text-base font-bold text-white">{tailorName}</h3>
                <span className="text-[10px] bg-[#D4AF37] text-[#3D2C24] px-1.5 py-0.2 rounded font-bold">
                  Master Darzi
                </span>
              </div>
              <p className="text-[11px] text-[#FAF7F2]/80 flex items-center space-x-1">
                <Scissors className="w-3 h-3 text-[#D4AF37]" />
                <span>Chandni Chowk Atelier • Real-Time Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="close-chat-modal-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Indian Consultation Prompt Chips */}
        <div className="px-3 py-2 bg-[#FAF7F2] border-b border-[#E8DFC8] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <button
            id="chat-share-measurements-btn"
            onClick={handleAttachMeasurements}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-[#D9CEBA] text-[#3D2C24] hover:bg-[#F2ECE1] shrink-0 font-semibold text-[10px] shadow-xs cursor-pointer"
          >
            <Layers className="w-3 h-3 text-[#C72C48]" />
            <span>Share 14-Point Measurements</span>
          </button>
          {onOpenFabricLibrary && (
            <button
              id="chat-open-fabric-library-btn"
              onClick={onOpenFabricLibrary}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#3D2C24] text-[#FAF7F2] hover:bg-[#2D2825] shrink-0 font-semibold text-[10px] shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>Browse High-End Fabric Library</span>
            </button>
          )}
          <button
            id="chat-req-swatch-btn"
            onClick={handleAttachFabricSwatch}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#C72C48]/10 border border-[#C72C48]/30 text-[#C72C48] hover:bg-[#C72C48]/20 shrink-0 font-semibold text-[10px] shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Request Silk Swatch Proof</span>
          </button>
          <button
            onClick={() => handleQuickQuestion('Please ensure 2.5-inch side margin in choli for alterations.')}
            className="px-3 py-1 rounded-full bg-white border border-[#D9CEBA] text-[#5A4638] hover:bg-[#F2ECE1] shrink-0 text-[10px] font-medium"
          >
            +2.5" Alteration Margin
          </button>
          <button
            onClick={() => handleQuickQuestion('Can you share a quick photo of the zardozi embroidery work?')}
            className="px-3 py-1 rounded-full bg-white border border-[#D9CEBA] text-[#5A4638] hover:bg-[#F2ECE1] shrink-0 text-[10px] font-medium"
          >
            Photo of Handwork
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF7F2]/40">
          {messages.map((msg) => {
            const isCustomer = msg.senderRole === 'customer';
            const messageBody = msg.text || msg.content || '';

            return (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 ${isCustomer ? 'justify-end' : 'justify-start'}`}
              >
                {!isCustomer && (
                  <img
                    src={tailorAvatar}
                    alt={tailorName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover mb-1 shrink-0 border border-[#D4AF37]"
                  />
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isCustomer
                      ? 'bg-[#3D2C24] text-[#FAF7F2] rounded-br-xs shadow-sm'
                      : 'bg-white text-[#3D2C24] border border-[#E8DFC8] rounded-bl-xs shadow-sm'
                  }`}
                >
                  {/* Audio Voice Note Card */}
                  {msg.type === 'AUDIO_VOICE_NOTE' && (
                    <div className="mb-2 p-2.5 bg-black/10 rounded-xl border border-black/10">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            id={`play-voice-${msg.id}`}
                            onClick={() => togglePlayAudio(msg.id)}
                            className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#3D2C24] flex items-center justify-center shadow hover:scale-105 transition-transform"
                          >
                            {playingAudioId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          </button>
                          <div>
                            <div className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1">
                              <Volume2 className="w-3 h-3" />
                              Voice Note ({msg.duration || '0:34'})
                            </div>
                            <div className="text-[10px] opacity-80">
                              Master Rafiq explaining choli margins & silk
                            </div>
                          </div>
                        </div>

                        {/* Animated waveform bars */}
                        <div className="flex items-center gap-0.5 h-6 px-1">
                          {[3, 6, 9, 5, 8, 4, 7, 3, 6, 8, 5, 3].map((height, i) => (
                            <span 
                              key={i} 
                              className={`w-1 rounded-full bg-[#D4AF37] transition-all ${
                                playingAudioId === msg.id ? 'animate-pulse' : 'opacity-60'
                              }`}
                              style={{ height: `${height * (playingAudioId === msg.id ? 2.2 : 1.5)}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Measurement Card */}
                  {msg.type === 'MEASUREMENT_CARD' ? (
                    <div className="space-y-1 bg-black/10 p-2.5 rounded-xl">
                      <div className="flex items-center space-x-1 font-bold text-[#D4AF37]">
                        <Layers className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase tracking-wider">14-Point Measurement Sheet</span>
                      </div>
                      <p className="text-[11px] font-normal leading-relaxed">{messageBody}</p>
                    </div>
                  ) : msg.type === 'FABRIC_SWATCH' ? (
                    <div className="space-y-1 bg-black/10 p-2.5 rounded-xl">
                      <div className="flex items-center space-x-1 font-bold text-[#D4AF37]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase tracking-wider">Fabric Swatch & Video Request</span>
                      </div>
                      <p className="text-[11px] font-normal leading-relaxed">{messageBody}</p>
                    </div>
                  ) : (
                    <p className="font-normal">{messageBody}</p>
                  )}

                  {/* Swatch attachment preview */}
                  {msg.attachmentData && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-[#3D2C24] space-y-2">
                      {msg.attachmentData.imageUrl && (
                        <div className="relative h-24 w-full rounded-lg overflow-hidden border border-[#E8DFC8]">
                          <img
                            src={msg.attachmentData.imageUrl}
                            alt={msg.attachmentData.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          {msg.attachmentData.pricePerMeterINR && (
                            <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/75 text-white text-[9px] font-mono">
                              ₹{Number(msg.attachmentData.pricePerMeterINR).toLocaleString('en-IN')}/m
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: msg.attachmentData.hex }}
                        />
                        <span className="font-bold text-[11px]">{msg.attachmentData.title}</span>
                      </div>
                      <div className="text-[10px] text-[#5A4638] space-y-0.5">
                        <div><span className="font-semibold">Composition:</span> {msg.attachmentData.composition}</div>
                        <div><span className="font-semibold">Weight:</span> {msg.attachmentData.weight} • {msg.attachmentData.origin}</div>
                      </div>
                    </div>
                  )}

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-[#D9CEBA]">
                      <img src={msg.attachments[0]} alt="Attachment" referrerPolicy="no-referrer" className="w-full h-32 object-cover" />
                    </div>
                  )}

                  <span className={`text-[9px] block mt-1 text-right ${isCustomer ? 'text-[#FAF7F2]/70' : 'text-[#8C7A6B]'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Real-time Typing Indicator */}
          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-[#5A4638]">
              <img
                src={tailorAvatar}
                alt={tailorName}
                className="w-6 h-6 rounded-full object-cover border border-[#D4AF37]"
              />
              <div className="bg-white px-3 py-2 rounded-2xl border border-[#E8DFC8] flex items-center space-x-1.5 shadow-xs">
                <span className="text-[11px] font-medium text-[#7D6B5D]">{tailorName} is typing</span>
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-[#C72C48] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#C72C48] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#C72C48] rounded-full animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Footer */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E8DFC8] flex items-center space-x-2">
          <input
            id="chat-input-text"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Ustad Rafiq about choli fitting, zardozi work, delivery..."
            className="flex-1 px-4 py-2.5 rounded-full bg-[#FAF7F2] border border-[#D9CEBA] text-xs text-[#3D2C24] placeholder-[#8C7A6B] focus:outline-none focus:border-[#C72C48] font-normal"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-full bg-[#C72C48] text-white hover:bg-[#A91E38] transition-all disabled:opacity-40 cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
