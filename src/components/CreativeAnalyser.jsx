import { useState, useEffect } from 'react';
import api from '../api'
const CreativeAnalyser = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState('');


  const handleUrlChange = (event) => {
    const urls = event.target.value.split(',').map(url => url.trim()).filter(url => url);

    // Validate URLs (basic validation for demo purposes)
    const validTypes = ['.mp4', '.mov', '.jpeg', '.jpg', '.png', '.gif'];
    const invalidUrls = urls.filter(url => !validTypes.some(type => url.endsWith(type)));

    if (invalidUrls.length > 0) {
      setError('Please enter valid URLs for video (MP4, MOV) or image (JPEG, PNG, GIF) files');
      return;
    }

    const previewUrls = urls.map(url => ({
      url,
      type: validTypes.some(type => url.endsWith(type)) ? (url.endsWith('.mp4') || url.endsWith('.mov') ? 'video' : 'image') : 'unknown'
    }));

    setPreviewUrls(previewUrls);
    setError('');
  };

  const analyzeCreatives = async () => {
    if (previewUrls.length === 0) {
      setError('Please enter URLs to analyze');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      console.log('Sending URLs to API:', previewUrls.map(preview => preview.url));
  
      const response = await api.post('/v1/gen-ai/analyze-ads', {
        ads: previewUrls.map(preview => ({
          type: 'video', // Set type to 'video'
          url: preview.url,
          text: '' // Leave text empty
        }))
      });
  
      setAnalysis(response.data.data[0].analysis); // Access the first item's analysis
      console.log(response.data.message); // Log the success message
    } catch (err) {
      // Log the entire error object for more context
      console.error('Error:', err);
  
      // Handle different types of errors
      if (err.response) {
        setError(err.response.data?.message || 'Error analyzing creatives');
      } else if (err.request) {
        setError('No response received from the server');
      } else {
        setError('Error setting up the request');
      }
    } finally {
      setLoading(false);
    }
  };


  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, []);

  return (
<div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Creative Analysis</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter URLs (Videos/Images)
          </label>
          <input
            type="text"
            onChange={handleUrlChange}
            className="w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter URLs separated by commas"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {previewUrls.map((preview, index) => (
              <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {preview.type === 'video' ? (
                  <video
                    src={preview.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ))}
          </div>
        )}

<button
          onClick={analyzeCreatives}
          disabled={loading || previewUrls.length === 0}
          className={`w-full bg-[#B9FF66] text-black py-3 px-6 rounded-md font-medium
            ${loading || previewUrls.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#a1ff33]'}`}
        >
          {loading ? 'Analyzing...' : 'Analyze Creatives'}
        </button>
      </div>

      {analysis && (
  <div className="space-y-6">
    <div>
      <h3 className="font-medium mb-2">Analysis Result</h3>
      <p>{analysis.rawAnalysis}</p>
    </div>
    <div>
      <h4 className="font-medium mb-2">Timestamp</h4>
      <p>{new Date(analysis.timestamp).toLocaleString()}</p>
    </div>
  </div>
)}
    </div>
  );
};

export default CreativeAnalyser;