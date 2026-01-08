'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setLoading(false);
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred during sign in');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>AI Report Builder</div>
                    <p className={styles.subtitle}>Sign in to access your analytics workspace</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail
                                size={18}
                                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                            />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                style={{ paddingLeft: '2.8rem' }}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={18}
                                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                            />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                style={{ paddingLeft: '2.8rem' }}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Loader2 className="animate-spin" size={20} /> Signing in...
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                Sign In <ArrowRight size={18} />
                            </span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
