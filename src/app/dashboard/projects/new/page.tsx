'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '../actions';
import styles from './new-project.module.css';
import { Loader2 } from 'lucide-react';

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await createProject(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push(`/dashboard`); // Go to dashboard or project details
            router.refresh();
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Create New Project</h1>

            <div className={styles.formCard}>
                {error && <div style={{ color: '#ef4444' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name" className={styles.label}>Project Name</label>
                        <input
                            name="name"
                            id="name"
                            className={styles.input}
                            placeholder="e.g. Sales Analytics Q1"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="description" className={styles.label}>Description</label>
                        <textarea
                            name="description"
                            id="description"
                            className={styles.textarea}
                            placeholder="Describe the purpose of this project..."
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelButton} onClick={() => router.back()}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Loader2 className="animate-spin" size={18} /> Creating...</span> : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
