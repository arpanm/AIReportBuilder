import { getDataSource } from '../actions';
import DataSourceClient from './DataSourceClient';
import { notFound } from 'next/navigation';

export default async function DataSourceDetailsPage({ params }: { params: Promise<{ id: string; dataSourceId: string }> }) {
    const { dataSourceId } = await params;
    const dataSource = await getDataSource(dataSourceId);

    if (!dataSource) {
        notFound();
    }

    return <DataSourceClient dataSource={dataSource} />;
}
