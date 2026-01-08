'use client';

import { useState } from 'react';
import { X, UserPlus, Loader2, Check } from 'lucide-react';

interface ShareResourceModalProps {
    resourceName: string; // "Project" or "Report"
    isOpen: boolean;
    onClose: () => void;
    onShare: (email: string, role: string) => Promise<any>;
}

export default function ShareResourceModal({ resourceName, isOpen, onClose, onShare }: ShareResourceModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('VIEW_ONLY');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        const res = await onShare(email, role);
        if (res.error) {
            setError(res.error);
        } else {
            setSuccess(true);
            setEmail('');
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        }
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '450px',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.75rem', borderRadius: '12px' }}>
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Share {resourceName}</h2>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Invite others to collaborate</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem' }}>User Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem' }}>Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)'
                            }}
                        >
                            <option value="VIEW_ONLY">View Only</option>
                            <option value="EDITOR">Editor</option>
                        </select>
                    </div>

                    {error && <p style={{ color: 'var(--error, #ef4444)', fontSize: '0.9rem' }}>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || success}
                        style={{
                            background: success ? 'var(--success, #10b981)' : 'var(--primary)',
                            color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px',
                            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            marginTop: '0.5rem'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (success ? <><Check size={20} /> Shared!</> : 'Invite User')}
                    </button>
                </form>
            </div>
        </div>
    );
}
