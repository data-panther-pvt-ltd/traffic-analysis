
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Bot, User, Send, MapPin, Clock, BarChart3, Sparkles, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { FASTAPI_BASE_URL } from "@/../constant/constansts";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  message: string;
  timestamp: number;
}

// Simple markdown to HTML converter
const convertMarkdownToHtml = (markdown: string): string => {
  let html = markdown;
  
  // Convert headers
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-md font-semibold mb-2 text-gray-800">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mb-2 text-gray-800">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-3 text-gray-800">$1</h1>');
  
  // Convert bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="font-semibold">$1</strong>');
  
  // Convert italic text
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');
  
  // Convert inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // Convert code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded-lg mt-2 mb-2 overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>');
  
  // Convert unordered lists
  html = html.replace(/^\* (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>');
  html = html.replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>');
  
  // Convert ordered lists
  html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>');
  
  // Wrap consecutive list items in ul tags
  html = html.replace(/(<li[^>]*>.*<\/li>\s*)+/g, '<ul class="mb-2">$&</ul>');
  
  // Convert line breaks
  html = html.replace(/\n\n/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');
  
  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return html;
};

export default function TrafficChatBot() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, language, locale } = useI18n();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatLog, streamingMessage]);

  // Memoized API endpoint
  const apiEndpoint = useMemo(() => 
    `${process.env.NEXT_PUBLIC_API_URL ?? FASTAPI_BASE_URL}/chat`,
    []
  );

  // Streaming text animation
  const streamText = useCallback(async (text: string) => {
    setIsStreaming(true);
    setStreamingMessage("");
    
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const currentText = words.slice(0, i + 1).join(' ');
      setStreamingMessage(currentText);
      
      // Variable delay for more natural typing
      const delay = Math.random() * 100 + 50; // 50-150ms delay
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setIsStreaming(false);
    return text;
  }, []);

  // Optimized message sending with streaming
  const sendMessage = useCallback(async () => {
    const userMessage = input.trim();
    if (!userMessage || isLoading || isStreaming) return;

    const messageId = Date.now().toString();
    const userChatMessage: ChatMessage = {
      id: messageId,
      sender: "user",
      message: userMessage,
      timestamp: Date.now()
    };

    // Update UI immediately
    setChatLog(prev => [...prev, userChatMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": language,
        },
        body: JSON.stringify({ query: userMessage, language }),
      });

      let reply = "Sorry, no response";

      if (response.ok) {
        const contentType = response.headers.get("Content-Type");

        if (contentType?.includes("application/json")) {
          const data = await response.json();
          reply =
            data.ai_analysis ||
            data.response ||
            data.reply ||
            data.message ||
            data.answer ||
            data.result ||
            (data.data && data.data.response) ||
            "No valid response received";
          
          // Clean up reply if it's still JSON
          if (typeof reply === 'object') {
            reply = JSON.stringify(reply);
          }
        } else {
          reply = await response.text();
        }
      } else {
        reply = `Error: ${response.status} - ${response.statusText}`;
      }

      setIsLoading(false);
      
      // Stream the response
      const finalReply = await streamText(reply);
      
      // Add final message to chat log
      const botChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        message: finalReply,
        timestamp: Date.now()
      };

      setChatLog(prev => [...prev, botChatMessage]);
      setStreamingMessage("");
      
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
      
      const errorMessage = "Error: Could not connect to the server.";
      await streamText(errorMessage);
      
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        message: errorMessage,
        timestamp: Date.now()
      };
      
      setChatLog(prev => [...prev, errorChatMessage]);
      setStreamingMessage("");
    } finally {
      // Focus back to input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, isLoading, isStreaming, apiEndpoint, streamText]);

  // Optimized key handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Quick action buttons
  const quickActions = [
    { icon: MapPin, label: t('qa_hotspots'), query: language === 'ar' ? 'اعرض نقاط الازدحام الحالية في دبي' : 'Show me current traffic hotspots in Dubai' },
    { icon: Clock, label: t('qa_peak_hours'), query: language === 'ar' ? 'ما هي ساعات الذروة اليوم؟' : 'What are the peak traffic hours today?' },
    { icon: BarChart3, label: t('qa_route_analysis'), query: language === 'ar' ? 'حلّل أفضل الطرق من مرسى دبي إلى وسط المدينة' : 'Analyze best routes from Dubai Marina to Downtown' }
  ];

  // Memoized chat messages to prevent unnecessary re-renders
  const chatMessages = useMemo(() => 
    chatLog.map((chat) => (
      <div
        key={chat.id}
        className={`flex items-start space-x-3 mb-6 ${
          chat.sender === "user" ? "justify-end" : "justify-start"
        } animate-fadeIn`}
      >
        {chat.sender === "bot" && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot className="text-white w-5 h-5" />
            </div>
          </div>
        )}
        <div
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] ${
            chat.sender === "user"
              ? "bg-gradient-to-r from-slate-800 to-gray-400 text-white rounded-br-sm"
              : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
          }`}
        >
          {chat.sender === "bot" ? (
            <div 
              className="text-sm leading-relaxed break-words"
              dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(chat.message) }}
            />
          ) : (
            <p className="text-sm leading-relaxed break-words">{chat.message}</p>
          )}
          <div className="mt-2 text-xs opacity-70">
            {new Date(chat.timestamp).toLocaleTimeString(locale, {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        {chat.sender === "user" && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
              <User className="text-white w-5 h-5" />
            </div>
          </div>
        )}
      </div>
    )),
    [chatLog]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      {/* Main Chat Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-b from-sky-200 to-slate-800 p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{t('ai_assistant')}</h3>
                <p className="text-blue-100 text-sm">
                  {isLoading ? t('analyzing_data') : 
                   isStreaming ? t('generating_response') : 
                   t('ready')}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/50 to-white/80"
          >
            {chatLog.length === 0 && !isStreaming && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-10 h-10 text-slate-700" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {t('welcome_title')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('welcome_desc')}
                </p>
              </div>
            )}
            
            {chatMessages}
            
            {/* Streaming message */}
            {isStreaming && streamingMessage && (
              <div className="flex items-start space-x-3 mb-6 animate-fadeIn">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Bot className="text-white w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg border border-gray-100 max-w-xs lg:max-w-md">
                  <div 
                    className="text-sm leading-relaxed break-words"
                    dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(streamingMessage) }}
                  />
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                    </div>
                    <span className="text-xs text-gray-500">{t('ai_typing')}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Loading indicator */}
            {isLoading && !isStreaming && (
              <div className="flex items-start space-x-3 mb-6 animate-fadeIn">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Bot className="text-white w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                    <span className="text-sm text-gray-600">{t('analyzing_data')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {chatLog.length === 0 && !isStreaming && (
            <div className="px-6 py-4 border-t border-gray-100 bg-white/60">
              <p className="text-sm font-medium text-gray-700 mb-3">{t('quick_actions')}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(action.query)}
                    className="flex items-center space-x-2 p-3 rounded-xl bg-white/80 hover:bg-white border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md group"
                    disabled={isLoading || isStreaming}
                  >
                    <action.icon className="w-4 h-4 text-yellow-600 group-hover:text-blue-700" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-800">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Container */}
          <div className="p-6 bg-white/80 border-t border-gray-100">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full border-2 border-gray-200 bg-white/90 p-4 rounded-2xl focus:outline-none focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-500 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t('input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || isStreaming}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
              <button
                className="bg-gradient-to-b from-blue-950 to-violet-900 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                onClick={sendMessage}
                disabled={isLoading || isStreaming || !input.trim()}
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {isLoading ? t('btn_analyzing') : isStreaming ? t('btn_generating') : t('btn_send')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-8 text-center">
        <p className="text-sm text-gray-600">{t('powered_by')}</p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}