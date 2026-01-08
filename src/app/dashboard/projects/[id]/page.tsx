export default async function ProjectOverview({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Project Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Data Sources connected</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>0</p>
                </div>
                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Reports generated</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>0</p>
                </div>
            </div>
        </div>
    );
}
