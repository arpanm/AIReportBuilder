'use client';

import { useState } from 'react';
import { Plus, Trash2, Shield, User as UserIcon } from 'lucide-react';
import styles from './users.module.css';
import { createUser, deleteUser } from './actions';
import { useRouter } from 'next/navigation';

type User = {
    id: string;
    name: string | null;
    email: string;
    role: string;
};

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
    const router = useRouter();
    const [users, setUsers] = useState(initialUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [error, setError] = useState('');

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);

        const result = await createUser(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setIsModalOpen(false);
            setName('');
            setEmail('');
            setPassword('');
            setLoading(false);
            router.refresh();
            // Optimistic update could happen here but refresh handles it
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            const result = await deleteUser(id);
            if (result.success) {
                setUsers(users.filter(u => u.id !== id));
                router.refresh();
            } else {
                alert('Failed to delete user');
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>User Management</h1>
                <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Add User
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {user.name ? user.name[0] : 'U'}
                                        </div>
                                        {user.name || 'No Name'}
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={styles.roleBadge} style={user.role === 'SUPER_ADMIN' ? { color: '#fbbf24', background: 'rgba(251, 191, 36, 0.2)' } : {}}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <button className={styles.actionButton} onClick={() => handleDelete(user.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>Add New User</h3>

                        {error && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>}

                        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Full Name</label>
                                <input required className={styles.input} value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email Address</label>
                                <input required type="email" className={styles.input} value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Password</label>
                                <input required type="password" className={styles.input} value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Role</label>
                                <select className={styles.select} value={role} onChange={e => setRole(e.target.value)}>
                                    <option value="USER">User</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.submitButton} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
