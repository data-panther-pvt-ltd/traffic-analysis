
// 'use client';
// import { useState } from 'react';
// import { Bot, Send, UploadCloud, Search, Settings, Database, CheckCircle, ExternalLink, MessageCircle, Zap, TrendingUp, Activity, Globe, Users, Clock, BarChart3, Sparkles } from 'lucide-react';

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
// }

// // Enhanced Chat Assistant Component
// export default function ChatAssistant() {
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState<Message[]>([
//     { role: 'assistant', content: 'Hello! I\'m your Dubai Traffic Analysis AI assistant. Ask me anything about traffic patterns, congestion data, or road conditions.' }
//   ]);
//   const [isTyping, setIsTyping] = useState(false);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const newMessage = { role: 'user', content: input };
//     setMessages((prev) => [...prev, newMessage]);
//     setInput('');
//     setIsTyping(true);

//     try {
//       // Simulate API call with delay
//       setTimeout(() => {
//         setMessages((prev) => [...prev, { 
//           role: 'assistant', 
//           content: 'Based on the traffic data analysis, I can see patterns in Dubai\'s traffic flow. The busiest periods are typically between 7-9 AM and 5-7 PM on weekdays...' 
//         }]);
//         setIsTyping(false);
//       }, 1500);
//     } catch {
//       console.error('Chat error');
//       setIsTyping(false);
//     }
//   };

//   return (
//     <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-3xl shadow-xl border border-blue-100 backdrop-blur-sm">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="bg-green-600 p-3 rounded-2xl">
//           <Bot className="w-6 h-6 text-white" />
//         </div>
//         <div>
//           <h2 className="text-2xl font-bold text-black ">
//             AI Traffic Assistant
//           </h2>
//           <p className="text-sm text-gray-500">Powered by advanced semantic analysis</p>
//         </div>
//       </div>

//       <div className="h-80 overflow-y-auto space-y-4 mb-6 border border-gray-200 rounded-2xl p-4 bg-white/70 backdrop-blur-sm">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm ${
//               msg.role === 'user'
//                 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto'
//                 : 'bg-white border border-gray-200 text-gray-800 mr-auto'
//             }`}
//           >
//             <div className="flex items-start gap-2">
//               {msg.role === 'assistant' && (
//                 <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-full mt-1">
//                   <Bot className="w-3 h-3 text-white" />
//                 </div>
//               )}
//               <p className="text-sm leading-relaxed">{msg.content}</p>
//             </div>
//           </div>
//         ))}
//         {isTyping && (
//           <div className="max-w-[85%] px-5 py-3 rounded-2xl bg-white border border-gray-200 mr-auto">
//             <div className="flex items-center gap-2">
//               <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-full">
//                 <Bot className="w-3 h-3 text-white" />
//               </div>
//               <div className="flex gap-1">
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="flex items-center gap-3">
//         <div className="flex-1 relative">
//           <input
//             type="text"
//             placeholder="Ask about traffic patterns, congestion, or road conditions..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             className="w-full border-2 border-gray-200 rounded-2xl px-5 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/80 backdrop-blur-sm"
//             onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//           />
//           <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//             <MessageCircle className="w-5 h-5" />
//           </div>
//         </div>
//         <button
//           onClick={sendMessage}
//           className="bg-slate-900 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
//         >
//           <Send className="w-5 h-5" />
//         </button>
//       </div>

//       <div className="mt-4 flex gap-2">
//         <button className="px-4 py-2 bg-slate-200 rounded-3xl">
//           Traffic hotspots
//         </button>
//         <button className="px-4 py-2 bg-slate-200 rounded-3xl">
//           Peak hours analysis
//         </button>
//         <button className="px-4 py-2 bg-slate-200 rounded-3xl">
//           Route optimization
//         </button>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState } from 'react';
import {
  Bot,
  Send,
  MessageCircle,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your Dubai Traffic Analysis AI assistant. Ask me anything about traffic patterns, congestion data, or road conditions.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://34.133.72.233:8000'}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: input }),
        }
      );

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'No response received.' },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Sorry, failed to get a response from the server.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-3xl shadow-xl border border-blue-100 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-600 p-3 rounded-2xl">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black">
            AI Traffic Assistant
          </h2>
          <p className="text-sm text-gray-500">
            Powered by advanced semantic analysis
          </p>
        </div>
      </div>

      <div className="h-80 overflow-y-auto space-y-4 mb-6 border border-gray-200 rounded-2xl p-4 bg-white/70 backdrop-blur-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto'
                : 'bg-white border border-gray-200 text-gray-800 mr-auto'
            }`}
          >
            <div className="flex items-start gap-2">
              {msg.role === 'assistant' && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-full mt-1">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="max-w-[85%] px-5 py-3 rounded-2xl bg-white border border-gray-200 mr-auto">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-full">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Ask about traffic patterns, congestion, or road conditions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-2xl px-5 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/80 backdrop-blur-sm"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <MessageCircle className="w-5 h-5" />
          </div>
        </div>
        <button
          onClick={sendMessage}
          className="bg-slate-900 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-slate-200 rounded-3xl">
          Traffic hotspots
        </button>
        <button className="px-4 py-2 bg-slate-200 rounded-3xl">
          Peak hours analysis
        </button>
        <button className="px-4 py-2 bg-slate-200 rounded-3xl">
          Route optimization
        </button>
      </div>
    </div>
  );
}
