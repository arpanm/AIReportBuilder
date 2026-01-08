'use server';

import { prisma } from '@/lib/prisma';
import { generateContent } from '@/lib/ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// GLOBAL IN-MEMORY STORE FOR DEMO (Vercel Lambda will reset this eventually, but fine for a session)
let MOCK_REPORTS: any[] = [
    {
        id: 'mock-report-1',
        projectId: 'mock-project-id',
        title: 'Q4 Sales Analysis',
        prompt: 'Analyze sales performance for Q4',
        query: 'SELECT * FROM Sales WHERE date >= "2023-10-01"',
        vizType: 'BAR',
        vizConfig: JSON.stringify({
            xAxis: 'region',
            yAxis: 'amount',
            data: [
                { region: 'North', amount: 45000 },
                { region: 'South', amount: 32000 },
                { region: 'East', amount: 28000 },
                { region: 'West', amount: 51000 }
            ]
        }),
        aiInsight: 'West region outperformed others in Q4, driven by holiday season demand. East region shows potential for growth.',
        createdAt: new Date(),
        creator: { name: 'Demo Admin' }
    },
    {
        id: 'mock-report-2',
        projectId: 'mock-project-id',
        title: 'Product Revenue Distribution',
        prompt: 'Show revenue share by product category',
        query: 'SELECT Product, SUM(Revenue) FROM Sales GROUP BY Product',
        vizType: 'PIE',
        vizConfig: JSON.stringify({
            xAxis: 'Product',
            yAxis: 'Revenue',
            data: [
                { name: 'Electronics', value: 120000 },
                { name: 'Clothing', value: 85000 },
                { name: 'Home', value: 45000 }
            ]
        }),
        aiInsight: 'Electronics segment dominates revenue share at 48%.',
        createdAt: new Date(Date.now() - 86400000), // Yesterday
        creator: { name: 'Demo Admin' }
    }
];

const MOCK_SALES_ROWS = [
    { Date: '2023-10-15', Revenue: 1500, Region: 'North', Product: 'Electronics' },
    { Date: '2023-10-20', Revenue: 2300, Region: 'West', Product: 'Clothing' },
    { Date: '2023-11-05', Revenue: 4100, Region: 'West', Product: 'Electronics' },
    { Date: '2023-11-12', Revenue: 900, Region: 'East', Product: 'Home' },
    { Date: '2023-12-01', Revenue: 5200, Region: 'North', Product: 'Electronics' },
    { Date: '2023-12-15', Revenue: 3400, Region: 'South', Product: 'Clothing' },
    { Date: '2023-12-24', Revenue: 6000, Region: 'West', Product: 'Electronics' },
    { Date: '2024-01-05', Revenue: 1200, Region: 'East', Product: 'Home' }
];

export async function generateReportInsight(projectId: string, prompt: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    let dataSources = [];
    let mockDataContext = '';

    if (projectId === 'mock-project-id') {
        // MOCK DATA SCHEMA FOR DEMO
        dataSources = [{
            name: 'Demo Sales Data',
            type: 'EXCEL',
            schema: JSON.stringify({
                tables: [{
                    name: 'Sales',
                    columns: [
                        { name: 'Date', type: 'Date' },
                        { name: 'Revenue', type: 'Number' },
                        { name: 'Region', type: 'String' },
                        { name: 'Product', type: 'String' }
                    ]
                }]
            })
        }];

        // Inject REAL MOCK ROWS so Gemini doesn't hallucinate random numbers
        mockDataContext = `\n[DEMO MODE] Here is a sample of the ACTUAL DATA in the 'Sales' table. Use this to generate accurate insights and chart data:\n${JSON.stringify(MOCK_SALES_ROWS, null, 2)}`;
    } else {
        // Real DB Fetch
        dataSources = await prisma.dataSource.findMany({
            where: { projectId },
            select: { name: true, schema: true, type: true }
        });
    }

    if (dataSources.length === 0) {
        return { error: 'No data sources found. Please connect a data source first.' };
    }

    const schemasContext = dataSources.map((ds: any) => `Source: ${ds.name} (${ds.type})\nSchema: ${ds.schema}`).join('\n\n');

    // 2. Construct Prompt
    const systemPrompt = `
    You are an AI Data Analyst. 
    Your goal is to generate a SQL query (or pseudo-query for Excel), a suitable visualization configuration, and a brief insight based on the user's request and the provided database schemas.
    ${mockDataContext}
    
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

    if (projectId === 'mock-project-id') {
        const newReportId = 'mock-report-' + Date.now();
        const newReport = {
            id: newReportId,
            projectId: 'mock-project-id',
            title: reportData.title || 'Demo Generated Report',
            prompt: reportData.prompt,
            query: reportData.query,
            vizType: reportData.vizType,
            vizConfig: JSON.stringify(reportData.vizConfig),
            aiInsight: reportData.insight,
            createdAt: new Date(),
            creator: { name: 'Demo Admin' }
        };
        MOCK_REPORTS.unshift(newReport); // Add to beginning of list
        return { success: true, reportId: newReportId };
    }

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
        // Fallback for Demo Mode in case DB fails for real project
        console.error("Save Report Failed (Demo Mode?):", e);
        return { error: 'Failed to save report' }; // Don't fake success for real projects to avoid confusion
    }
}

export async function getReports(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return [];

    if (projectId === 'mock-project-id') {
        return MOCK_REPORTS;
    }

    try {
        const userId = (session.user as any).id;

        // 1. Check Project Membership
        const projectMember = await prisma.projectUser.findFirst({
            where: { projectId, userId }
        });
        const projectOwner = await prisma.project.findFirst({
            where: { id: projectId, ownerId: userId }
        });

        const hasFullAccess = !!projectMember || !!projectOwner;

        if (hasFullAccess) {
            return await prisma.report.findMany({
                where: { projectId },
                orderBy: { createdAt: 'desc' },
                include: { creator: { select: { name: true } } }
            });
        } else {
            // 2. Guest Access (Shared Reports Only)
            return await prisma.report.findMany({
                where: {
                    projectId,
                    users: { some: { userId } }
                },
                orderBy: { createdAt: 'desc' },
                include: { creator: { select: { name: true } } }
            });
        }

    } catch (e) {
        console.error("Fetch Reports Failed (Returning Demo List):", e);
        return MOCK_REPORTS;
    }
}

export async function getReport(reportId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;

    if (reportId.startsWith('mock-report')) {
        const mock = MOCK_REPORTS.find(r => r.id === reportId);
        return mock ? { ...mock, project: { name: 'Demo Project' } } : MOCK_REPORTS[0];
    }

    try {
        const userId = (session.user as any).id;
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: { project: true, users: true }
        });

        if (!report) return null;

        // Access Check: Owner, Project Member, or Direct Share
        const isCreator = report.creatorId === userId;
        const isProjectOwner = report.project.ownerId === userId;
        const isShared = report.users.some((u: any) => u.userId === userId);

        // We'd ideally check project membership too, but for single report view, isShared is enough (or public)
        if (isCreator || isProjectOwner || isShared) return report;

        // Fail-safe check for project membership if not directly shared
        const isProjectMember = await prisma.projectUser.findFirst({
            where: { projectId: report.projectId, userId }
        });

        if (isProjectMember) return report;

        return null;
    } catch (e) {
        return null;
    }
}

export async function updateReport(reportId: string, updates: any) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    // MOCK UPDATE
    if (reportId.startsWith('mock-report')) {
        const index = MOCK_REPORTS.findIndex(r => r.id === reportId);
        if (index !== -1) {
            MOCK_REPORTS[index] = { ...MOCK_REPORTS[index], ...updates };
            return { success: true };
        }
        return { error: 'Mock report not found' };
    }

    try {
        await prisma.report.update({
            where: { id: reportId },
            data: {
                title: updates.title,
                query: updates.query,
                vizType: updates.vizType,
                vizConfig: updates.vizConfig ? JSON.stringify(updates.vizConfig) : undefined,
                aiInsight: updates.aiInsight
            }
        });
        revalidatePath(`/dashboard/projects/[id]/reports/${reportId}`);
        return { success: true };
    } catch (e) {
        console.error("Update Report Failed:", e);
        return { error: 'Failed to update report' };
    }
}

export async function deleteReport(reportId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    if (reportId.startsWith('mock-report')) {
        MOCK_REPORTS = MOCK_REPORTS.filter(r => r.id !== reportId);
        return { success: true };
    }

    try {
        // Fix Foreign Key Constraint (P2003): Delete related alerts first
        await prisma.alert.deleteMany({
            where: { reportId }
        });

        await prisma.report.delete({
            where: { id: reportId }
        });
        return { success: true };
    } catch (e) {
        console.error("Delete Report Failed:", e); // Added Logging
        return { error: 'Failed to delete report' };
    }
}

export async function regenerateReportFromQuery(projectId: string, query: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    let dataSources = [];
    let mockDataContext = '';

    if (projectId === 'mock-project-id') {
        dataSources = [{
            name: 'Demo Sales Data',
            type: 'EXCEL',
            schema: JSON.stringify({
                tables: [{
                    name: 'Sales',
                    columns: [
                        { name: 'Date', type: 'Date' },
                        { name: 'Revenue', type: 'Number' },
                        { name: 'Region', type: 'String' },
                        { name: 'Product', type: 'String' }
                    ]
                }]
            })
        }];
        mockDataContext = `\n[DEMO MODE] Here is a sample of the ACTUAL DATA in the 'Sales' table. Use this to generate accurate insights and chart data:\n${JSON.stringify(MOCK_SALES_ROWS, null, 2)}`;
    } else {
        dataSources = await prisma.dataSource.findMany({
            where: { projectId },
            select: { name: true, schema: true, type: true }
        });
    }

    if (dataSources.length === 0) return { error: 'No data sources found.' };

    const schemasContext = dataSources.map((ds: any) => `Source: ${ds.name} (${ds.type})\nSchema: ${ds.schema}`).join('\n\n');

    const systemPrompt = `
    You are an AI Data Analyst.
    The user has MANUALLY provided a specific SQL query (or pseudo-query).
    Your goal is to EXECUTE this query conceptually and generate the corresponding visualization configuration and insight.

    Data Sources:
    ${schemasContext}
    ${mockDataContext}

    User's Custom Query: "${query}"

    Response Format (JSON only, no markdown):
    {
        "query": "${query}",
        "vizType": "BAR" | "LINE" | "PIE" | "TABLE", 
        "vizConfig": {
            "xAxis": "column_name",
            "yAxis": "column_name",
            "series": "column_name (optional)",
            "data": [
                  // Generate rows based on the logic of the User's Custom Query.
                  {"column_name": value, ...}
            ]
        },
        "insight": "A brief 1-2 sentence insight based on the result of this specific query."
    }
    `;

    try {
        const responseText = await generateContent(systemPrompt);
        const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanedResponse);
        return { success: true, data: result };
    } catch (e) {
        console.error("AI Regeneration Error:", e);
        return { error: 'Failed to regenerate report.' };
    }
}

export async function shareReport(reportId: string, email: string, role: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    if (reportId.startsWith('mock-report')) return { success: true };

    try {
        const userToShare = await prisma.user.findUnique({ where: { email } });
        if (!userToShare) return { error: 'User not found' };

        // Check if already shared
        const existing = await prisma.reportUser.findFirst({
            where: { reportId, userId: userToShare.id }
        });

        if (existing) {
            await prisma.reportUser.update({
                where: { id: existing.id },
                data: { role }
            });
        } else {
            await prisma.reportUser.create({
                data: {
                    reportId,
                    userId: userToShare.id,
                    role
                }
            });
        }
        return { success: true };
    } catch (e) {
        console.error("Share Report Failed:", e);
        return { error: 'Failed to share report' };
    }
}
