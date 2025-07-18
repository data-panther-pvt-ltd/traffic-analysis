
'use client';
import { useState } from 'react';
import {
  Activity,
  Bot,
  UploadCloud,
  Search
} from 'lucide-react';
import LogoutButton from '../components/logoutButton';

import ChatAssistant from '@/components/ChatAssistant';
import CreateEmbeddingForm from '@/components/CreateEmbeddingForm';
import RetrieveChunkForm from '@/components/RetrieveChunkFrom';

export default function EnhancedTrafficAI() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">

      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 sm:p-6 md:p-10 space-y-10">
          {/* Header Section */}
          <section className="text-center px-2">
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
              <div className="bg-white p-6 rounded-3xl w-full max-w-4xl">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                  <div className="bg-gradient-to-b from-sky-200 to-slate-600 p-4 rounded-2xl">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 text-center">
                    Geo Spatial RAG
                  </h1>
                  <LogoutButton/>
                </div>
{/*                
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {['OpenAI Embeddings', 'FAISS Vector Search', 'Natural Language Queries'].map((item) => (
                    <span
                      key={item}
                      className="px-4 py-2 bg-gray-50 rounded-full text-sm font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div> */}
              </div>
            </div>
          </section>

          {/* Navigation */}
          <nav className="flex justify-center px-2">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-gray-200 w-full max-w-3xl">
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { id: 'chat', label: 'AI Assistant', icon: Bot, color: 'blue' },
                  { id: 'embedding', label: 'Create Embeddings', icon: UploadCloud, color: 'blue' },
                  { id: 'retrieve', label: 'Search Data', icon: Search, color: 'blue' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Content Sections */}
          <section className="max-w-6xl mx-auto px-2 sm:px-4">
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <ChatAssistant />
              </div>
            )}

            {activeTab === 'embedding' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Semantic Data Processing
                  </h2>
                  <p className="text-gray-600">Transform raw traffic data into searchable semantic vectors</p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <CreateEmbeddingForm />
                </div>
              </div>
            )}

            {activeTab === 'retrieve' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Semantic Search Engine
                  </h2>
                  <p className="text-gray-600">Find relevant traffic data using intelligent semantic search</p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <RetrieveChunkForm />
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
