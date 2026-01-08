import Link from 'next/link';
import { ArrowLeft, Box } from 'lucide-react';
import styles from './project-layout.module.css';
import { getProject } from './actions';
import NavTabs from './NavTabs';

export default async function ProjectLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>; // Updated for Next.js 15+ async params
}) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        return <div>Project not found</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={styles.breadcrumb}>
                        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ArrowLeft size={14} /> Projects
                        </Link>
                        <span>/</span>
                        <span>{project.name}</span>
                    </div>
                    <h1 className={styles.title}>
                        <Box size={24} style={{ color: 'var(--primary)' }} />
                        {project.name}
                    </h1>
                </div>
                <NavTabs projectId={id} />
            </div>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}
