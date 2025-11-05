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
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <div className="w-full min-w-screen flex flex-col items-center justify-center py-40">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-10">
            Gamepac Super Agent{' '}
            <CircleArrowRight size={16} className="animate-pulse" />
          </h1>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl animate-fade-in-delay-2"
          >
            <div className="relative group">
              <div className="relative bg-background border-2 border-border group-hover:border-primary/50 rounded-3xl shadow-2xl transition-all duration-300 pb-10">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask anything, create anything"
                  className="flex-1 p-4 text-base bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground resize-none w-full"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute bottom-0 right-0 m-4 bg-white rounded-xl p-2"
                  disabled={!prompt.trim()}
                >
                  <CornerDownLeft className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>
          </form>
          <div className="flex flex-wrap gap-4 my-10">
            {features.map((feature) => (
              <div
                key={feature.label}
                onClick={() =>
                  handleFeatureClick(feature.template, feature.label)
                }
                className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="rounded-full bg-primary/10 hover:bg-primary/20 p-2 w-[50px] h-[50px] flex items-center justify-center transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>
                <p className="text-[13px] font-normal w-[100px] text-center">
                  {feature.label}
                </p>
              </div>
            ))}
          </div>

          <div className="w-full mt-20 px-4">
            <div className="flex items-center justify-center mb-6">
              <hr className="w-[200px] border-border mr-5 border-muted-foreground" />
              <div className="px-10 py-[2px] bg-white rounded-full border border-border">
                <span className="text-sm font-medium text-black">For You</span>
              </div>
              <hr className="w-[200px] border-border ml-5 border-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {showcaseItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() =>
                    navigate(
                      `/super-agent/fragments?prompt=${encodeURIComponent(item.prompt)}&template=${item.template}`
                    )
                  }
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <item.icon className="w-20 h-20 text-primary/30" />
                    </div>
                    {item.badge && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full border border-border">
                        <span className="text-xs font-medium">
                          {item.badge}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-left line-clamp-2 group-hover:text-primary transition-colors">
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
  );
}
