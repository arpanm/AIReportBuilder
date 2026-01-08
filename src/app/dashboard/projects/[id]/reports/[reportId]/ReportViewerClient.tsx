'use client';

import { Calendar, User, Bell } from 'lucide-react';
import ChartRenderer from '../new/ChartRenderer';
import ShareButton from './ShareButton';
import AlertButton from './AlertButton';
import { useState } from 'react';
import Link from 'next/link';

export default function ReportViewerClient({ report, projectId }: { report: any, projectId: string }) {
    const [vizConfig] = useState(() => {
        try {
            return JSON.parse(report.vizConfig);
        } catch (e) {
            return {};
        }
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{report.title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
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
                        <ChartRenderer type={report.vizType} config={vizConfig} />
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>AI Insight</h3>
                        <p style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>{report.aiInsight}</p>
                    </div>

                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Configuration</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Original Prompt</label>
                                <div style={{ fontSize: '0.95rem', fontStyle: 'italic' }}>"{report.prompt}"</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>SQL Query</label>
                                <code style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', display: 'block', overflowX: 'auto' }}>
                                    {report.query}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
