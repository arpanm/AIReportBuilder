import ReportBuilderClient from './ReportBuilderClient';

export default async function NewReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ReportBuilderClient projectId={id} />;
}
