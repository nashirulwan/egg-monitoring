'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Refresh data server-rendered (status aktuator, summary, device) secara
// berkala tanpa reload halaman. Berhenti saat tab tidak aktif biar hemat.
export default function DashboardAutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
    const router = useRouter();

    useEffect(() => {
        const tick = () => {
            if (document.visibilityState === 'visible') router.refresh();
        };
        const id = window.setInterval(tick, intervalMs);
        return () => window.clearInterval(id);
    }, [router, intervalMs]);

    return null;
}
