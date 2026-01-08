'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './project-layout.module.css';

export default function NavTabs({ projectId }: { projectId: string }) {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    const baseUrl = `/dashboard/projects/${projectId}`;

    return (
        <div className={styles.tabs}>
            <Link href={baseUrl} className={`${styles.tab} ${isActive(baseUrl) ? styles.activeTab : ''}`}>
                Overview
            </Link>
            <Link href={`${baseUrl}/data-sources`} className={`${styles.tab} ${isActive(`${baseUrl}/data-sources`) ? styles.activeTab : ''}`}>
                Data Sources
            </Link>
            <Link href={`${baseUrl}/reports`} className={`${styles.tab} ${isActive(`${baseUrl}/reports`) ? styles.activeTab : ''}`}>
                Reports
            </Link>
            <Link href={`${baseUrl}/settings`} className={`${styles.tab} ${isActive(`${baseUrl}/settings`) ? styles.activeTab : ''}`}>
                Settings
            </Link>
        </div>
    );
}
