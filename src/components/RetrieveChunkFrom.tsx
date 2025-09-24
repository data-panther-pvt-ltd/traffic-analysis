
'use client';

import { useState } from 'react';
import { Brain, Search, Zap } from 'lucide-react';

export default function RetrieveForm() {
  const [query, setQuery] = useState('');
  const [segments, setSegments] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);

  const handleRetrieve = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/retrieve?query=${encodeURIComponent(query)}&top_k=${segments}`,
        {
          method: 'POST',
        }
      );

      const data = await res.json();
      setResults(JSON.stringify(data, null, 2));
    } catch (err) {
      setResults('❌ Failed to retrieve results.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-3xl shadow-xl border border-blue-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Semantic Retrieval
          </h3>
          <p className="text-sm text-gray-500">Query relevant traffic segments using vector search</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. congestion near Dubai Mall"
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/80 backdrop-blur-sm"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
        </div>

        <input
          type="range"
          min={1}
          max={10}
          value={segments}
          onChange={(e) => setSegments(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-sm text-gray-500">Top {segments} results</p>

        <button
          onClick={handleRetrieve}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              Retrieving...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Retrieve
            </>
          )}
        </button>

        {results && (
          <div className="p-4 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700">
            {results}
          </div>
        )}
      </div>
    </div>
  );
}
