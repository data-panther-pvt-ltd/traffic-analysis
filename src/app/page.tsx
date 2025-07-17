
// Main App Component
'use client';
import { useState } from 'react';
import { 
  Activity, 
  Bot, 
  UploadCloud, 
  Search, 
  Clock, 
  TrendingUp, 
  BarChart3 
} from 'lucide-react';

import ChatAssistant from '@/components/ChatAssistant';
import CreateEmbeddingForm from '@/components/CreateEmbeddingForm';
import RetrieveChunkForm from '@/components/RetrieveChunkFrom';
import EnhancedSidebar from '@/components/Sidebar'; // assuming you renamed it

export default function EnhancedTrafficAI() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <EnhancedSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-10 space-y-10">
          {/* Header Section */}
          <section className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="bg-white p-6 rounded-3xl">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="bg-gradient-to-b from-sky-200 to-slate-600 p-4 rounded-2xl">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold text-gray-800">
                    Geo Spatial RAG
                  </h1>
                </div>
                <p className="text-lg text-gray-600 mb-4">
                  Advanced semantic analysis system for intelligent traffic management
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="px-4 py-2 bg-gray-50 rounded-full text-sm font-medium">
                     OpenAI Embeddings
                  </span>
                  <span className="px-4 py-2 bg-gray-50 rounded-full text-sm font-medium">
                     FAISS Vector Search
                  </span>
                  <span className="px-4 py-2 bg-gray-50 rounded-full text-sm font-medium">
                     Natural Language Queries
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <nav className="flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex gap-1">
                {[
                  { id: 'chat', label: 'AI Assistant', icon: Bot, color: 'blue' },
                  { id: 'embedding', label: 'Create Embeddings', icon: UploadCloud, color: 'emerald' },
                  { id: 'retrieve', label: 'Search Data', icon: Search, color: 'orange' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Content Sections */}
          <section className="max-w-6xl mx-auto">
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Traffic Intelligence Assistant</h2>
                  <p className="text-gray-600">Get insights from Dubai's traffic data using natural language</p>
                </div>
                <ChatAssistant />
              </div>
            )}

            {activeTab === 'embedding' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Semantic Data Processing</h2>
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
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Semantic Search Engine</h2>
                  <p className="text-gray-600">Find relevant traffic data using intelligent semantic search</p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <RetrieveChunkForm />
                </div>
              </div>
            )}
          </section>

          {/* Stats Section */}
          <section className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700 p-6 rounded-3xl text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Real-time Processing</h3>
                </div>
                <p className="text-3xl font-bold mb-2">24/7</p>
                <p className="text-blue-100">Continuous traffic monitoring</p>
              </div>

              <div className="bg-slate-700 p-6 rounded-3xl text-white">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Accuracy Rate</h3>
                </div>
                <p className="text-3xl font-bold mb-2">98.5%</p>
                <p className="text-purple-100">Prediction accuracy</p>
              </div>

              <div className="bg-slate-700 p-6 rounded-3xl text-white">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Data Points</h3>
                </div>
                <p className="text-3xl font-bold mb-2">2.8M+</p>
                <p className="text-green-100">Traffic data segments</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}