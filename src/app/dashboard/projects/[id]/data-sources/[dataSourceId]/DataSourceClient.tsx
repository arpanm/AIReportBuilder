'use client';

import { Database, FileSpreadsheet, ArrowLeft, Table, Code, Sparkles, Loader2, Pencil, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { updateDataSource, generateDataSourceQueries } from '../actions';
import { useRouter } from 'next/navigation';

export default function DataSourceClient({ dataSource }: { dataSource: any }) {
    const router = useRouter();
    const schema = JSON.parse(dataSource.schema || '{}');
    const tables = schema.tables || [];

    // State for Name Editing
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(dataSource.name);
    const [updating, setUpdating] = useState(false);

    // State for AI Queries
    const [isGenerating, setIsGenerating] = useState(false);
    // Parse sample queries if they exist in DB, otherwise use empty array
    const [sampleQueries, setSampleQueries] = useState<string[]>(
        dataSource.sampleQueries ? JSON.parse(dataSource.sampleQueries) : []
    );

    const handleUpdateName = async () => {
        if (!editedName.trim()) return;
        setUpdating(true);
        const res = await updateDataSource(dataSource.id, { name: editedName });
        if (res.error) {
            alert(res.error);
        } else {
            setIsEditing(false);
            router.refresh();
        }
        setUpdating(false);
    };

    const handleGenerateQueries = async () => {
        setIsGenerating(true);
        const res = await generateDataSourceQueries(dataSource.id);
        if (res.error) {
            alert(res.error);
        } else {
            setSampleQueries(res.data);
            router.refresh();
        }
        setIsGenerating(false);
    };

    // Helper to generate basic fallback queries if AI ones aren't available yet
    const generateFallbackQueries = (table: any) => {
        const tableName = table.name;
        return [
            `Show me all records from ${tableName}`,
            `Count the number of entries in ${tableName}`
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
                <div style={{ flex: 1 }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                style={{
                                    fontSize: '1.75rem', fontWeight: 700, background: 'transparent',
                                    border: '1px solid var(--border)', color: 'var(--foreground)',
                                    borderRadius: '8px', padding: '4px 8px', width: '100%', maxWidth: '400px'
                                }}
                                autoFocus
                            />
                            <button onClick={handleUpdateName} disabled={updating} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                {updating ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                            </button>
                            <button onClick={() => { setIsEditing(false); setEditedName(dataSource.name); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={24} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{dataSource.name}</h1>
                            <button onClick={() => setIsEditing(true)} style={{ opacity: 0.5, cursor: 'pointer', background: 'none', border: 'none', color: 'var(--foreground)' }} title="Edit Name">
                                <Pencil size={20} />
                            </button>
                        </div>
                    )}
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

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Sample Queries</h4>
                                <button
                                    onClick={handleGenerateQueries}
                                    disabled={isGenerating}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'var(--primary)', color: 'white',
                                        border: 'none', padding: '6px 12px', borderRadius: '6px',
                                        fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                                        opacity: isGenerating ? 0.7 : 1
                                    }}
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                    Generate AI Queries
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {(sampleQueries.length > 0 ? sampleQueries : generateFallbackQueries(table)).map((query: string, qIdx: number) => (
                                    <Link
                                        key={qIdx}
                                        href={`/dashboard/projects/${dataSource.projectId}/reports/new?prompt=${encodeURIComponent(query)}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div style={{
                                            display: 'flex', gap: '0.75rem', alignItems: 'start', padding: '0.75rem',
                                            background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)',
                                            transition: 'border-color 0.2s', cursor: 'pointer'
                                        }}
                                            className="hover:border-blue-500"
                                        >
                                            <Code size={16} style={{ marginTop: '0.2rem', color: 'var(--primary)', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{query}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
