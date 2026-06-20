'use client';

import { useEffect, useState } from 'react';
import { Wind, Lightbulb, CircleDot, RotateCw } from 'lucide-react';

interface Actuator {
    id: string;
    name: string;
    type: string;
    state: boolean;
    manualOverride: boolean;
}

const iconMap: Record<string, { icon: React.ElementType; cls: string }> = {
    fan: { icon: Wind, cls: 'fan' },
    lamp: { icon: Lightbulb, cls: 'lamp' },
    led: { icon: CircleDot, cls: 'led' },
    conveyor: { icon: RotateCw, cls: 'fan' },
};

export default function ActuatorControls({ actuators }: { actuators: Actuator[] }) {
    const [states, setStates] = useState<Record<string, boolean>>(
        Object.fromEntries(actuators.map((a) => [a.id, a.state]))
    );
    const [manualOverrides, setManualOverrides] = useState<Record<string, boolean>>(
        Object.fromEntries(actuators.map((a) => [a.id, a.manualOverride]))
    );
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [errored, setErrored] = useState<Record<string, boolean>>({});

    // Sinkron dari server saat dashboard auto-refresh, tapi jangan timpa
    // aktuator yang lagi di tengah toggle (in-flight).
    const sig = actuators.map((a) => `${a.id}:${a.state}:${a.manualOverride}`).join(',');
    useEffect(() => {
        setStates((prev) => {
            const next = { ...prev };
            for (const a of actuators) if (!loading[a.id]) next[a.id] = a.state;
            return next;
        });
        setManualOverrides((prev) => {
            const next = { ...prev };
            for (const a of actuators) if (!loading[a.id]) next[a.id] = a.manualOverride;
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sig]);

    const toggle = async (actuator: Actuator) => {
        if (loading[actuator.id]) return;
        const prevState = states[actuator.id] ?? actuator.state;
        const prevManual = manualOverrides[actuator.id] ?? actuator.manualOverride;

        // Optimistic: langsung flip biar terasa instan.
        setLoading((l) => ({ ...l, [actuator.id]: true }));
        setErrored((e) => ({ ...e, [actuator.id]: false }));
        setStates((s) => ({ ...s, [actuator.id]: !prevState }));
        setManualOverrides((s) => ({ ...s, [actuator.id]: true }));

        try {
            const res = await fetch(`/api/actuators/${actuator.id}/toggle`, { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setStates((s) => ({ ...s, [actuator.id]: data.state }));
            setManualOverrides((s) => ({ ...s, [actuator.id]: data.manualOverride }));
        } catch (err) {
            console.error('Toggle error:', err);
            // Revert kalau gagal.
            setStates((s) => ({ ...s, [actuator.id]: prevState }));
            setManualOverrides((s) => ({ ...s, [actuator.id]: prevManual }));
            setErrored((e) => ({ ...e, [actuator.id]: true }));
        } finally {
            setLoading((l) => ({ ...l, [actuator.id]: false }));
        }
    };

    const setAuto = async (actuator: Actuator) => {
        if (loading[actuator.id]) return;
        setLoading((l) => ({ ...l, [actuator.id]: true }));
        setErrored((e) => ({ ...e, [actuator.id]: false }));

        try {
            const res = await fetch(`/api/actuators/${actuator.id}/auto`, { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setStates((s) => ({ ...s, [actuator.id]: data.state }));
            setManualOverrides((s) => ({ ...s, [actuator.id]: data.manualOverride }));
        } catch (err) {
            console.error('Auto mode error:', err);
            setErrored((e) => ({ ...e, [actuator.id]: true }));
        } finally {
            setLoading((l) => ({ ...l, [actuator.id]: false }));
        }
    };

    return (
        <div className="chart-card">
            <div className="chart-card-header" style={{ marginBottom: 16 }}>
                <div>
                    <div className="chart-card-title">⚡ Kontrol Aktuator</div>
                    <div className="chart-card-subtitle">Kipas 1, kipas 2, lampu, conveyor</div>
                </div>
            </div>
            <div className="actuator-list">
                {actuators.map((a) => {
                    const { icon: Icon, cls } = iconMap[a.type] || { icon: CircleDot, cls: 'led' };
                    const isOn = states[a.id] ?? a.state;
                    const isManual = manualOverrides[a.id] ?? a.manualOverride;
                    const isLoading = loading[a.id];
                    const isError = errored[a.id];

                    return (
                        <div className="actuator-item" key={a.id}>
                            <div className={`actuator-icon ${cls}`}>
                                <Icon size={17} />
                            </div>
                            <div className="actuator-info">
                                <div className="actuator-name">{a.name}</div>
                                <div className="actuator-state">
                                    {isError ? (
                                        <span style={{ color: 'var(--danger)' }}>⚠ Gagal, coba lagi</span>
                                    ) : (
                                        <>
                                            {isLoading ? 'Mengubah...' : isOn ? '● Menyala' : '○ Mati'}
                                            {' · '}
                                            {isManual ? 'Manual' : 'Auto'}
                                        </>
                                    )}
                                </div>
                            </div>
                            {/* Slot kanan lebar tetap: tombol Auto pakai visibility biar
                                toggle tidak bergeser saat mode berubah. */}
                            <div className="actuator-controls">
                                <button
                                    type="button"
                                    onClick={() => setAuto(a)}
                                    disabled={isLoading || !isManual}
                                    className="actuator-auto-btn"
                                    style={{ visibility: isManual ? 'visible' : 'hidden' }}
                                    aria-hidden={!isManual}
                                    tabIndex={isManual ? 0 : -1}
                                >
                                    Auto
                                </button>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={isOn}
                                        onChange={() => toggle(a)}
                                        disabled={isLoading}
                                        aria-label={`${a.name} ${isOn ? 'nyala' : 'mati'}`}
                                    />
                                    <span className="toggle-slider" />
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
