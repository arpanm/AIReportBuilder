'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const MOCK_PROJECT = {
    id: 'mock-project-id',
    name: 'Demo Project (Read Only)',
    description: 'This is a demo project generated because the database is invalid or read-only.',
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'mock-admin-id'
};

const MOCK_DATA_SOURCES = [
    {
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
        updatedAt: new Date()
    }
];

export async function getProject(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;

    if (id === 'mock-project-id') return MOCK_PROJECT;

    try {
        return await prisma.project.findUnique({
            where: { id },
        });
    } catch (e) {
        console.error("DB Error in getProject", e);
        return null;
    }
}

export async function getDataSources(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return [];

    if (projectId === 'mock-project-id') return MOCK_DATA_SOURCES;

    try {
        // Verify access
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { users: true }
        });

        if (!project) return [];
        // Check if user is part of the project
        const isMember = project.users.some((u: any) => u.userId === (session.user as any).id);
        if (!isMember) return [];

        return await prisma.dataSource.findMany({
            where: { projectId },
            orderBy: { name: 'asc' }
        });
    } catch (e) {
        console.error("DB Error in getDataSources", e);
        return [];
    }
}
