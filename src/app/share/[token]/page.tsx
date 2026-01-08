import { getPublicReport } from '@/app/dashboard/projects/[id]/reports/alerts-actions';
import PublicReportViewer from './PublicReportViewer';
import { notFound } from 'next/navigation';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const report = await getPublicReport(token);

    if (!report) {
        notFound();
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a' }}>
            <PublicReportViewer report={report} />
        </div>
    );
}
