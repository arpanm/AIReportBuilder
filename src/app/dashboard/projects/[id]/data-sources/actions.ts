'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import { encrypt } from '@/lib/encryption';

export async function createDataSource(projectId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;

    if (!name || !type) return { error: 'Missing required fields' };

    let encryptedConfig = '';
    let schema = '{}';

    try {
        if (type === 'EXCEL') {
            const fileName = formData.get('fileName') as string;
            if (!fileName) return { error: 'File name is required' };

            // Mock Schema Parsing for Excel
            // In production, we would stream read the excel file to get headers
            schema = JSON.stringify({
                tables: [{
                    name: 'Sheet1',
                    columns: [
                        { name: 'Date', type: 'Date' },
                        { name: 'Revenue', type: 'Number' },
                        { name: 'Region', type: 'String' },
                        { name: 'Product', type: 'String' }
                    ]
                }]
            });
            encryptedConfig = encrypt(JSON.stringify({ fileName })); // encrypting file metadata
        } else {
            // DB Types
            const host = formData.get('host') as string;
            const user = formData.get('user') as string;
            const password = formData.get('password') as string;
            const database = formData.get('database') as string;

            if (!host || !user) return { error: 'Missing connection details' };

            const config = { host, user, password, database };
            encryptedConfig = encrypt(JSON.stringify(config));

            // Mock Schema for DB
            schema = JSON.stringify({
                tables: [{
                    name: 'users',
                    columns: [
                        { name: 'id', type: 'Integer' },
                        { name: 'email', type: 'String' }
                    ]
                }, {
                    name: 'orders',
                    columns: [
                        { name: 'id', type: 'Integer' },
                        { name: 'amount', type: 'Decimal' },
                        { name: 'user_id', type: 'Integer' }
                    ]
                }]
            });
        }

        await prisma.dataSource.create({
            data: {
                projectId,
                name,
                type,
                encryptedConfig,
                schema
            }
        });

        revalidatePath(`/dashboard/projects/${projectId}/data-sources`);
        return { success: true };

    } catch (e) {
        console.error("Error creating data source:", e);
        return { error: 'Failed to create data source' };
    }
}

export async function getDataSource(dataSourceId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;

    const dataSource = await prisma.dataSource.findUnique({
        where: { id: dataSourceId },
        include: { project: { include: { users: true } } }
    });

    if (!dataSource) return null;

    // Check project access
    const isMember = dataSource.project.users.some((u: any) => u.userId === (session.user as any).id);
    if (!isMember) return null;

    return dataSource;
}
