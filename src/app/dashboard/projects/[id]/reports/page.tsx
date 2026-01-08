import Link from 'next/link';
import { Plus, FileBarChart, Calendar, User } from 'lucide-react';
import { getReports } from './actions';
import DeleteReportButton from './DeleteReportButton';

export default async function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const reports = await getReports(id);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Reports</h2>
                <Link
                    href={`/dashboard/projects/${id}/reports/new`}
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
                    <Plus size={18} /> New Report
                </Link>
            </div>

            {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                    <FileBarChart size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Reports Generated</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Use the AI Report Builder to create your first insight.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {reports.map((report: any) => (
                        <Link href={`/dashboard/projects/${id}/reports/${report.id}`} key={report.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', transition: 'border-color 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{report.title}</div>
                                    <div style={{ flexShrink: 0 }}>
                                        <DeleteReportButton reportId={report.id} />
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>“{report.prompt.substring(0, 60)}...”</div>

                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} suppressHydrationWarning>
                                        <Calendar size={14} />
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <User size={14} />
                                        {report.creator.name}
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
