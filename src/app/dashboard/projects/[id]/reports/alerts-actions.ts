'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import crypto from 'crypto';

export async function createAlert(reportId: string, email: string, frequency: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    try {
        await prisma.alert.create({
            data: {
                reportId,
                email,
                frequency
            }
        });
        return { success: true };
    } catch (e) {
        return { error: 'Failed to create alert' };
    }
}

export async function generateShareToken(reportId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    try {
        const token = crypto.randomBytes(32).toString('hex');
        await prisma.report.update({
            where: { id: reportId },
            data: { shareToken: token }
        });
        return { success: true, token };
    } catch (e) {
        return { error: 'Failed to generate share link' };
    }
}

export async function getPublicReport(token: string) {
    const report = await prisma.report.findFirst({
        where: { shareToken: token },
        include: { creator: { select: { name: true } } }
    });
    return report;
}
