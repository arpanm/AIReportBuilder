'use client';

import { useState } from 'react';
import { Share2, Mail, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { generateShareToken } from '../alerts-actions'; // path might need adjustment based on file location

export default function ShareButton({ reportId }: { reportId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [publicLink, setPublicLink] = useState('');

    const handleCreateLink = async () => {
        if (publicLink) {
            copyToClipboard(publicLink);
            return;
        }

        setLoading(true);
        const res = await generateShareToken(reportId);
        if (res.success && res.token) {
            const url = `${window.location.origin}/share/${res.token}`;
            setPublicLink(url);
            copyToClipboard(url);
        } else {
            alert('Failed to generate link');
        }
        setLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEmailShare = () => {
        const subject = encodeURIComponent("Check out this report");
        const body = encodeURIComponent(`I wanted to share this report with you: ${publicLink || window.location.href}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    cursor: 'pointer'
                }}
            >
                <Share2 size={16} /> Share
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    zIndex: 50,
                    width: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                }}>
                    <button
                        onClick={handleCreateLink}
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-main)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            borderRadius: '6px'
                        }}
                        className="hover:bg-slate-700"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : (copied ? <Check size={16} color="var(--success)" /> : <LinkIcon size={16} />)}
                        {loading ? 'Generating...' : (copied ? 'Copied Link!' : 'Copy Public Link')}
                    </button>

                    <button
                        onClick={handleEmailShare}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-main)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            borderRadius: '6px'
                        }}
                    >
                        <Mail size={16} />
                        Email Report
                    </button>
                </div>
            )}
        </div>
    );
}
