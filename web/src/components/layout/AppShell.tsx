'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

interface AppShellProps {
    isOnline: boolean;
    lastSeen: string | null;
    children: React.ReactNode;
}

export default function AppShell({ isOnline, lastSeen, children }: AppShellProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Tutup drawer otomatis saat pindah halaman.
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Kunci scroll body saat drawer terbuka di mobile.
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <div className="app-layout">
            <div
                className={`sidebar-overlay ${open ? 'show' : ''}`}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />
            <Sidebar
                isOnline={isOnline}
                lastSeen={lastSeen}
                open={open}
                onNavigate={() => setOpen(false)}
            />
            <div className="main-wrap">
                <header className="mobile-topbar">
                    <button
                        type="button"
                        className="mobile-menu-btn"
                        onClick={() => setOpen(true)}
                        aria-label="Buka menu"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="mobile-topbar-title">
                        <span className="mobile-topbar-logo">🥚</span>
                        EggMonitor
                    </div>
                    <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
                </header>
                <main className="main-content">{children}</main>
            </div>
        </div>
    );
}
