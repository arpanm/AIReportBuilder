'use client';

import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

type VizConfig = {
    xAxis?: string;
    yAxis?: string;
    series?: string;
    data: any[];
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export default function ChartRenderer({ type, config }: { type: string, config: VizConfig }) {
    if (!config || !config.data || config.data.length === 0) {
        return <div style={{ color: '#94a3b8' }}>No data to display</div>;
    }

    const RenderChart = () => {
        switch (type) {
            case 'BAR':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={config.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey={config.xAxis} stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Legend />
                            <Bar dataKey={config.yAxis || 'value'} fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'LINE':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={config.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey={config.xAxis} stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey={config.yAxis || 'value'} stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'PIE':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={config.data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey={config.yAxis || 'value'}
                                nameKey={config.xAxis || 'name'} // Assuming xAxis is the label for Pie
                            >
                                {config.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'TABLE':
                return (
                    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {Object.keys(config.data[0]).map(key => (
                                        <th key={key} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #334155', color: '#94a3b8' }}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {config.data.map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j} style={{ padding: '0.5rem', borderBottom: '1px solid #334155', color: '#f8fafc' }}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            default:
                return <div>Unsupported visualization type</div>;
        }
    };

    return <RenderChart />;
}
