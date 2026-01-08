'use client';

import { Calendar, User } from 'lucide-react';
import ChartRenderer from '@/app/dashboard/projects/[id]/reports/new/ChartRenderer';
import { useState } from 'react';

export default function PublicReportViewer({ report }: { report: any }) {
    const [vizConfig] = useState(() => {
        try {
            return JSON.parse(report.vizConfig);
        } catch (e) {
            return {};
        }
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{report.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} /> {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <User size={14} /> {report.creator?.name || 'Unknown'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Visualization</h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ChartRenderer type={report.vizType} config={vizConfig} />
                    </div>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>AI Insight</h3>
                    <p style={{ lineHeight: '1.6', color: '#cbd5e1', fontSize: '1.05rem' }}>{report.aiInsight}</p>
                </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                Powered by AI Report Builder
            </div>
        </div>
    );
}
