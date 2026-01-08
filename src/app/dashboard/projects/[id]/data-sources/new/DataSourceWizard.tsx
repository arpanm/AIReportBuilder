'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, FileSpreadsheet, Cloud, ArrowRight, Loader2, Upload } from 'lucide-react';
import styles from './wizard.module.css';
import { createDataSource } from '../actions';
import { clsx } from 'clsx';

export default function DataSourceWizard({ projectId }: { projectId: string }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [type, setType] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [name, setName] = useState('');
    const [host, setHost] = useState('');
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [database, setDatabase] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleTypeSelect = (selectedType: string) => {
        setType(selectedType);
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('type', type);
        formData.append('name', name);

        if (type === 'EXCEL') {
            if (!file) {
                setError('Please upload a file');
                setLoading(false);
                return;
            }
            // OPTIMIZATION: For Mock Schema Parsing, we only transfer the filename
            // This avoids large payload transmission issues until real storage is implemented
            formData.append('fileName', file.name);
        } else {
            formData.append('host', host);
            formData.append('user', user);
            formData.append('password', password);
            formData.append('database', database);
        }

        const result = await createDataSource(projectId, formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push(`/dashboard/projects/${projectId}/data-sources`);
            router.refresh();
        }
    };

    return (
        <div className={styles.wizardContainer}>
            <div className={styles.stepTitle}>
                {step === 1 ? 'Select Data Source Type' : `Configure ${type === 'EXCEL' ? 'Excel File' : 'Database Connection'}`}
            </div>

            {step === 1 && (
                <div className={styles.typeGrid}>
                    <div className={styles.typeCard} onClick={() => handleTypeSelect('EXCEL')}>
                        <FileSpreadsheet size={40} color="#10b981" />
                        <span style={{ fontWeight: 600 }}>Excel Upload</span>
                    </div>
                    <div className={styles.typeCard} onClick={() => handleTypeSelect('POSTGRES')}>
                        <Database size={40} color="#3b82f6" />
                        <span style={{ fontWeight: 600 }}>PostgreSQL</span>
                    </div>
                    <div className={styles.typeCard} onClick={() => handleTypeSelect('MYSQL')}>
                        <Database size={40} color="#f59e0b" />
                        <span style={{ fontWeight: 600 }}>MySQL</span>
                    </div>
                    <div className={styles.typeCard} onClick={() => handleTypeSelect('BIGQUERY')}>
                        <Cloud size={40} color="#ea4335" />
                        <span style={{ fontWeight: 600 }}>BigQuery</span>
                    </div>
                </div>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Source Name (Display Name)</label>
                        <input required className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sales DB Production" />
                    </div>

                    {type === 'EXCEL' ? (
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Upload Excel File (.xlsx, .csv)</label>
                            <label className={styles.fileUploadArea}>
                                <input type="file" hidden accept=".xlsx,.csv" onChange={e => e.target.files && setFile(e.target.files[0])} />
                                <Upload size={32} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                                <div>
                                    {file ? (
                                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>{file.name}</span>
                                    ) : (
                                        <span>Click to Upload or Drag & Drop</span>
                                    )}
                                </div>
                            </label>
                        </div>
                    ) : (
                        <>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Host</label>
                                <input required className={styles.input} value={host} onChange={e => setHost(e.target.value)} placeholder="localhost" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Database Name</label>
                                <input required className={styles.input} value={database} onChange={e => setDatabase(e.target.value)} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>User</label>
                                <input required className={styles.input} value={user} onChange={e => setUser(e.target.value)} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Password</label>
                                <input required type="password" className={styles.input} value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                        </>
                    )}

                    {error && <div style={{ color: '#ef4444' }}>{error}</div>}

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelButton} onClick={() => setStep(1)} disabled={loading}>
                            Back
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={loading} style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {loading ? <><Loader2 className="animate-spin" size={18} /> Connecting...</> : 'Connect Source'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
