
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Plus, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/favorites', icon: Heart, label: 'Favorites' },
  { href: '/post', icon: Plus, label: 'Post' },
  { href: '/profile', icon: Menu, label: 'Menu' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { appUser } = useAuth();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-primary backdrop-blur-sm border-t">
      <nav className="mx-auto flex h-full max-w-md items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === '/home'
              ? pathname === item.href
              : pathname.startsWith(item.href);
          
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 h-full transition-colors text-primary-foreground/70 hover:text-primary-foreground',
                isActive && 'text-primary-foreground'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
