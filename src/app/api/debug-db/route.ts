import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const userCount = await prisma.user.count();
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                // NOT returning password hash for security, just existence
            }
        });

        return NextResponse.json({
            status: 'ok',
            message: 'Database connection successful',
            userCount,
            users,
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL
            }
        });
    } catch (error) {
        console.error("DB Debug Error:", error);
        return NextResponse.json({
            status: 'error',
            message: 'Database connection failed',
            error: String(error)
        }, { status: 500 });
    }
}
