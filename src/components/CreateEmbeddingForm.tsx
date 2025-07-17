
'use client';

import { Globe, UploadCloud, Zap, Plus, X } from "lucide-react";
import { useState } from "react";

export default function CreateEmbeddingForm() {
  const [files, setFiles] = useState(['']);
  const [fileKeys, setFileKeys] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleChangeFile = (index: number, value: string) => {
    const newFiles = [...files];
    newFiles[index] = value;
    setFiles(newFiles);
  };

  const handleChangeKey = (index: number, value: string) => {
    const newFileKeys = [...fileKeys];
    newFileKeys[index] = value;
    setFileKeys(newFileKeys);
  };

  const handleAddFile = () => {
    setFiles([...files, '']);
  };

  const handleAddKey = () => {
    setFileKeys([...fileKeys, '']);
  };

  const handleRemoveFile = (index: number) => {
    if (files.length > 1) {
      setFiles(files.filter((_, i) => i !== index));
    }
  };

  const handleRemoveKey = (index: number) => {
    if (fileKeys.length > 1) {
      setFileKeys(fileKeys.filter((_, i) => i !== index));
    }
  };

  const handleCreateEmbedding = async () => {
    // Filter out empty files
    const validFiles = files.filter(file => file.trim());
    if (validFiles.length === 0) return;

    setLoading(true);
    setStatus(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://34.133.72.233:8000';

      const query = new URLSearchParams();
      
      // Add all valid files
      validFiles.forEach(file => {
        query.append('files', file.trim());
      });

      // Add file keys if they exist
      const validKeys = fileKeys.filter(key => key.trim());
      validKeys.forEach(key => {
        query.append('file_keys', key.trim());
      });

      const fullUrl = `${apiUrl}/create-embeddings?${query.toString()}`;

      const response = await fetch(fullUrl, {
        method: 'POST',
      });

      const data = await response.json();


      if (response.ok) {
        setStatus(`✅ ${data.status} Added ${data.total_embeddings || 0} new segments to the database.`);
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

      <div className="space-y-6">
        {/* Files Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-gray-700">Files *</h4>
          </div>
          {files.map((file, index) => (
            <div key={index} className="relative flex gap-2">
              <input
                type="text"
                value={file}
                onChange={(e) => handleChangeFile(index, e.target.value)}
                placeholder={`GeoJSON URL ${index + 1}`}
                className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all bg-white/80 backdrop-blur-sm"
              />
              {files.length > 1 && (
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="px-3 py-4 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddFile}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add File
          </button>
        </div>

        {/* File Keys Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
            </div>
            <h4 className="font-semibold text-gray-700">File Keys (optional)</h4>
          </div>
          {fileKeys.map((key, index) => (
            <div key={index} className="relative flex gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => handleChangeKey(index, e.target.value)}
                placeholder={`File Key ${index + 1} (e.g., 2022_Sep)`}
                className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all bg-white/80 backdrop-blur-sm"
              />
              {fileKeys.length > 1 && (
                <button
                  onClick={() => handleRemoveKey(index)}
                  className="px-3 py-4 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddKey}
            className="flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-xl hover:bg-teal-200 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Key
          </button>
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
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}