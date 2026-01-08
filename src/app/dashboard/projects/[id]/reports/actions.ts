'use server';

import { prisma } from '@/lib/prisma';
import { generateContent } from '@/lib/ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function generateReportInsight(projectId: string, prompt: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    // 1. Fetch available schemas
    const dataSources = await prisma.dataSource.findMany({
        where: { projectId },
        select: { name: true, schema: true, type: true }
    });

    if (dataSources.length === 0) {
        return { error: 'No data sources found. Please connect a data source first.' };
    }

    const schemasContext = dataSources.map(ds => `Source: ${ds.name} (${ds.type})\nSchema: ${ds.schema}`).join('\n\n');

    // 2. Construct Prompt
    const systemPrompt = `
    You are an AI Data Analyst. 
    Your goal is to generate a SQL query (or pseudo-query for Excel), a suitable visualization configuration, and a brief insight based on the user's request and the provided database schemas.
    
    Data Sources:
    ${schemasContext}

    User Request: "${prompt}"

    Response Format (JSON only, no markdown):
    {
        "query": "SQL Query here...",
        "vizType": "BAR" | "LINE" | "PIE" | "TABLE",
        "vizConfig": {
            "xAxis": "column_name",
            "yAxis": "column_name",
            "series": "column_name (optional)",
            "data": [
                 // Generate 5-10 rows of REALISTIC MOCK DATA that matches the query result columns.
                 // This is for preview purposes since we don't execute the query on real DB yet.
                 {"column_name": value, ...}
            ]
        },
        "insight": "A brief 1-2 sentence insight about what this data might show."
    }
    `;

    try {
        const responseText = await generateContent(systemPrompt);
        // Clean markdown code blocks if present
        const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanedResponse);

        return { success: true, data: result };
    } catch (e) {
        console.error("AI Generation Error:", e);
        return { error: 'Failed to generate report. AI service might be unavailable.' };
    }
}

export async function saveReport(projectId: string, reportData: any) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    try {
        const report = await prisma.report.create({
            data: {
                projectId,
                creatorId: (session.user as any).id,
                title: reportData.title || 'Untitled Report',
                prompt: reportData.prompt,
                query: reportData.query,
                vizType: reportData.vizType,
                vizConfig: JSON.stringify(reportData.vizConfig),
                aiInsight: reportData.insight
            }
        });
        return { success: true, reportId: report.id };
    } catch (e) {
        return { error: 'Failed to save report' };
    }
}

export async function getReports(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return [];

    return prisma.report.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        include: { creator: { select: { name: true } } }
    });
}

export async function getReport(reportId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;

    return prisma.report.findUnique({
        where: { id: reportId },
        include: { project: true }
    });
}
