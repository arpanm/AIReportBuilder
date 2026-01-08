import Link from 'next/link';
import { Plus, Database, FileSpreadsheet } from 'lucide-react';
import { getDataSources } from '../actions';

export default async function DataSourcesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const dataSources = await getDataSources(id);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Data Sources</h2>
                <Link
                    href={`/dashboard/projects/${id}/data-sources/new`}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textDecoration: 'none'
                    }}
                >
                    <Plus size={18} /> Add Source
                </Link>
            </div>

            {dataSources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                    <Database size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Data Sources Connected</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Connect a database or upload an Excel file to start analyzing.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {dataSources.map((ds: any) => (
                        <Link href={`/dashboard/projects/${id}/data-sources/${ds.id}`} key={ds.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }} className="hover:border-blue-500 hover:-translate-y-1">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '8px',
                                        background: ds.type === 'EXCEL' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                        color: ds.type === 'EXCEL' ? '#10b981' : '#3b82f6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {ds.type === 'EXCEL' ? <FileSpreadsheet size={20} /> : <Database size={20} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{ds.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ds.type}</div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
