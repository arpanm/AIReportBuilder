import Link from 'next/link';
import { Plus, FolderOpen, Database, FileBarChart } from 'lucide-react';
import styles from './dashboard.module.css';
import { getProjects } from './projects/actions';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const projects = await getProjects();

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Projects</h1>
                <Link href="/dashboard/projects/new" className={styles.createButton}>
                    <Plus size={20} />
                    <span>New Project</span>
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className={styles.emptyState}>
                    <FolderOpen size={48} className={styles.emptyIcon} />
                    <h2 className={styles.emptyTitle}>No projects found</h2>
                    <p className={styles.emptyDesc}>
                        Get started by creating your first project to connect data sources and generate insightful reports.
                    </p>
                    <Link href="/dashboard/projects/new" className={styles.createButton} style={{ marginTop: '1.5rem' }}>
                        Create Project
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {projects.map((project: any) => (
                        <Link href={`/dashboard/projects/${project.id}`} key={project.id} className={styles.projectCard} style={{
                            display: 'block',
                            background: 'var(--surface)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            border: '1px solid var(--border)',
                            transition: 'all 0.2s',
                            textDecoration: 'none'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <FolderOpen size={24} />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>{project.name}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {project.description || 'No description provided.'}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <Database size={14} />
                                    <span>{project._count.dataSources} Sources</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <FileBarChart size={14} />
                                    <span>{project._count.reports} Reports</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
