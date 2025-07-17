

// import { BarChart3, Search, TrendingUp } from "lucide-react";
// import { useState } from "react";


// // Enhanced Retrieve Chunk Form
// export default function RetrieveChunkForm() {
//   const [query, setQuery] = useState('');
//   const [segments, setSegments] = useState<number>(3);
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState<string | null>(null);

//   const handleRetrieve = async () => {
//     setLoading(true);
//     setResponse(null);

//     try {
//       // Simulate API call
//       setTimeout(() => {
//         setResponse(JSON.stringify({
//           query: query,
//           segments: segments,
//           results: [
//             { id: 1, content: "Sheikh Zayed Road shows heavy congestion during 8-9 AM...", similarity: 0.92 },
//             { id: 2, content: "Dubai Marina area experiences peak traffic at 6-7 PM...", similarity: 0.88 },
//             { id: 3, content: "Al Khail Road has moderate traffic flow throughout the day...", similarity: 0.85 }
//           ]
//         }, null, 2));
//         setLoading(false);
//       }, 1500);
//     } catch (err) {
//       setResponse('❌ Failed to retrieve chunks.');
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-gradient-to-br from-white to-orange-50 p-8 rounded-3xl shadow-xl border border-orange-100">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="bg-red-600 p-3 rounded-2xl">
//           <Search className="w-6 h-6 text-white" />
//         </div>
//         <div>
//           <h3 className="text-2xl font-bold bg-red-600 bg-clip-text text-transparent">
//             Retrieve Chunks
//           </h3>
//           <p className="text-sm text-gray-500">Search through semantic traffic data</p>
//         </div>
//       </div>

//       <div className="space-y-4">
//         <div className="relative">
//           <input
//             type="text"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search for traffic patterns, congestion data..."
//             className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all bg-white/80 backdrop-blur-sm"
//           />
//           <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
//             <Search className="w-5 h-5" />
//           </div>
//         </div>

//         <div className="flex items-center gap-4">
//           <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
//             <BarChart3 className="w-4 h-4" />
//             Segments:
//           </label>
//           <input
//             type="number"
//             min={1}
//             max={10}
//             value={segments}
//             onChange={(e) => setSegments(Number(e.target.value))}
//             className="w-24 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all bg-white/80"
//           />
//         </div>

//         <button
//           onClick={handleRetrieve}
//           disabled={loading}
//           className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
//         >
//           {loading ? (
//             <>
//               <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
//               Searching...
//             </>
//           ) : (
//             <>
//               <TrendingUp className="w-5 h-5" />
//               Retrieve Data
//             </>
//           )}
//         </button>

//         {response && (
//           <div className="p-4 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-2xl">
//             <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-60">
//               {response}
//             </pre>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


'use client';

import { BarChart3, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function RetrieveChunkForm() {
  const [query, setQuery] = useState('');
  const [segments, setSegments] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleRetrieve = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://34.133.72.233:8000'}/retrieve-chunks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, segments }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResponse(JSON.stringify(data, null, 2));
      } else {
        setResponse(`❌ Server Error: ${data.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Retrieve error:', err);
      setResponse('❌ Failed to retrieve chunks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-orange-50 p-8 rounded-3xl shadow-xl border border-orange-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-600 p-3 rounded-2xl">
          <Search className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold bg-red-600 bg-clip-text text-transparent">
            Retrieve Chunks
          </h3>
          <p className="text-sm text-gray-500">Search through semantic traffic data</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for traffic patterns, congestion data..."
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all bg-white/80 backdrop-blur-sm"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Segments:
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={segments}
            onChange={(e) => setSegments(Number(e.target.value))}
            className="w-24 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all bg-white/80"
          />
        </div>

        <button
          onClick={handleRetrieve}
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              Searching...
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              Retrieve Data
            </>
          )}
        </button>

        {response && (
          <div className="p-4 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-2xl">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-60">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
