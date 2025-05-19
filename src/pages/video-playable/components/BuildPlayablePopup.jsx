import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { buildPlayableAd } from '../utils';

const BuildPlayablePopup = ({ 
  onClose, 
  videoPlayable,
  setToastMessage
}) => {
  const [selectedNetworks, setSelectedNetworks] = useState({ Web: true });
  const [isBuilding, setIsBuilding] = useState(false);
  const [storeUrls, setStoreUrls] = useState({
    ios: videoPlayable.general?.iosUrl || '',
    android: videoPlayable.general?.playstoreUrl || ''
  });
  
  const handleNetworkToggle = (network) => {
    setSelectedNetworks(prev => ({
      ...prev,
      [network]: !prev[network]
    }));
  };
  
  const handleBuild = async () => {
    try {
      // Get array of selected networks
      const networks = Object.keys(selectedNetworks).filter(network => selectedNetworks[network]);
      
      if (networks.length === 0) {
        setToastMessage({
          show: true,
          message: "Please select at least one ad network",
          type: "error"
        });
        return;
      }
      
      // Update the videoPlayable with store URLs
      const updatedVideoPlayable = {
        ...videoPlayable,
        general: {
          ...videoPlayable.general,
          iosUrl: storeUrls.ios,
          playstoreUrl: storeUrls.android
        }
      };
      
      setIsBuilding(true);
      setToastMessage({
        show: true,
        message: `Building playable ad for ${networks.join(', ')}...`,
        type: "info"
      });
      
      // Call the build function with selected networks
      await buildPlayableAd(updatedVideoPlayable, networks);
      
      setToastMessage({
        show: true,
        message: "Playable ad built successfully!",
        type: "success"
      });
      
      onClose();
    } catch (error) {
      console.error("Error building playable ad:", error);
      setToastMessage({
        show: true,
        message: "Failed to build playable ad. Please try again.",
        type: "error"
      });
    } finally {
      setIsBuilding(false);
    }
  };
  
  // Handle URL input changes
  const handleUrlChange = (platform, value) => {
    setStoreUrls(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg max-w-xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white">BUILD PLAYABLE AD</h3>
          <button onClick={onClose} className="text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-white mb-2">SELECT AD NETWORKS</h4>
          <p className="text-gray-300 mb-4">
            Please select all the Ad Networks you would like to build the Playable Ad. 
            The time of build will be affected by the number of selected Ad Network. 
            Please be patient, our build servers can be busy.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-md p-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-purple-600 rounded"
                  checked={selectedNetworks.Web || false}
                  onChange={() => handleNetworkToggle('Web')}
                />
                <span className="text-white">Web</span>
              </label>
            </div>
            
            <div className="bg-gray-700 rounded-md p-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-purple-600 rounded"
                  checked={selectedNetworks.Facebook || false}
                  onChange={() => handleNetworkToggle('Facebook')}
                />
                <span className="text-white">Facebook</span>
              </label>
            </div>
            
            {['Google', 'Mintegral', 'Unity', 'AppLovin'].map(network => (
              <div key={network} className="bg-gray-700 rounded-md p-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-purple-600 rounded"
                  />
                  <span className="text-white flex items-center">
                    {network}
                  </span>
                </label>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            {Object.keys(selectedNetworks).filter(k => selectedNetworks[k]).length} Ad Network(s) selected for build.
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <div>
            <h4 className="text-white mb-1 flex items-center">
              <span className="mr-2">CHECKLIST</span>
              <span className="text-gray-400 text-sm">(store URLs are optional but recommended)</span>
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-white text-sm">iOS App Store URL</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                  placeholder="Search or enter your store URL"
                  value={storeUrls.ios}
                  onChange={(e) => handleUrlChange('ios', e.target.value)}
                />
                {!storeUrls.ios && (
                  <div className="text-orange-400 text-xs mt-1">Enter store URL</div>
                )}
              </div>
              <div>
                <label className="text-white text-sm">Android Google Play URL</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                  placeholder="Search or enter your store URL"
                  value={storeUrls.android}
                  onChange={(e) => handleUrlChange('android', e.target.value)}
                />
                {!storeUrls.android && (
                  <div className="text-orange-400 text-xs mt-1">Enter store URL</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-4 pt-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-transparent border border-gray-600 text-white rounded-lg"
              disabled={isBuilding}
            >
              Cancel
            </button>
            
            <button
              onClick={handleBuild}
              className="px-6 py-2 bg-purple-900 text-white rounded-lg flex items-center"
              disabled={isBuilding}
            >
              {isBuilding ? (
                <span className="animate-spin mr-2">⚙️</span>
              ) : (
                <span className="mr-2">📦</span>
              )}
              {isBuilding ? 'Building...' : 'Start build'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildPlayablePopup;
