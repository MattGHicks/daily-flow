'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Calendar,
  MessageSquare,
  BarChart3,
  Music,
  Settings,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ListTodo },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

const secondaryNavigation = [
  { name: 'Music', href: '/dashboard/music', icon: Music },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
    // Small delay to ensure the state is set before enabling animations
    setTimeout(() => setHasLoadedFromStorage(true), 50);
  }, []);

  // Save to localStorage whenever collapsed state changes (only after mount)
  useEffect(() => {
    if (isMounted && hasLoadedFromStorage) {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    }
  }, [isCollapsed, isMounted, hasLoadedFromStorage]);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{
        duration: hasLoadedFromStorage ? 0.3 : 0,
        ease: 'easeInOut'
      }}
      className="relative flex h-screen flex-col bg-card border-r border-border"
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: hasLoadedFromStorage ? 0 : 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: hasLoadedFromStorage ? 0 : 1 }}
              transition={{ duration: hasLoadedFromStorage ? 0.2 : 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60">
                <span className="text-primary-foreground font-bold text-lg">DF</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none">
                  Daily Flow
                </h1>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  Workflow Dashboard
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: hasLoadedFromStorage ? 0 : 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: hasLoadedFromStorage ? 0 : 1 }}
              transition={{ duration: hasLoadedFromStorage ? 0.2 : 0 }}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 mx-auto"
            >
              <span className="text-primary-foreground font-bold text-lg">DF</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-[72px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Quick Create Button */}
      <div className="p-4">
        <Link href="/dashboard/tasks?create=true">
          <Button
            className={cn(
              'w-full gap-2',
              isCollapsed ? 'px-0 justify-center' : 'justify-start'
            )}
            size="lg"
          >
            <PlusCircle className="h-5 w-5 shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: hasLoadedFromStorage ? 0 : 1, width: hasLoadedFromStorage ? 0 : 'auto' }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: hasLoadedFromStorage ? 0 : 1, width: hasLoadedFromStorage ? 0 : 'auto' }}
                  transition={{ duration: hasLoadedFromStorage ? 0.2 : 0 }}
                >
                  Quick Create
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto scrollbar-thin">
        <div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href} className="block mb-2">
                <motion.div
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    isCollapsed && 'justify-center px-0'
                  )}
                  whileHover={{ x: isCollapsed ? 0 : 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: hasLoadedFromStorage ? 0 : 1, width: hasLoadedFromStorage ? 0 : 'auto' }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: hasLoadedFromStorage ? 0 : 1, width: hasLoadedFromStorage ? 0 : 'auto' }}
                        transition={{ duration: hasLoadedFromStorage ? 0.2 : 0 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-primary/10"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-border" />

        {/* Secondary Navigation */}
        <div>
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href} className="block mb-2">
                <motion.div
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    isCollapsed && 'justify-center px-0'
                  )}
                  whileHover={{ x: isCollapsed ? 0 : 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: hasLoadedFromStorage ? 0 : 1, width: hasLoadedFromStorage ? 0 : 'auto' }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: hasLoadedFromStorage ? 0 : 1, width: hasLoadedFromStorage ? 0 : 'auto' }}
                        transition={{ duration: hasLoadedFromStorage ? 0.2 : 0 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-auto border-t border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Matt</p>
              <p className="text-xs text-muted-foreground truncate">Solo User</p>
            </div>
          </div>
        </motion.div>
      )}

      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-auto border-t border-border p-4 flex justify-center"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
            M
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
