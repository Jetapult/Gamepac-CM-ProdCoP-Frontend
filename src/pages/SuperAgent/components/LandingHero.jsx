import { Header } from './Header';
import { Sidebar } from './Sidebar';
import {
  FileCode2,
  Table,
  Code2,
  Palette,
  Sparkles,
  CircleArrowRight,
  CornerDownLeft,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const features = [
  {
    icon: Code2,
    label: 'Game Director Report',
    template: 'code-interpreter-v1',
  },
  {
    icon: FileCode2,
    label: 'CommPac',
    template: 'nextjs-developer',
  },
  {
    icon: Palette,
    label: 'ScalePac',
    template: 'vue-developer',
  },
  {
    icon: Table,
    label: 'LiveOps Catalogue',
    template: 'streamlit-developer',
  },
  {
    icon: Sparkles,
    label: 'UA Playbook',
    template: 'gradio-developer',
  },
];

const showcaseItems = [
  {
    icon: Code2,
    title: 'Game Director Weekly Report with Data Insights',
    prompt: 'Create a game director weekly report with data insights',
    template: 'code-interpreter-v1',
    badge: 'Popular',
  },
  {
    icon: FileCode2,
    title: 'CommPac Communication Dashboard',
    prompt: 'Build a communication analytics dashboard',
    template: 'nextjs-developer',
  },
  {
    icon: Table,
    title: 'ScalePac User Acquisition Analysis',
    prompt: 'Create a user acquisition scaling analysis tool',
    template: 'streamlit-developer',
    badge: 'Trending',
  },
  {
    icon: Sparkles,
    title: 'LiveOps Catalogue Management System',
    prompt: 'Build a LiveOps catalogue management interface',
    template: 'gradio-developer',
  },
  {
    icon: Palette,
    title: 'UA Playbook Performance Tracker',
    prompt: 'Create a UA playbook performance tracking dashboard',
    template: 'vue-developer',
  },
  {
    icon: MessageSquare,
    title: 'Player Feedback Analysis Tool',
    prompt: 'Build a player feedback analysis chatbot',
    template: 'nextjs-developer',
  },
  {
    icon: FileText,
    title: 'Game Design Documentation Generator',
    prompt: 'Create a game design documentation generator',
    template: 'nextjs-developer',
    badge: 'New',
  },
  {
    icon: Code2,
    title: 'Monetization Metrics Visualization',
    prompt: 'Generate monetization metrics visualizations',
    template: 'code-interpreter-v1',
  },
  {
    icon: Code2,
    title: 'Game Director Weekly Report with Data Insights',
    prompt: 'Create a game director weekly report with data insights',
    template: 'code-interpreter-v1',
    badge: 'Popular',
  },
  {
    icon: FileCode2,
    title: 'CommPac Communication Dashboard',
    prompt: 'Build a communication analytics dashboard',
    template: 'nextjs-developer',
  },
  {
    icon: Table,
    title: 'ScalePac User Acquisition Analysis',
    prompt: 'Create a user acquisition scaling analysis tool',
    template: 'streamlit-developer',
    badge: 'Trending',
  },
  {
    icon: Sparkles,
    title: 'LiveOps Catalogue Management System',
    prompt: 'Build a LiveOps catalogue management interface',
    template: 'gradio-developer',
  },
  {
    icon: Palette,
    title: 'UA Playbook Performance Tracker',
    prompt: 'Create a UA playbook performance tracking dashboard',
    template: 'vue-developer',
  },
  {
    icon: MessageSquare,
    title: 'Player Feedback Analysis Tool',
    prompt: 'Build a player feedback analysis chatbot',
    template: 'nextjs-developer',
  },
  {
    icon: FileText,
    title: 'Game Design Documentation Generator',
    prompt: 'Create a game design documentation generator',
    template: 'nextjs-developer',
    badge: 'New',
  },
  {
    icon: Code2,
    title: 'Monetization Metrics Visualization',
    prompt: 'Generate monetization metrics visualizations',
    template: 'code-interpreter-v1',
  },
];

export function LandingHero() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate(`/super-agent/fragments?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  const handleFeatureClick = (template, label) => {
    const defaultPrompt = `Create a ${label.toLowerCase()}`;
    navigate(
      `/super-agent/fragments?prompt=${encodeURIComponent(defaultPrompt)}&template=${template}`
    );
  };

  return (
    <>
    <Sidebar />
    <div className="flex ml-[64px] bg-white min-h-screen">
      <div className="flex flex-col w-full">
        <Header />
        <div className="w-full flex flex-col items-center justify-center py-20 px-6">
          {/* Hero Title */}
          <h1
            className="sa-heading-1 flex items-center gap-3 mb-4"
            style={{
              fontFamily: 'var(--sa-font-primary)',
              color: 'var(--sa-primary-dark)',
              fontSize: 'var(--sa-text-5xl)',
              fontWeight: 'var(--sa-weight-semibold)'
            }}
          >
            Ask GamePac to trigger in-game events
          </h1>

          {/* Subtitle */}
          <p
            className="sa-body-large mb-12"
            style={{
              fontFamily: 'var(--sa-font-primary)',
              color: 'var(--sa-gray-500)',
              fontSize: 'var(--sa-text-lg)',
              fontWeight: 'var(--sa-weight-regular)'
            }}
          >
            where Ideas come to reality
          </p>

          {/* Chat/Feed Toggle */}
          <div className="flex gap-3 mb-12">
            <button
              className="px-6 py-3 rounded-full flex items-center gap-2 transition-all"
              style={{
                backgroundColor: 'var(--sa-primary-dark)',
                color: 'var(--sa-white)',
                fontFamily: 'var(--sa-font-primary)',
                fontWeight: 'var(--sa-weight-medium)',
                fontSize: 'var(--sa-text-base)'
              }}
            >
              <MessageSquare size={18} />
              Chat
            </button>
            <button
              className="px-6 py-3 rounded-full flex items-center gap-2 transition-all"
              style={{
                backgroundColor: 'var(--sa-gray-100)',
                color: 'var(--sa-gray-700)',
                fontFamily: 'var(--sa-font-primary)',
                fontWeight: 'var(--sa-weight-medium)',
                fontSize: 'var(--sa-text-base)'
              }}
            >
              <FileText size={18} />
              Feed
            </button>
          </div>

          {/* Search Input */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl mb-12"
          >
            <div className="relative group">
              <div
                className="relative rounded-3xl transition-all duration-300 pb-12 shadow-lg"
                style={{
                  backgroundColor: 'var(--sa-white)',
                  border: '2px solid var(--sa-gray-200)'
                }}
              >
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Generate a professional sentiment analysis report"
                  className="flex-1 p-6 text-base bg-transparent border-0 focus:outline-none focus:ring-0 resize-none w-full"
                  style={{
                    fontFamily: 'var(--sa-font-primary)',
                    color: 'var(--sa-gray-900)',
                    fontSize: 'var(--sa-text-base)'
                  }}
                  autoFocus
                  rows={2}
                />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: 'var(--sa-gray-600)' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: 'var(--sa-gray-600)' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg p-2.5 transition-all"
                    style={{
                      backgroundColor: prompt.trim() ? 'var(--sa-primary-dark)' : 'var(--sa-gray-300)',
                      color: 'var(--sa-white)'
                    }}
                    disabled={!prompt.trim()}
                  >
                    <CornerDownLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Feature Quick Actions */}
          <div className="flex flex-wrap justify-center gap-6 mb-16 max-w-4xl">
            {features.map((feature) => (
              <button
                key={feature.label}
                onClick={() =>
                  handleFeatureClick(feature.template, feature.label)
                }
                className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'var(--sa-gray-50)',
                  border: '1px solid var(--sa-gray-200)',
                  fontFamily: 'var(--sa-font-primary)',
                  fontSize: 'var(--sa-text-sm)',
                  fontWeight: 'var(--sa-weight-medium)',
                  color: 'var(--sa-gray-700)'
                }}
              >
                <div
                  className="rounded-lg p-2"
                  style={{ backgroundColor: 'var(--sa-white)' }}
                >
                  <feature.icon className="w-4 h-4" style={{ color: 'var(--sa-primary-dark)' }} />
                </div>
                {feature.label}
              </button>
            ))}
          </div>

          {/* For You Section - Removed divider, cleaner look */}
          <div className="w-full max-w-7xl mt-8">
            <div className="flex items-center justify-center mb-8">
              <div
                className="px-8 py-2 rounded-full"
                style={{
                  backgroundColor: 'var(--sa-gray-100)',
                  border: '1px solid var(--sa-gray-200)'
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--sa-font-primary)',
                    fontSize: 'var(--sa-text-sm)',
                    fontWeight: 'var(--sa-weight-medium)',
                    color: 'var(--sa-gray-700)'
                  }}
                >
                  Recommended for you
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {showcaseItems.slice(0, 8).map((item, index) => (
                <button
                  key={index}
                  onClick={() =>
                    navigate(
                      `/super-agent/fragments?prompt=${encodeURIComponent(item.prompt)}&template=${item.template}`
                    )
                  }
                  className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl cursor-pointer text-left"
                  style={{
                    backgroundColor: 'var(--sa-white)',
                    border: '1px solid var(--sa-gray-200)'
                  }}
                >
                  <div
                    className="relative h-40 overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, var(--sa-primary-light) 0%, var(--sa-primary-medium) 100%)`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <item.icon className="w-16 h-16" style={{ color: 'var(--sa-primary-dark)' }} />
                    </div>
                    {item.badge && (
                      <div
                        className="absolute top-3 left-3 px-3 py-1 rounded-full backdrop-blur-sm"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid var(--sa-gray-200)'
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--sa-font-primary)',
                            fontSize: 'var(--sa-text-xs)',
                            fontWeight: 'var(--sa-weight-medium)',
                            color: 'var(--sa-primary-dark)'
                          }}
                        >
                          {item.badge}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3
                      className="line-clamp-2 group-hover:text-primary transition-colors"
                      style={{
                        fontFamily: 'var(--sa-font-primary)',
                        fontSize: 'var(--sa-text-base)',
                        fontWeight: 'var(--sa-weight-semibold)',
                        color: 'var(--sa-black)',
                        lineHeight: '1.4'
                      }}
                    >
                      {item.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
