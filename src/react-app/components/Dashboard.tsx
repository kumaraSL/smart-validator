import { useState, useEffect } from 'react';

// --- Inline SVG Icons ---
const Icons = {
  TrendingUp: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Info: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  CheckCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
};

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error('Failed to fetch stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="page-title" style={{ marginBottom: 'var(--sp-6)', color: 'var(--text-primary)' }}>Analytics Overview</h1>

      {/* --- KPI Cards Row --- */}
      <div className="dashboard-kpi-row">
        {/* Card 1 */}
        <div className="dashboard-card kpi-card">
          <div className="kpi-title">Total Applicants</div>
          <div className="kpi-value">{stats.totalApplicants}</div>
          <div className="kpi-footer" style={{ color: 'var(--color-green)' }}>
            <span><Icons.TrendingUp /> +15% from last month</span>
            <span style={{ color: 'var(--color-green)', opacity: 0.8 }}><Icons.Info /></span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="dashboard-card kpi-card">
          <div className="kpi-title">Documents Processed</div>
          <div className="kpi-value">{stats.totalDocuments}</div>
          <div className="kpi-footer" style={{ color: '#3b82f6' }}>
            <span>70.8% retention rate</span>
            <span style={{ opacity: 0.8 }}><Icons.Info /></span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="dashboard-card kpi-card">
          <div className="kpi-title">Pass Rate</div>
          <div className="kpi-value">{stats.passRate}%</div>
          <div className="kpi-footer" style={{ color: 'var(--color-green)' }}>
            <span><Icons.TrendingUp /> +10% this week</span>
            <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Target: 80% <span style={{background: '#f59e0b', color: '#fff', borderRadius:'50%', width:'16px', height:'16px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'10px'}}>$</span></span>
          </div>
        </div>
      </div>

      {/* --- Charts Row --- */}
      <div className="dashboard-charts-row">
        {/* Line Chart */}
        <div className="dashboard-card chart-card">
          <div className="kpi-title" style={{ marginBottom: 'var(--sp-4)' }}>Enrollment Trends</div>
          
          <div className="css-line-chart-container">
             {/* Simple SVG Line Chart */}
             <svg width="100%" height="200" viewBox="0 0 500 200" preserveAspectRatio="none">
               {/* Grid lines */}
               <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="2" />
               <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="2" />
               <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="2" />
               <line x1="0" y1="160" x2="500" y2="160" stroke="#f1f5f9" strokeWidth="2" />
               
               {/* Data Line */}
               <polyline 
                 points="0,170 100,150 200,120 300,100 400,60 500,30" 
                 fill="none" 
                 stroke="#3b82f6" 
                 strokeWidth="4" 
               />
               
               {/* Data Points */}
               <circle cx="0" cy="170" r="5" fill="#3b82f6" />
               <circle cx="100" cy="150" r="5" fill="#3b82f6" />
               <circle cx="200" cy="120" r="5" fill="#3b82f6" />
               <circle cx="300" cy="100" r="5" fill="#3b82f6" />
               <circle cx="400" cy="60" r="5" fill="#3b82f6" />
               <circle cx="500" cy="30" r="5" fill="#3b82f6" />
             </svg>
             <div className="chart-x-axis">
               {stats.trends.map((t: any) => (
                 <span key={t.name}>{t.name}</span>
               ))}
             </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="dashboard-card chart-card">
          <div className="kpi-title" style={{ marginBottom: 'var(--sp-2)' }}>Course Popularity</div>
          <div className="kpi-value" style={{ marginBottom: 'var(--sp-4)' }}>$150,000</div>
          
          <div className="css-bar-chart-container">
            {/* CSS Bar Chart */}
            <div className="css-bars">
              {[20, 10, 30, 45, 60, 20, 35, 80, 60, 10, 20, 15, 40, 25, 70, 90].map((val, i) => (
                <div key={i} className="css-bar" style={{ height: `${val}%` }}></div>
              ))}
            </div>
            <div className="chart-x-axis" style={{ justifyContent: 'space-around' }}>
              <span>Data Science</span>
              <span>Data Science</span>
              <span>JavaSPritt</span>
            </div>
            <span style={{ marginTop: '8px', background: '#f59e0b', color: '#fff', borderRadius:'50%', width:'16px', height:'16px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'10px'}}>$</span>
          </div>
        </div>
      </div>

      {/* --- Recent Activity Table --- */}
      <div className="dashboard-card table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <h3 className="kpi-title" style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px' }}>Recent Activity</h3>
          <button className="btn-primary" style={{ background: '#4ade80', color: '#fff', padding: '6px 16px', borderRadius: '4px', fontSize: '14px', border: 'none' }}>View All</button>
        </div>
        
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Course</th>
              <th>Date</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{activity.applicantName}</td>
                  <td>{activity.documentName}</td>
                  <td>{new Date(activity.date).toISOString().split('T')[0]}</td>
                  <td>Completed</td>
                  <td>
                    <span className={`status-pill ${activity.status.toLowerCase()}`}>
                      {activity.status === 'VERIFIED' ? 'In Progress' : 'Locked'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              // Mock rows if db is empty
              <>
                <tr>
                  <td style={{ fontWeight: 600 }}>Jane Doe</td>
                  <td>Python Basics</td>
                  <td>2024-07-20</td>
                  <td>-</td>
                  <td><span className="status-pill in-progress">In Progress</span></td>
                </tr>
                <tr className="striped">
                  <td style={{ fontWeight: 600 }}>John Smith</td>
                  <td>Web Dev 101</td>
                  <td>2024-19</td>
                  <td>Completed</td>
                  <td><span className="status-pill in-progress">In Progress</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Alice Chen</td>
                  <td>Data Science</td>
                  <td>45%-18</td>
                  <td>lonpleted</td>
                  <td><span className="status-pill locked">Locked</span></td>
                </tr>
                <tr className="striped">
                  <td style={{ fontWeight: 600 }}>Omar Hassan</td>
                  <td>JavaSPrift</td>
                  <td>0107-17</td>
                  <td>-</td>
                  <td><span className="status-pill locked-gray">Locked</span></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
