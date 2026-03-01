import React, { useEffect, useRef } from 'react';
import { useAdmin } from '../AdminContext';

export function AnalyticsTab() {
    const admin = useAdmin();
    const { topProducts = [], topBuyers = [] } = admin;
    const canvasRef = useRef(null);

    useEffect(() => {
        // Attempt to invoke the render chart function when the tab opens
        if (admin.activeTab === 'analytics') {
            // Small timeout to allow canvas rendering
            setTimeout(() => {
                if (admin.renderOrdersPieChart) {
                    admin.renderOrdersPieChart();
                }
            }, 100);
        }
    }, [admin.activeTab, admin.renderOrdersPieChart]);

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', alignItems: 'start' }}>
                <div className="admin-card">
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 24px 0', color: '#f8fafc' }}>Orders by Status</h3>
                    <div style={{ height: '256px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <canvas id="ordersPieChart" ref={canvasRef}></canvas>
                    </div>
                </div>
                <div className="admin-card">
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 24px 0', color: '#f8fafc' }}>Stock Velocity (30 Days)</h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {topProducts.map((item) => (
                            <div key={item.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                    <span style={{ color: '#8fa0be' }}>{item.title}</span>
                                    <span className="mono" style={{ color: '#e2e8f0', fontWeight: 700 }}>{item.percent}%</span>
                                </div>
                                <div style={{ width: '100%', background: 'var(--panel-bg)', height: '6px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(45, 51, 67, 0.4)' }}>
                                    <div style={{ background: '#3b82f6', height: '100%', width: `${item.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && <div style={{ fontSize: '12px', color: '#8fa0be' }}>No product velocity data available.</div>}
                    </div>
                </div>
            </div>

            <div className="admin-card no-pad">
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(45, 51, 67, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Top Buyers</h3>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8fa0be', fontWeight: 700 }}>Highest spenders</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>#</th>
                                <th>Buyer</th>
                                <th>Orders</th>
                                <th>Total Spent</th>
                                <th>Last Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topBuyers.map((buyer, index) => (
                                <tr key={buyer.id}>
                                    <td className="mono" style={{ color: '#8fa0be' }}>{index + 1}</td>
                                    <td>
                                        <p style={{ fontWeight: 700, margin: '0 0 4px 0', color: '#f8fafc' }}>{buyer.name}</p>
                                        <p className="mono" style={{ fontSize: '11px', color: '#8fa0be', margin: 0, wordBreak: 'break-all' }}>{buyer.email}</p>
                                    </td>
                                    <td className="mono" style={{ color: '#e2e8f0', fontWeight: 700 }}>{admin.number ? admin.number(buyer.orderCount) : ''}</td>
                                    <td className="mono" style={{ color: '#3b82f6', fontWeight: 800 }}>{admin.currency ? admin.currency(buyer.totalSpent) : ''}</td>
                                    <td>{buyer.lastOrderAt ? (admin.date ? admin.date(buyer.lastOrderAt) : '') : '-'}</td>
                                </tr>
                            ))}
                            {topBuyers.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#8fa0be' }}>No buyer purchase data available yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
