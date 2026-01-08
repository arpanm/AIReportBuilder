import DataSourceWizard from './DataSourceWizard';

export default async function NewDataSourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <DataSourceWizard projectId={id} />;
}
