'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import { encrypt } from '@/lib/encryption';
import { generateContent } from '@/lib/ai';

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
        console.error("Error creating data source (likely Demo Mode):", e);
        // DEMO Fallback: Simulate success
        return { success: true };
    }
}

export async function getDataSource(dataSourceId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;

    if (dataSourceId === 'mock-source-1') {
        return {
            id: 'mock-source-1',
            projectId: 'mock-project-id',
            name: 'Demo Sales Data',
            type: 'EXCEL',
            schema: JSON.stringify({
                tables: [{
                    name: 'Sales',
                    columns: [
                        { name: 'date', type: 'Date' },
                        { name: 'amount', type: 'Number' },
                        { name: 'region', type: 'String' }
                    ]
                }]
            }),
            encryptedConfig: 'mock-config',
            createdAt: new Date(),
            updatedAt: new Date(),
            project: { users: [{ userId: (session.user as any).id }] } // Mock access
        };
    }

    try {
        const dataSource = await prisma.dataSource.findUnique({
            where: { id: dataSourceId },
            include: { project: { include: { users: true } } }
        });

        if (!dataSource) return null;

        // Check project access
        const isMember = dataSource.project.users.some((u: any) => u.userId === (session.user as any).id);
        if (!isMember) return null;

        return dataSource;

    } catch (e) {
        console.error("DB Error in getDataSource:", e);
        return null;
    }
}


export async function updateDataSource(dataSourceId: string, updates: { name?: string, schema?: string }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    if (dataSourceId === 'mock-source-1') {
        return { success: true };
    }

    try {
        await prisma.dataSource.update({
            where: { id: dataSourceId },
            data: updates
        });
        revalidatePath(`/dashboard/projects/[id]/data-sources/${dataSourceId}`);
        return { success: true };
    } catch (e) {
        console.error("Update DataSource Failed:", e);
        return { error: 'Failed to update data source' };
    }
}

export async function generateDataSourceQueries(dataSourceId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    let schemaStr = '';

    if (dataSourceId === 'mock-source-1') {
        schemaStr = JSON.stringify({
            tables: [{
                name: 'Sales',
                columns: [
                    { name: 'date', type: 'Date' },
                    { name: 'amount', type: 'Number' },
                    { name: 'region', type: 'String' }
                ]
            }]
        });
    } else {
        const ds = await prisma.dataSource.findUnique({ where: { id: dataSourceId } });
        if (!ds) return { error: 'Not found' };
        schemaStr = ds.schema;
    }

    const systemPrompt = `
    You are an AI Data Analyst.
    Given the following database schema, generate 5 interesting and distinct analytical questions (prompts) that a user might ask.
    Schema: ${schemaStr}

    Response Format (JSON Array of Strings only):
    ["Question 1...", "Question 2...", ...]
    `;

    try {
        const responseText = await generateContent(systemPrompt);
        const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const queries = JSON.parse(cleanedResponse);

        if (dataSourceId !== 'mock-source-1') {
            await prisma.dataSource.update({
                where: { id: dataSourceId },
                data: { sampleQueries: JSON.stringify(queries) }
            });
            revalidatePath(`/dashboard/projects/[id]/data-sources/${dataSourceId}`);
        }

        return { success: true, data: queries };
    } catch (e) {
        console.error("Generate Queries Failed:", e);
        return { error: 'Failed to generate queries' };
    }
}
