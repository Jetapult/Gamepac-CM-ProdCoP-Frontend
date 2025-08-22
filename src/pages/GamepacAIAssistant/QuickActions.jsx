import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Code, BarChart3, Settings, ChevronDown, Users, Gamepad2, Plus, Rss, Scissors, Play, FileEdit, Palette, Languages, Map, MessageCircle, TrendingUp } from 'lucide-react';
import { getAuthToken } from '../../utils';

const QuickActions = ({ onAction, ContextStudioData }) => {
  const [showToolsSubmenu, setShowToolsSubmenu] = useState(false);
  const [showActionsSubmenu, setShowActionsSubmenu] = useState(false);
  const [activeToolSubmenu, setActiveToolSubmenu] = useState(null);
  const navigate = useNavigate();
  const token = getAuthToken()?.token;

  const routeMap = {
    'UA Feed': '/ua-intelligence',
    'Creative Breakdown': '/ua-intelligence/analyse',
    'Playable Editor': '/video-editor',
    'UGC Editor': `https://editor.gamepacai.com?token=${token}`,
    'Asset Gen': '/asset-generator',
    'Transl8': '/translate',
    'LevelGen': '/data-visualization',
    'GDD Agent': '/gdd',
    'Priority Fixes': '',
    'Recommendations': '',
    'Metrics': '',
    'Settings': '/dashboard',
    'CommPac': '/organic-ua/smart-feedback',
    'ASOPac': '/aso-assistant',
  };

  // Helper function to check if URL is external
  const isExternalUrl = (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  // Helper function to handle navigation
  const handleNavigation = (route, label) => {
    if (route) {
      if (isExternalUrl(route)) {
        window.open(route, '_blank', 'noopener,noreferrer');
      } else {
        navigate(route);
      }
      if (onAction) onAction(label);
    } else if (onAction) {
      onAction(label);
    }
  };

  const actions = [
    { icon: Wrench, label: 'Tools', color: 'from-yellow-500 to-orange-500', hasSubmenu: true },
    { icon: Code, label: 'Actions', color: 'from-green-500 to-emerald-500', hasSubmenu: true },
    { icon: BarChart3, label: 'Metrics', color: 'from-blue-500 to-cyan-500' },
    { icon: Settings, label: 'Settings', color: 'from-purple-500 to-pink-500' },
  ];

  const toolsSubmenu = [
    { icon: Users, label: 'UA', color: 'from-orange-400 to-red-400', hasSubmenu: true },
    { icon: Gamepad2, label: 'Dev', color: 'from-blue-400 to-indigo-400', hasSubmenu: true },
    { icon: Plus, label: 'New Games', color: 'from-green-400 to-emerald-400', hasSubmenu: true },
  ];

  const actionsSubmenu = [
    { icon: FileEdit, label: 'Priority Fixes', color: 'from-red-400 to-pink-400' },
    { icon: Rss, label: 'Recommendations', color: 'from-green-400 to-emerald-400' },
  ];

  const submenus = {
    'UA': [
      { icon: Rss, label: 'UA Feed', color: 'from-red-400 to-pink-400' },
      { icon: Scissors, label: 'Creative Breakdown', color: 'from-orange-400 to-red-400' },
      { icon: Play, label: 'Playable Editor', color: 'from-yellow-400 to-orange-400' },
      { icon: FileEdit, label: 'UGC Editor', color: 'from-green-400 to-yellow-400' },
      { icon: MessageCircle, label: 'CommPac', color: 'from-blue-400 to-purple-400' },
      { icon: TrendingUp, label: 'ASOPac', color: 'from-purple-400 to-pink-400' },
    ],
    'Dev': [
      { icon: Palette, label: 'Asset Gen', color: 'from-blue-400 to-purple-400' },
      { icon: Languages, label: 'Transl8', color: 'from-indigo-400 to-blue-400' },
      { icon: Map, label: 'LevelGen', color: 'from-cyan-400 to-indigo-400' },
    ],
    'New Games': [
      { icon: FileEdit, label: 'GDD Agent', color: 'from-green-400 to-emerald-400' },
    ],
  };

  const handleActionClick = (action) => {
    if (action.label === 'Tools') {
      setShowToolsSubmenu(!showToolsSubmenu);
      setShowActionsSubmenu(false);
      setActiveToolSubmenu(null);
    } else if (action.label === 'Actions') {
      setShowActionsSubmenu(!showActionsSubmenu);
      setShowToolsSubmenu(false);
      setActiveToolSubmenu(null);
    } else {
      // Handle direct navigation for Metrics and Settings
      const route = routeMap[action.label];
      handleNavigation(route, action.label);
      setShowToolsSubmenu(false);
      setShowActionsSubmenu(false);
      setActiveToolSubmenu(null);
    }
  };

  const handleToolClick = (tool) => {
    if (tool.hasSubmenu) {
      setActiveToolSubmenu(activeToolSubmenu === tool.label ? null : tool.label);
    } else {
      const route = routeMap[tool.label];
      handleNavigation(route, tool.label);
      setShowToolsSubmenu(false);
      setActiveToolSubmenu(null);
    }
  };

  const handleSubMenuClick = (item) => {
    const route = routeMap[item.label];
    handleNavigation(route, item.label);
    setShowToolsSubmenu(false);
    setShowActionsSubmenu(false);
    setActiveToolSubmenu(null);
  };

  const handleActionsClick = (item) => {
    const route = routeMap[item.label];
    handleNavigation(route, item.label);
    setShowActionsSubmenu(false);
    setShowToolsSubmenu(false);
    setActiveToolSubmenu(null);
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleActionClick(action)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg bg-gradient-to-br ${action.color} hover:scale-105 transform transition-all duration-200 group relative`}
            >
              <div className="flex items-center">
                <action.icon className="w-4 h-4 text-white group-hover:animate-pulse" />
                {action.hasSubmenu && (
                  <ChevronDown className={`w-3 h-3 text-white ml-1 transform transition-transform ${(action.label === 'Tools' && showToolsSubmenu) || (action.label === 'Actions' && showActionsSubmenu) ? 'rotate-180' : ''}`} />
                )}
              </div>
              <span className="text-xs text-white font-medium">{action.label}</span>
            </button>
          ))}
        </div>
        
        {showToolsSubmenu && !activeToolSubmenu && (
          <div className="mt-2 grid grid-cols-3 gap-2 animate-fade-in">
            {toolsSubmenu.map((tool) => (
              <button
                key={tool.label}
                onClick={() => handleToolClick(tool)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg bg-gradient-to-br ${tool.color} hover:scale-105 transform transition-all duration-200 group relative`}
              >
                <div className="flex items-center">
                  <tool.icon className="w-4 h-4 text-white group-hover:animate-pulse" />
                  {tool.hasSubmenu && (
                    <ChevronDown className="w-3 h-3 text-white ml-1" />
                  )}
                </div>
                <span className="text-xs text-white font-medium">{tool.label}</span>
              </button>
            ))}
          </div>
        )}

        {showActionsSubmenu && (
          <div className="mt-2 grid grid-cols-2 gap-2 animate-fade-in">
            {actionsSubmenu.map((item) => (
              <button
                key={item.label}
                onClick={() => handleActionsClick(item)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg bg-gradient-to-br ${item.color} hover:scale-105 transform transition-all duration-200 group`}
              >
                <item.icon className="w-4 h-4 text-white group-hover:animate-pulse" />
                <span className="text-xs text-white font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}
        
        {activeToolSubmenu && submenus[activeToolSubmenu] && (
          <div className="mt-2 animate-fade-in">
            <div className="flex items-center mb-2">
              <button
                onClick={() => setActiveToolSubmenu(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
              <span className="text-sm text-gray-600 ml-2">{activeToolSubmenu}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {submenus[activeToolSubmenu].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSubMenuClick(item)}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg bg-gradient-to-br ${item.color} hover:scale-105 transform transition-all duration-200 group`}
                >
                  <item.icon className="w-4 h-4 text-white group-hover:animate-pulse" />
                  <span className="text-xs text-white font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuickActions; 