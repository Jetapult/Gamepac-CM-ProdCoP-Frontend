import { HardDrive, House, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import gamepacLogo from '../../../assets/super-agents/gamepac-logo.svg';
import newIcon from '../../../assets/super-agents/new-icon.svg';

const sidebarItems = [
  {
    icon: newIcon,
    label: 'New',
    slug: 'new',
    href: '/super-agent/fragments',
  },
  {
    icon: HardDrive,
    label: 'AI Drive',
    slug: 'ai-drive',
    href: '/super-agent/ai-drive',
  },
];

export function Sidebar() {
  const location = useLocation();
  return (
    <div
      className="h-full p-3 w-[64px] fixed left-0 top-0 z-10"
      style={{ backgroundColor: 'var(--sa-white)' }}
    >
      <div className="flex flex-col gap-6">
        <Link
          to="/super-agent"
          className="flex flex-col mb-3 mt-2 items-center gap-4 rounded-lg transition-colors group"
        >
          <img src={gamepacLogo} alt="Gamepac Logo" className="w-10 h-10" />
        </Link>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href ||
                          (item.href !== '/super-agent' && location.pathname.startsWith(item.href));
          const isNewButton = item.slug === 'new';

          return (
            <Link
              to={item.href}
              key={item.label}
              className="flex flex-col items-center gap-1.5 transition-all group"
            >
              <div
                className="rounded-lg p-2 transition-all"
                style={{
                  backgroundColor: isActive
                    ? 'var(--sa-gray-100)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--sa-primary-dark)'
                    : 'var(--sa-gray-600)'
                }}
              >
                {isNewButton ? <img src={newIcon} alt="New" className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                style={{
                  fontFamily: 'var(--sa-font-primary)',
                  fontSize: '10px',
                  fontWeight: 'var(--sa-weight-medium)',
                  color: isActive ? 'var(--sa-primary-dark)' : 'var(--sa-gray-500)'
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
