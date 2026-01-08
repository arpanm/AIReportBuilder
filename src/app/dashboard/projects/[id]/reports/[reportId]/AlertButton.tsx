'use client';

import { useState } from 'react';
import { Bell, X, Loader2 } from 'lucide-react';
import { createAlert } from '../alerts-actions';

export default function AlertButton({ reportId }: { reportId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [frequency, setFrequency] = useState('DAILY');

    const handleCreateAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await createAlert(reportId, email, frequency);

        setLoading(false);
        if (res.success) {
            setIsOpen(false);
            setEmail('');
            alert('Alert created successfully!');
        } else {
            alert('Failed to create alert');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                }}
                className="hover:border-primary hover:text-primary"
            >
                <Bell size={16} /> Alerts
            </button>

            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#1e293b', width: '400px', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>Set Alert</h3>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateAlert} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: 'white', outline: 'none' }}
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Frequency</label>
                                <select
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: 'white', outline: 'none' }}
                                >
                                    <option value="DAILY">Daily</option>
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{ marginTop: '1rem', background: '#4f46e5', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Alert'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
