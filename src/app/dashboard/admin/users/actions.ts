'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
    return prisma.user.findMany({
        orderBy: { email: 'asc' },
        select: { id: true, name: true, email: true, role: true }
    });
}

export async function createUser(data: FormData) {
    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const role = data.get('role') as string;

    if (!email || !password || !role) {
        return { error: 'Missing required fields' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: { name, email, password: hashedPassword, role }
        });
        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to create user. Email might be in use.' };
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: 'Failed to delete user' };
    }
}
