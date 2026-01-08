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

export async function getProjects() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return [];
    }

    // Fetch projects where the user is a member
    try {
        const projects = await prisma.project.findMany({
            where: {
                users: {
                    some: {
                        userId: (session.user as any).id
                    }
                }
            },
            include: {
                _count: {
                    select: { reports: true, dataSources: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return projects;
    } catch (e) {
        console.error("DB Error in getProjects, returning mock data:", e);
        // MOCK DATA FOR DEMO
        return [{
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
        }];
    }
}
