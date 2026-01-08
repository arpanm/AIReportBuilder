'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getProject(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;

    return prisma.project.findUnique({
        where: { id },
    });
}

export async function getDataSources(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return [];

    // Verify access
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { users: true }
    });

    if (!project) return [];
    // Check if user is part of the project
    const isMember = project.users.some(u => u.userId === (session.user as any).id);
    if (!isMember) return [];

    return prisma.dataSource.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
    });
}
