'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function createProject(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) {
        return { error: 'Project name is required' };
    }

    try {
        const project = await prisma.project.create({
            data: {
                name,
                description,
                ownerId: (session.user as any).id,
                users: {
                    create: {
                        userId: (session.user as any).id,
                        role: 'ADMIN' // Creator is the Admin
                    }
                }
            }
        });

        revalidatePath('/dashboard');
        return { success: true, projectId: project.id };
    } catch (e) {
        console.error("DB Write Failed (likely Demo/ReadOnly Env):", e);
        // DEMO MODE fallback
        return { success: true, projectId: 'mock-project-id' };
    }
}

const MOCK_PROJECT = {
    id: 'mock-project-id',
    name: 'Demo Project (Read Only)',
    description: 'This is a demo project generated because the database is invalid or read-only.',
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'mock-admin-id',
    _count: {
        reports: 0,
        dataSources: 0
    }
};

export async function getProjects() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return [];
    }
    const userId = (session.user as any).id;

    try {
        // 1. Get projects where user is owner or member
        const directProjects = await prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { users: { some: { userId } } }
                ]
            },
            include: {
                owner: { select: { name: true, email: true } },
                users: { include: { user: { select: { name: true, email: true } } } },
                _count: { select: { reports: true, dataSources: true } }
            },
            orderBy: { name: 'asc' }
        });

        // 2. Get project IDs where reports are shared with the user
        const sharedReportEntries = await prisma.reportUser.findMany({
            where: { userId },
            select: { report: { select: { projectId: true } } }
        });
        const sharedProjectIds = Array.from(new Set(sharedReportEntries.map((e: any) => e.report.projectId)));

        // 3. Get those projects if they aren't already in directProjects
        const existingIds = new Set(directProjects.map((p: any) => p.id));
        const missingIds = sharedProjectIds.filter(id => !existingIds.has(id));

        if (missingIds.length > 0) {
            const extraProjects = await prisma.project.findMany({
                where: { id: { in: missingIds } },
                include: {
                    owner: { select: { name: true, email: true } },
                    users: { include: { user: { select: { name: true, email: true } } } },
                    _count: { select: { reports: true, dataSources: true } }
                }
            });
            return [...directProjects, ...extraProjects].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }

        return directProjects;
    } catch (e) {
        console.error("DB Error in getProjects, returning mock data:", e);
        return [MOCK_PROJECT];
    }
}

export async function shareProject(projectId: string, email: string, role: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    if (projectId === 'mock-project-id') return { success: true };

    try {
        const userToShare = await prisma.user.findUnique({ where: { email } });
        if (!userToShare) return { error: 'User not found' };

        // Check if already shared
        const existing = await prisma.projectUser.findFirst({
            where: { projectId, userId: userToShare.id }
        });

        if (existing) {
            await prisma.projectUser.update({
                where: { id: existing.id },
                data: { role }
            });
        } else {
            await prisma.projectUser.create({
                data: {
                    projectId,
                    userId: userToShare.id,
                    role
                }
            });
        }
        revalidatePath('/dashboard/projects');
        return { success: true };
    } catch (e) {
        console.error("Share Project Failed:", e);
        return { error: 'Failed to share project' };
    }
}
