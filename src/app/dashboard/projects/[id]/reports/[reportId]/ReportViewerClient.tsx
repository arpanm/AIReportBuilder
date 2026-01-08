'use client';

import { Calendar, User, Bell, Save, Loader2, RefreshCw, Pencil } from 'lucide-react';
import ChartRenderer from '../new/ChartRenderer';
import ShareButton from './ShareButton';
import AlertButton from './AlertButton';
import { useState } from 'react';
import Link from 'next/link';
import { updateReport, regenerateReportFromQuery } from '../actions';
import { useRouter } from 'next/navigation';

export default function ReportViewerClient({ report, projectId }: { report: any, projectId: string }) {
    const router = useRouter();

    // State to hold current report data (starting with initial prop, but mutable)
    const [currentData, setCurrentData] = useState({
        title: report.title,
        query: report.query,
        vizType: report.vizType,
        vizConfig: JSON.parse(report.vizConfig || '{}'),
        aiInsight: report.aiInsight
    });

    const [editedQuery, setEditedQuery] = useState(report.query);
    const [editedTitle, setEditedTitle] = useState(report.title);
    const [titleEditing, setTitleEditing] = useState(false);

    const [regenerating, setRegenerating] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleRegenerate = async () => {
        if (!editedQuery || editedQuery === currentData.query) return;
        setRegenerating(true);

        const res = await regenerateReportFromQuery(projectId, editedQuery);
        if (res.error) {
            alert(res.error);
        } else {
            setCurrentData(prev => ({
                ...prev,
                query: res.data.query,
                vizType: res.data.vizType,
                vizConfig: res.data.vizConfig,
                aiInsight: res.data.insight
            }));
            // After regeneration, the edited query becomes the current query
            setEditedQuery(res.data.query);
        }
        setRegenerating(false);
    };

    const handleUpdate = async () => {
        setUpdating(true);
        const res = await updateReport(report.id, {
            title: editedTitle, // Use updated title
            query: editedQuery,
            vizType: currentData.vizType,
            vizConfig: currentData.vizConfig,
            aiInsight: currentData.aiInsight
        });

        if (res.error) {
            alert(res.error);
        } else {
            router.refresh();
            // Update baseline to match saved state
            setCurrentData(prev => ({
                ...prev,
                title: editedTitle,
                query: editedQuery
            }));
            setTitleEditing(false);
        }
        setUpdating(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, marginRight: '2rem' }}>
                    {titleEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                            <input
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                style={{
                                    fontSize: '1.8rem', fontWeight: 700, background: 'transparent',
                                    border: '1px solid var(--border)', color: 'var(--foreground)',
                                    borderRadius: '8px', padding: '4px 8px', width: '100%'
                                }}
                                autoFocus
                            />
                            <button onClick={handleUpdate} disabled={updating} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            </button>
                        </div>
                    ) : (
                        <h1
                            style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                            onClick={() => setTitleEditing(true)}
                            title="Click to edit title"
                        >
                            {currentData.title}
                            <Pencil size={18} style={{ opacity: 0.5 }} />
                        </h1>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} suppressHydrationWarning>
                            <Calendar size={14} /> {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <User size={14} /> Created by you
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <ShareButton reportId={report.id} />
                    {/* Alert Button - functionality to be added */}
                    <AlertButton reportId={report.id} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                <div style={{ flex: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Visualization</h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ChartRenderer type={currentData.vizType} config={currentData.vizConfig} />
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>AI Insight</h3>
                        <p style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>{currentData.aiInsight}</p>
                    </div>

                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Configuration</h3>
                            {(editedQuery !== currentData.query || editedTitle !== currentData.title) && ( // Show update button if query OR title changed
                                <button
                                    onClick={handleUpdate}
                                    disabled={updating || regenerating}
                                    style={{
                                        background: 'var(--primary)', color: 'white', border: 'none',
                                        padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                >
                                    {updating ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    Update Report
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Original Prompt</label>
                                <div style={{ fontSize: '0.95rem', fontStyle: 'italic' }}>"{report.prompt}"</div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>SQL Query (Editable)</label>
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={regenerating || editedQuery === currentData.query}
                                        style={{
                                            background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                            opacity: (regenerating || editedQuery === currentData.query) ? 0.5 : 1
                                        }}
                                    >
                                        {regenerating ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                                        Regenerate Viz
                                    </button>
                                </div>
                                <textarea
                                    value={editedQuery}
                                    onChange={(e) => setEditedQuery(e.target.value)}
                                    style={{
                                        width: '100%', minHeight: '120px', background: 'rgba(0,0,0,0.3)',
                                        color: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)',
                                        fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
