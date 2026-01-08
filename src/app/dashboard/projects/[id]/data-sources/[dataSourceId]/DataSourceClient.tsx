'use client';

import { Database, FileSpreadsheet, ArrowLeft, Table, Code } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DataSourceClient({ dataSource }: { dataSource: any }) {
    const schema = JSON.parse(dataSource.schema || '{}');
    const tables = schema.tables || [];

    // Helper to generate sample queries based on schema
    const generateSampleQueries = (table: any) => {
        const tableName = table.name;
        const columns = table.columns.map((c: any) => c.name).join(', ');

        return [
            `Show me all records from ${tableName}`,
            `Count the number of entries in ${tableName}`,
            `Show me distribution of ${tableName} by ${table.columns[1]?.name || table.columns[0]?.name}`,
            `Analyze trends in ${tableName} over time`
        ];
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <Link
                href={`/dashboard/projects/${dataSource.projectId}/data-sources`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', textDecoration: 'none' }}
            >
                <ArrowLeft size={16} /> Back to Sources
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    background: dataSource.type === 'EXCEL' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: dataSource.type === 'EXCEL' ? '#10b981' : '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {dataSource.type === 'EXCEL' ? <FileSpreadsheet size={28} /> : <Database size={28} />}
                </div>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{dataSource.name}</h1>
                    <div style={{ color: 'var(--text-muted)' }}>{dataSource.type} Connection</div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                {tables.map((table: any, idx: number) => (
                    <div key={idx} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Table size={20} className="text-blue-400" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{table.name}</h3>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Schema</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '2rem' }}>
                                {table.columns.map((col: any, cIdx: number) => (
                                    <div key={cIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--background)', borderRadius: '6px', fontSize: '0.9rem' }}>
                                        <span style={{ fontWeight: 500 }}>{col.name}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{col.type}</span>
                                    </div>
                                ))}
                            </div>

                            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Sample Queries</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {generateSampleQueries(table).map((query: string, qIdx: number) => (
                                    <div key={qIdx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start', padding: '0.75rem', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <Code size={16} style={{ marginTop: '0.2rem', color: 'var(--primary)', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{query}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
