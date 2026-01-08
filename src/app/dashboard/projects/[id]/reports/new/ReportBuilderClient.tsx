'use client';

import { useState, useEffect, Suspense } from 'react';
import { Send, Save, Loader2, Sparkles, BarChart2 } from 'lucide-react';
import styles from './report-builder.module.css';
import { generateReportInsight, saveReport } from '../actions';
import ChartRenderer from './ChartRenderer';
import { useRouter, useSearchParams } from 'next/navigation';

function ReportBuilderInternal({ projectId }: { projectId: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [prompt, setPrompt] = useState('');

    useEffect(() => {
        const p = searchParams.get('prompt');
        if (p) setPrompt(p);
    }, [searchParams]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [result, setResult] = useState<any>(null);

    // State for manual query editing
    const [editedQuery, setEditedQuery] = useState('');
    const [regenerating, setRegenerating] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResult(null);
        setSaved(false);

        const res = await generateReportInsight(projectId, prompt);
        if (res.error) {
            alert(res.error);
        } else {
            setResult(res.data);
            setEditedQuery(res.data.query); // Initialize edited query
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!result) return;
        setSaving(true);
        const saveRes = await saveReport(projectId, {
            ...result,
            query: editedQuery, // Use the potentially edited query
            prompt,
            title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt
        });

        if (saveRes.error) {
            alert(saveRes.error);
        } else {
            setSaved(true);
            router.push(`/dashboard/projects/${projectId}/reports`);
            router.refresh();
        }
        setSaving(false);
    };

    const handleRegenerateFromQuery = async () => {
        if (!editedQuery) return;
        setRegenerating(true);
        const { regenerateReportFromQuery } = await import('../actions'); // Dynamic import to avoid circular dep if any

        const res = await regenerateReportFromQuery(projectId, editedQuery);
        if (res.error) {
            alert(res.error);
        } else {
            setResult((prev: any) => ({
                ...prev,
                query: res.data.query,
                vizType: res.data.vizType,
                vizConfig: res.data.vizConfig,
                insight: res.data.insight
            }));
            setSaved(false); // Valid modification allow resaving
        }
        setRegenerating(false);
    }

    return (
        <div className={styles.container}>
            <div className={styles.chatSection}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Sparkles size={18} color="#818cf8" />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Ask AI to generate a report</h2>
                </div>
                <div className={styles.inputArea}>
                    <textarea
                        className={styles.promptInput}
                        placeholder="e.g. 'Show me monthly revenue by region for the last year as a bar chart'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleGenerate();
                            }
                        }}
                    />
                    <button className={styles.sendButton} onClick={handleGenerate} disabled={loading || !prompt.trim()}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                </div>
            </div>

            <div className={styles.previewSection}>
                {result ? (
                    <>
                        <div className={styles.vizCard}>
                            <div className={styles.cardTitle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BarChart2 size={20} color="var(--primary)" />
                                    <span>Preview: {result.vizType}</span>
                                </div>
                                {!saved && (
                                    <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
                                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        Save Report
                                    </button>
                                )}
                            </div>
                            <div className={styles.chartContainer}>
                                <ChartRenderer type={result.vizType} config={result.vizConfig} />
                            </div>
                        </div>
                        <div className={styles.insightCard}>
                            <div className={styles.cardTitle}>AI Insight & Query</div>
                            <div style={{ lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                {result.insight}
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Generated Query (Editable):</div>
                                    <button
                                        onClick={handleRegenerateFromQuery}
                                        disabled={regenerating || editedQuery === result.query} // Enable only if changed
                                        style={{
                                            background: 'var(--primary)', color: 'white', border: 'none',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                            opacity: (regenerating || editedQuery === result.query) ? 0.5 : 1
                                        }}
                                    >
                                        {regenerating && <Loader2 className="animate-spin" size={12} />}
                                        Regenerate Viz
                                    </button>
                                </div>
                                <textarea
                                    value={editedQuery}
                                    onChange={(e) => {
                                        setEditedQuery(e.target.value);
                                        // If query is modified, we allow saving again after regeneration, 
                                        // or maybe we should disable save until regenerated?
                                        // User said "if modified, have a button to regenerate... and enable save button"
                                        // So we keep save enabled but updating the query only happens on save if we use editedQuery state.
                                        setSaved(false);
                                    }}
                                    style={{
                                        width: '100%', minHeight: '80px', background: 'rgba(0,0,0,0.3)',
                                        color: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)',
                                        fontFamily: 'monospace', fontSize: '0.8rem'
                                    }}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', opacity: 0.5, border: '2px dashed var(--border)', borderRadius: '16px' }}>
                        <Sparkles size={48} />
                        <p>Enter a prompt above to see magic happen</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ReportBuilderClient(props: { projectId: string }) {
    return (
        <Suspense fallback={<div>Loading builder...</div>}>
            <ReportBuilderInternal {...props} />
        </Suspense>
    );
}
