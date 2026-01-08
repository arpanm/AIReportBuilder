'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Users, Settings, FileBarChart, LogOut, PlusCircle, Database } from 'lucide-react';
import styles from './layout.module.css';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for conditional classes if needed, though we are using CSS modules primarily.
// Since we are using Vanilla CSS modules, clsx is good enough for conditional classes.

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user as any;
    const isAdmin = user?.role === 'SUPER_ADMIN';

    const isActive = (path: string) => pathname === path;

    return (
        <div className={styles.sidebar}>
            <div className={styles.brand}>
                <div className={styles.logoIcon}>
                    <FileBarChart size={20} />
                </div>
                <span className={styles.logoText}>Report AI</span>
            </div>

            <nav className={styles.nav}>
                <Link
                    href="/dashboard"
                    className={clsx(styles.navItem, isActive('/dashboard') && styles.activeNavItem)}
                >
                    <LayoutDashboard size={20} />
                    <span>Projects</span>
                </Link>

                {/* Placeholder for future shortcuts */}
                <Link
                    href="/dashboard/projects/new"
                    className={clsx(styles.navItem, isActive('/dashboard/projects/new') && styles.activeNavItem)}
                >
                    <PlusCircle size={20} />
                    <span>New Project</span>
                </Link>

                {isAdmin && (
                    <Link
                        href="/dashboard/admin/users"
                        className={clsx(styles.navItem, isActive('/dashboard/admin/users') && styles.activeNavItem)}
                    >
                        <Users size={20} />
                        <span>User Management</span>
                    </Link>
                )}
            </nav>

            <div className={styles.nav} style={{ flex: 0 }}>
                <button className={styles.navItem} onClick={() => signOut({ callbackUrl: '/login' })} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <LogOut size={20} />
                    <span>Sign out</span>
                </button>

                <div className={styles.userProfile}>
                    <div className={styles.avatar}>
                        {user?.name?.[0] || user?.email?.[0] || 'U'}
                    </div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{user?.name || 'User'}</div>
                        <div className={styles.userEmail}>{user?.email}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
