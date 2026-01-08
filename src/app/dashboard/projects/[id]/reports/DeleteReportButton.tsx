'use client';

import { Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { deleteReport } from './actions';
import { useRouter } from 'next/navigation';

export default function DeleteReportButton({ reportId }: { reportId: string }) {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation(); // Stop bubbling

        if (!confirm('Are you sure you want to delete this report?')) return;

        setDeleting(true);
        const res = await deleteReport(reportId);
        if (res.error) {
            alert(res.error);
            setDeleting(false);
        } else {
            // Router refresh to remove the item from the list
            router.refresh();
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
    );
}
