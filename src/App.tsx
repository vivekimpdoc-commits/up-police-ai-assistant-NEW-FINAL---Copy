import { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Bot, Shield, Phone, Info, ExternalLink, Loader2, Menu, X, 
  Search, MessageSquare, History, Settings, Bell, HelpCircle, ChevronRight, 
  Scale, Mic, MicOff, Image as ImageIcon, Volume2, AlertTriangle, Languages,
  Download, Trash2, Camera
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { sendMessage, generateSpeech, type Message } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'EN' ? 'en-US' : 'hi-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (text?: string) => {
    const messageToSend = text || input.trim();
    if ((!messageToSend && !selectedImage) || isLoading) return;

    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    
    setMessages(prev => [...prev, { role: 'user', text: messageToSend || "Shared an image", image: currentImage || undefined }]);
    setIsLoading(true);

    try {
      const response = await sendMessage(messages, messageToSend, currentImage || undefined);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = async (text: string) => {
    const audioData = await generateSpeech(text);
    if (audioData) {
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audio.play();
    }
  };

  const exportChat = () => {
    const chatText = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UP_Police_Chat_${new Date().getTime()}.txt`;
    a.click();
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
    }
  };

  const suggestedQuestions = [
    "Latest news from UP Police",
    "How to file an e-FIR?",
    "Emergency contact numbers",
    "Check Character Certificate status",
    "Women Powerline 1090 details",
    "Cyber Crime reporting process"
  ];

  const quickLinks = [
    { label: 'Emergency 112', icon: Phone, color: 'text-police-crimson', bg: 'bg-red-50', url: 'https://uppolice.gov.in/article/en/up-112' },
    { label: 'Latest News', icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50', action: () => handleSend("Show me the latest news and press releases from UP Police.") },
    { label: 'File e-FIR', icon: Shield, color: 'text-police-navy', bg: 'bg-blue-50', url: 'https://uppolice.gov.in/article/en/e-fir' },
    { label: 'Women Powerline', icon: Phone, color: 'text-pink-600', bg: 'bg-pink-50', url: 'https://uppolice.gov.in/article/en/women-power-line-1090' },
    { label: 'Citizen Services', icon: Scale, color: 'text-police-gold', bg: 'bg-amber-50', url: 'https://uppolice.gov.in/article/en/citizen-services' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden font-sans relative">
      <div className="atmosphere" />
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-police-navy/95 backdrop-blur-xl text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none border-r border-white/5",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/10 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-police-saffron to-orange-600 p-2 rounded-xl shadow-lg shadow-police-saffron/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none text-white">UP Police</h2>
                <p className="text-[10px] text-police-saffron mt-1 uppercase tracking-widest font-bold">AI Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
            <div className="px-3">
              <button 
                onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] transition-all shadow-xl relative overflow-hidden group",
                  isEmergencyMode 
                    ? "bg-red-600 text-white animate-pulse" 
                    : "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <AlertTriangle className="w-4 h-4" />
                {isEmergencyMode ? "Emergency Active" : "Emergency SOS"}
              </button>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 px-3">Services</h3>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  link.url ? (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-2xl transition-all group relative overflow-hidden border border-transparent hover:border-white/10"
                    >
                      <div className={cn("p-2 rounded-xl transition-colors shadow-inner", link.bg)}>
                        <link.icon className={cn("w-4 h-4", link.color)} />
                      </div>
                      <span className="font-semibold">{link.label}</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </a>
                  ) : (
                    <button
                      key={link.label}
                      onClick={link.action}
                      className="w-full flex items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-2xl transition-all group relative overflow-hidden border border-transparent hover:border-white/10"
                    >
                      <div className={cn("p-2 rounded-xl transition-colors shadow-inner", link.bg)}>
                        <link.icon className={cn("w-4 h-4", link.color)} />
                      </div>
                      <span className="font-semibold">{link.label}</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </button>
                  )
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 px-3">Controls</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-2xl transition-all border border-transparent hover:border-white/10"
                >
                  <div className="p-2 bg-white/5 rounded-xl">
                    <Languages className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="font-semibold">Language: {language === 'EN' ? 'English' : 'Hindi'}</span>
                </button>
                <button 
                  onClick={exportChat}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-2xl transition-all border border-transparent hover:border-white/10"
                >
                  <div className="p-2 bg-white/5 rounded-xl">
                    <Download className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="font-semibold">Export Chat</span>
                </button>
                <button 
                  onClick={clearChat}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-2xl transition-all border border-transparent hover:border-white/10"
                >
                  <div className="p-2 bg-white/5 rounded-xl">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="font-semibold">Clear History</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/10 bg-black/10">
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-police-saffron" />
                <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Disclaimer</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">
                Official UP Police AI Assistant. For immediate help, dial 112.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-transparent lg:m-4 lg:rounded-[2.5rem] overflow-hidden z-10">
        <div className="absolute inset-0 glass-panel lg:rounded-[2.5rem] -z-10" />
        
        {/* Header */}
        <header className="h-20 bg-white/40 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 -ml-2 text-police-navy hover:bg-white/20 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="font-display font-bold text-police-navy tracking-tight text-lg">UP Police AI</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-police-saffron rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-police-navy/40 uppercase tracking-widest">Advanced Mode</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isEmergencyMode && (
              <>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-police-crimson text-white rounded-xl text-xs font-bold animate-pulse shadow-lg shadow-police-crimson/30">
                  <Phone className="w-4 h-4" />
                  DIAL 112 NOW
                </div>
                <button 
                  onClick={() => setIsEmergencyMode(false)}
                  className="md:hidden p-2.5 bg-police-crimson text-white rounded-xl animate-pulse shadow-lg shadow-police-crimson/30"
                >
                  <AlertTriangle className="w-5 h-5" />
                </button>
              </>
            )}
            <button className="p-2.5 text-police-navy/40 hover:text-police-navy hover:bg-police-navy/5 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-police-crimson border-2 border-white rounded-full" />
            </button>
            <div className="h-8 w-[1px] bg-police-navy/10 mx-1 hidden sm:block" />
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-xl bg-police-navy/5 flex items-center justify-center border border-police-navy/10">
                <User className="w-5 h-5 text-police-navy/40" />
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 custom-scrollbar relative"
        >
          {/* Background Watermark Logo */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] overflow-hidden select-none">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Uttar_Pradesh_Police_Logo.png/800px-Uttar_Pradesh_Police_Logo.png" 
              alt="UP Police Watermark" 
              className="w-full max-w-2xl transform scale-110"
              referrerPolicy="no-referrer"
            />
          </div>

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-gradient-to-br from-police-navy to-[#003366] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-police-navy/20 relative"
              >
                <Shield className="w-12 h-12 text-white" />
                <div className="absolute -bottom-2 -right-2 bg-police-saffron p-2 rounded-xl shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <div className="space-y-3">
                <h2 className="text-4xl font-display font-extrabold text-police-navy tracking-tight">UP Police AI Assistant</h2>
                <p className="text-police-navy/60 text-sm leading-relaxed max-w-md mx-auto font-medium">
                  Official information strictly from <a href="https://uppolice.gov.in" target="_blank" rel="noopener noreferrer" className="text-police-navy font-bold hover:underline decoration-police-navy/30">uppolice.gov.in</a>.
                  Advanced multimodal assistant for citizen services.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {suggestedQuestions.map((q, i) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSend(q)}
                    className="flex items-center justify-between p-5 glass-card rounded-2xl text-left text-sm font-semibold text-police-navy hover:bg-white/60 hover:border-police-crimson/30 transition-all group"
                  >
                    {q}
                    <ChevronRight className="w-4 h-4 text-police-navy/20 group-hover:text-police-crimson transition-colors" />
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4 sm:gap-6",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border relative",
                      msg.role === 'user' 
                        ? "bg-police-navy/10 border-police-navy/20 text-police-navy" 
                        : "bg-police-crimson/10 border-police-crimson/20 text-police-crimson"
                    )}>
                      {msg.role === 'model' && (
                        <div className="absolute inset-0 bg-police-crimson/20 blur-lg rounded-full -z-10 animate-pulse" />
                      )}
                      {msg.role === 'user' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Shield className="w-5 h-5" />
                      )}
                    </div>
                    <div className={cn(
                      "flex flex-col space-y-2 max-w-[90%] sm:max-w-[75%]",
                      msg.role === 'user' ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "p-4 sm:p-5 rounded-3xl text-sm leading-relaxed shadow-sm relative group",
                        msg.role === 'user' 
                          ? "bg-police-navy/5 text-slate-800 border border-police-navy/10 rounded-tr-none" 
                          : "bg-white/60 backdrop-blur-md text-slate-800 border border-white/40 rounded-tl-none"
                      )}>
                        {msg.image && (
                          <img 
                            src={msg.image} 
                            alt="Uploaded" 
                            className="max-w-full h-auto rounded-xl mb-3 border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="markdown-body">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                        {msg.role === 'model' && (
                          <button 
                            onClick={() => speakMessage(msg.text)}
                            className="absolute -right-12 top-0 p-2 text-slate-400 hover:text-police-navy opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                        {msg.role === 'user' ? 'Citizen' : 'UP Police AI'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex gap-4 sm:gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-police-saffron animate-pulse" />
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-police-saffron rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-police-saffron rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-police-saffron rounded-full animate-bounce" />
                    </div>
                    <span className="text-xs font-medium text-slate-400">UP Police is analyzing...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-10 bg-white/20 backdrop-blur-md border-t border-white/20 shrink-0 relative z-10">
          <div className="max-w-4xl mx-auto">
            {selectedImage && (
              <div className="mb-4 flex items-center gap-3 p-2 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl w-fit shadow-sm">
                <img src={selectedImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-white/40 rounded-full transition-colors">
                  <X className="w-4 h-4 text-police-navy/60" />
                </button>
              </div>
            )}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-police-navy/20 to-police-saffron/20 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <div className={cn("relative flex items-end gap-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2rem] p-2 pl-4 focus-within:border-police-navy/30 focus-within:bg-white/80 transition-all duration-300 shadow-lg")}>
                <div className="flex items-center gap-1 pb-1.5">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-police-navy/40 hover:text-police-navy hover:bg-white/40 rounded-xl transition-all"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  <button 
                    onClick={toggleListening}
                    className={cn(
                      "p-2.5 rounded-xl transition-all",
                      isListening ? "bg-police-crimson/10 text-police-crimson animate-pulse" : "text-police-navy/40 hover:text-police-crimson hover:bg-white/40"
                    )}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isListening ? "Listening..." : "Type or use voice..."}
                  className="flex-1 bg-transparent border-none py-4 text-sm focus:outline-none resize-none max-h-40 custom-scrollbar text-police-navy placeholder:text-police-navy/30 font-semibold"
                />
                <div className="flex items-center gap-2 pb-1.5 pr-1.5">
                  <button
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && !selectedImage) || isLoading}
                    className="p-3 bg-police-navy text-white rounded-2xl hover:bg-[#003366] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-police-navy/20 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Shield className="w-3 h-3" />
                  <span>Multimodal AI</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Volume2 className="w-3 h-3" />
                  <span>Voice Enabled</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Version 4.0 • Official UP Police AI
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-police-navy/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
