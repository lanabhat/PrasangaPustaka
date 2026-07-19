import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  data: { month: string; count: number }[];
  title?: string;
}

const TrendChart: React.FC<Props> = ({ data, title }) => (
  <div style={{ margin: '16px 8px' }}>
    {title && <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0', color: '#333' }}>{title}</h3>}
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#3880ff" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default TrendChart;
