// 'use client';

// import { Globe, UploadCloud, Zap } from "lucide-react";
// import { useState } from "react";

// export default function CreateEmbeddingForm() {
//   const [url, setUrl] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState<string | null>(null);

//   const handleCreateEmbedding = async () => {
//     if (!url.trim()) return;

//     setLoading(true);
//     setStatus(null);

//     try {
//       // Simulate API call
//       setTimeout(() => {
//         setStatus('✅ Embedding created successfully! Added 150 new segments to the database.');
//         setLoading(false);
//       }, 2000);
//     } catch (err) {
//       setStatus('❌ Failed to create embedding.');
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-gradient-to-br from-white to-emerald-50 p-8 rounded-3xl shadow-xl border border-emerald-100">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-2xl">
//           <UploadCloud className="w-6 h-6 text-white" />
//         </div>
//         <div>
//           <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
//             Create Embeddings
//           </h3>
//           <p className="text-sm text-gray-500">Process traffic data into semantic vectors</p>
//         </div>
//       </div>

//       <div className="space-y-4">
//         <div className="relative">
//           <input
//             type="text"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             placeholder="https://api.dubaitraffic.com/data.json"
//             className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all bg-white/80 backdrop-blur-sm"
//           />
//           <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
//             <Globe className="w-5 h-5" />
//           </div>
//         </div>

//         <button
//           onClick={handleCreateEmbedding}
//           disabled={loading}
//           className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
//         >
//           {loading ? (
//             <>
//               <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
//               Processing...
//             </>
//           ) : (
//             <>
//               <Zap className="w-5 h-5" />
//               Create Embedding
//             </>
//           )}
//         </button>

//         {status && (
//           <div className="p-4 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl">
//             <p className="text-sm text-gray-700">{status}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



'use client';

import { Globe, UploadCloud, Zap } from "lucide-react";
import { useState } from "react";

export default function CreateEmbeddingForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleCreateEmbedding = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://34.133.72.233:8000'}/create-embedding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus(
          `✅ ${data.message} Added ${data.segments_added || 0} new segments to the database.`
        );
      } else {
        setStatus(`❌ Server Error: ${data.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Embedding error:', err);
      setStatus('❌ Failed to create embedding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50 p-8 rounded-3xl shadow-xl border border-emerald-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-2xl">
          <UploadCloud className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Create Embeddings
          </h3>
          <p className="text-sm text-gray-500">Process traffic data into semantic vectors</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.dubaitraffic.com/data.json"
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all bg-white/80 backdrop-blur-sm"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <button
          onClick={handleCreateEmbedding}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Create Embedding
            </>
          )}
        </button>

        {status && (
          <div className="p-4 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl">
            <p className="text-sm text-gray-700">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
