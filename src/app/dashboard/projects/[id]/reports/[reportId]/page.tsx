import { getReport } from '../actions';
import ReportViewerClient from './ReportViewerClient';

export default async function ReportPage({ params }: { params: Promise<{ id: string, reportId: string }> }) {
    const { id, reportId } = await params;
    const report = await getReport(reportId);

    if (!report) {
        return <div>Report not found</div>;
    }

    return <ReportViewerClient report={report} projectId={id} />;
}
