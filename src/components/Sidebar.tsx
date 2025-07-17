
'use client';


import { Activity, CheckCircle, Database, ExternalLink, Settings, Sparkles, Users } from "lucide-react";
import { useState } from "react";



export default function EnhancedSidebar() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3000');
  const [savedUrl, setSavedUrl] = useState(apiUrl);
  const [isHealthy, setIsHealthy] = useState(true);

  const handleSave = () => {
    setSavedUrl(apiUrl);
    setIsHealthy(true); // You can replace with actual health check if needed
  };

  return (
    <aside className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 w-80 min-h-screen px-6 py-8 shadow-2xl flex flex-col justify-between text-white">
      {/* Top Section */}
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="bg-gradient-to-b from-sky-200 to-slate-600 p-4 rounded-2xl w-fit mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            System Configuration
          </h2>
          <p className="text-sm text-gray-400 mt-1">Manage your AI traffic system</p>
        </div>

        {/* API Config */}
        <div className="space-y-4">
          {/* API Input */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
            <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
              <Settings className="w-4 h-4" />
              API Endpoint
            </label>
            <input
              type="text"
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <button
              onClick={handleSave}
              className="w-full mt-3 bg-slate-500 hover:bg-green-400 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Update Configuration
            </button>
          </div>

          {/* Current Endpoint */}
          {/* <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700"> */}
            {/* <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Current Endpoint</span>
            </div> */}
            {/* <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-sm break-all hover:text-blue-300 transition-colors"
            >
              {savedUrl}
            </a>
          </div> */}

          {/* System Health */}
          <div
            className={`p-4 rounded-2xl border ${
              isHealthy
                ? 'bg-green-500/20 border-green-500/50'
                : 'bg-red-500/20 border-red-500/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle
                className={`w-5 h-5 ${
                  isHealthy ? 'text-green-400' : 'text-red-400'
                }`}
              />
              <span className="text-sm font-medium">System Health</span>
            </div>
            <p
              className={`text-sm mt-1 ${
                isHealthy ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {isHealthy ? 'All systems operational' : 'System experiencing issues'}
            </p>
          </div>
        </div>

        {/* Database Info */}
        {/* <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            Database Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
              <span className="text-sm text-gray-300">Total Segments</span>
              <span className="text-lg font-bold text-blue-400">2,847</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
              <span className="text-sm text-gray-300">Active Years</span>
              <span className="text-lg font-bold text-purple-400">2022–2024</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
              <span className="text-sm text-gray-300">Coverage</span>
              <span className="text-lg font-bold text-green-400">98.5%</span>
            </div>
          </div>
        </div> */}

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 p-4 rounded-2xl border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">AI Insights</span>
          </div>
          <p className="text-xs text-gray-300">
            Advanced semantic analysis powered by OpenAI embeddings and FAISS vector search.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-8">
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Prevent Congestion</span>
          </div>
          <p className="text-xs text-gray-400">Geo Spatial Traffic Intelligence System</p>
        </div>
      </footer>
    </aside>
  );
}
