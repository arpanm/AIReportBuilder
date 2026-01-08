'use client';

import { useState } from 'react';
import { Send, Save, Loader2, Sparkles, BarChart2 } from 'lucide-react';
import styles from './report-builder.module.css';
import { generateReportInsight, saveReport } from '../actions';
import ChartRenderer from './ChartRenderer';
import { useRouter } from 'next/navigation';

export default function ReportBuilderClient({ projectId }: { projectId: string }) {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResult(null); // Clear previous result

        const res = await generateReportInsight(projectId, prompt);
        if (res.error) {
            alert(res.error);
        } else {
            setResult(res.data);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!result) return;
        setSaving(true);
        const saveRes = await saveReport(projectId, {
            ...result,
            prompt,
            title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt
        });

        if (saveRes.error) {
            alert(saveRes.error);
        } else {
            router.push(`/dashboard/projects/${projectId}/reports`);
            router.refresh();
        }
        setSaving(false);
    };

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
                                <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save Report
                                </button>
                            </div>
                            <div className={styles.chartContainer}>
                                <ChartRenderer type={result.vizType} config={result.vizConfig} />
                            </div>
                        </div>
                        <div className={styles.insightCard}>
                            <div className={styles.cardTitle}>AI Insight</div>
                            <div style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                {result.insight}
                            </div>
                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Generated Query:</div>
                                <code style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', display: 'block', overflowX: 'auto' }}>
                                    {result.query}
                                </code>
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
