// src/App.tsx
import { useEffect, useState } from 'react';
import { Users, DollarSign, Activity, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { generateMockData, calculateRFM } from './utils/rfm';
import type { Customer } from './utils/rfm';

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // Generate mock data on initial load
    const data = generateMockData(150);
    const analyzedData = calculateRFM(data);
    setCustomers(analyzedData);
  }, []);

  if (customers.length === 0) return <div className="dashboard-container">Loading...</div>;

  // Compute overall metrics
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0);

  // Group by segment for charts
  const segmentCounts = customers.reduce((acc, c) => {
    const seg = c.segment || 'Unknown';
    acc[seg] = (acc[seg] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.keys(segmentCounts).map(key => ({
    name: key,
    value: segmentCounts[key]
  }));

  const pieChartData = barChartData;

  const COLORS = {
    'Champions': '#10b981', // green
    'Loyal Customers': '#3b82f6', // blue
    'At Risk': '#f59e0b', // orange
    'Hibernating': '#ef4444' // red
  };

  const getBadgeClass = (segment?: string) => {
    switch (segment) {
      case 'Champions': return 'badge-champion';
      case 'Loyal Customers': return 'badge-loyal';
      case 'At Risk': return 'badge-risk';
      case 'Hibernating': return 'badge-hibernating';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1>Customer Segmentation</h1>
        <p>AI-Powered RFM Analysis Dashboard</p>
      </header>

      {/* Metrics Section */}
      <section className="metrics-grid">
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '12px', color: '#8b5cf6' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Customers</p>
            <h2 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{totalCustomers}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: '#10b981' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Revenue</p>
            <h2 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>${totalRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', color: '#3b82f6' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Avg Order Value</p>
            <h2 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>${avgOrderValue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>At Risk Customers</p>
            <h2 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{segmentCounts['At Risk'] || 0}</h2>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="charts-grid">
        <div className="glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Segment Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
              <RechartsTooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Audience Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8b5cf6'} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Data Table Section */}
      <section className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Recent Customers</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Last Purchase</th>
                <th>Total Orders</th>
                <th>Total Spend</th>
                <th>RFM Score</th>
                <th>Segment</th>
              </tr>
            </thead>
            <tbody>
              {customers.slice(0, 10).map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.lastPurchaseDate}</td>
                  <td>{c.totalOrders}</td>
                  <td>${c.totalSpent.toLocaleString()}</td>
                  <td style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{c.rScore}{c.fScore}{c.mScore}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(c.segment)}`}>
                      {c.segment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
