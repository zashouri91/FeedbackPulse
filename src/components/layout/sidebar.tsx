import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboardIcon, UsersIcon, BarChart3Icon, Settings2Icon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
  { name: 'Management', href: '/management', icon: UsersIcon },
  { name: 'Analytics', href: '/analytics', icon: BarChart3Icon },
  { name: 'Settings', href: '/settings', icon: Settings2Icon },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-full flex-col gap-y-5 bg-muted/40 px-6 py-4">
      <div className="flex h-16 shrink-0 items-center text-2xl font-bold">FeedbackPulse</div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map(item => (
                <li key={item.name}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-x-3',
                      location.pathname === item.href &&
                        'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}
