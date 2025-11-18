import { HardDrive, House, Plus, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const sidebarItems = [
  {
    icon: Plus,
    label: 'New',
    href: '/super-agent/fragments',
  },
  {
    icon: House,
    label: 'Home',
    href: '/super-agent',
  },
  {
    icon: HardDrive,
    label: 'AI Drive',
    href: '/super-agent/ai-drive',
  },
];

export function Sidebar() {
  const location = useLocation();
  return (
    <div className="h-full bg-background p-2 w-[60px]">
      <div className="flex flex-col gap-6">
        <Link
          to="/super-agent"
          className="flex flex-col mb-3 mt-3 items-center gap-4 rounded-lg transition-colors group"
        >
          <Sparkles className="w-5 h-5" />
        </Link>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              to={item.href}
              key={item.label}
              className="flex flex-col items-center gap-1 transition-colors group mb-1"
            >
              <div
                className={`text-muted-foreground rounded-md p-1 py-1.5 group-hover:text-primary group-hover:bg-accent transition-colors ${location.pathname.includes(item.href) ? 'bg-accent' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-muted-foreground text-[10px] font-normal">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
