'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareResourceModal from '../../components/ShareResourceModal';
import { shareProject } from '../actions';

export default function ShareProjectButton({ projectId }: { projectId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    padding: '0.5rem 1rem', borderRadius: '8px',
                    color: 'var(--text-main)', cursor: 'pointer',
                    fontWeight: 500
                }}
            >
                <Share2 size={16} />
                Share Project
            </button>
            <ShareResourceModal
                resourceName="Project"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onShare={async (email, role) => await shareProject(projectId, email, role)}
            />
        </>
    );
}
