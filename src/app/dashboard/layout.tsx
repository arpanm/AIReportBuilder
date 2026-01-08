import styles from './layout.module.css';
import { Sidebar } from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                {/* We can add a top header here later if needed */}
                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
