import Logo from './Logo';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons';
import { Trash, Undo } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NavBar({ onClear, canClear, onSocialClick, onUndo, canUndo }) {
  return (
    <nav className="w-full flex bg-background py-4">
      <div className="flex flex-1 items-center">
        <Link to="/super-agent" className="flex items-center gap-2">
          <Logo width={24} height={24} />
          <h1 className="whitespace-pre">Gamepac Super Agent </h1>
        </Link>
      </div>
      <div className="flex items-center gap-1 md:gap-4">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo}>
                <Undo className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                disabled={!canClear}
              >
                <Trash className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <ThemeToggle />
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  );
}
