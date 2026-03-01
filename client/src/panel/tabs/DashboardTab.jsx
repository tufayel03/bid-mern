import React from 'react';
import { useAdmin } from '../AdminContext';
import { Icon } from '../components/Icon';

export function DashboardTab() {
    const admin = useAdmin();

    // Extract necessary context data
    const { kpisRow1 = [], kpisRow2 = [], inventoryStats = {}, recentOrders = [], endingAuctions = [], revenueWindow } = admin;

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="overview-head">
                <div>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '-0.04em' }}>Command Center</h2>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        System status: <span className="ok-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', textShadow: '0 0 10px rgba(34,197,94,0.4)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div> OPTIMAL</span>
                    </p>
                </div>
                <div className="overview-actions">
                    <button
                        onClick={() => admin.loadDashboard && admin.loadDashboard(true)}
                        className="secondary-btn" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                        Sync Data
                    </button>
                    <button
                        onClick={() => admin.exportFinancialMonthlyCsv && admin.exportFinancialMonthlyCsv()}
                        className="primary-btn" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Row 1 */}
            <div className="kpi-grid top">
                {kpisRow1.map((kpi, idx) => (
                    <div key={idx} className="kpi-card" style={{ borderTop: `2px solid ${idx === 0 ? 'var(--primary)' : idx === 1 ? 'var(--success)' : idx === 2 ? 'var(--info)' : 'var(--warning)'}` }}>
                        <div className="kpi-head">
                            <div className="kpi-icon">
                                <Icon name={kpi.icon} />
                            </div>
                            <span className="kpi-status" style={{ color: kpi.trendUp ? '#22c55e' : '#ef4444', textShadow: kpi.trendUp ? '0 0 10px rgba(34, 197, 94, 0.4)' : '0 0 10px rgba(239, 68, 68, 0.4)' }}>
                                {kpi.trend}
                            </span>
                        </div>
                        <p className="kpi-label" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>{kpi.label}</p>
                        <h3 className="kpi-value">{kpi.value}</h3>
                    </div>
                ))}
            </div>

            {/* KPI Row 2 */}
            <div className="kpi-grid sub">
                {kpisRow2.map((kpi, idx) => (
                    <div key={idx} className="mini-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>{kpi.label}</p>
                        <strong>{kpi.value}</strong>
                    </div>
                ))}
            </div>

            <div className="dashboard-main-grid">
                {/* Revenue Chart */}
                <div className="card chart-card">
                    <div className="card-title-row">
                        <h3 style={{ fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Telemetry</h3>
                        <div className="segment-toggle">
                            <button
                                onClick={() => admin.setRevenueWindow && admin.setRevenueWindow('7d')}
                                className={revenueWindow === '7d' ? 'active' : ''}
                            >
                                7D
                            </button>
                            <button
                                onClick={() => admin.setRevenueWindow && admin.setRevenueWindow('30d')}
                                className={revenueWindow === '30d' ? 'active' : ''}
                            >
                                30D
                            </button>
                        </div>
                    </div>
                    <div className="mini-chart-wrap" style={{ height: '260px' }}>
                        <canvas id="revenueChart" style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
                    </div>
                </div>

                {/* Inventory Snapshot */}
                <div className="card inventory-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--warning), transparent)' }}></div>
                    <div className="card-title-row">
                        <h3 style={{ fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Warehouse Control</h3>
                        <span style={{ fontSize: '9px', color: 'var(--success)', border: '1px solid var(--success)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.1em' }}>SECURE</span>
                    </div>
                    <div className="inventory-list" style={{ marginTop: '24px' }}>
                        <div className="inventory-row" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total Capacity</span>
                            <strong style={{ fontSize: '26px', color: 'var(--info)' }}>{admin.number ? admin.number(inventoryStats.totalProducts) : 0}</strong>
                        </div>
                        <div className="inventory-row" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--danger)' }}>Critical Shortage</span>
                            <strong className="danger-text" style={{ fontSize: '26px' }}>{admin.number ? admin.number(inventoryStats.outOfStock) : 0}</strong>
                        </div>
                        <div className="inventory-row" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warning)' }}>Reserved Units</span>
                            <strong style={{ fontSize: '26px', color: 'var(--warning)' }}>{admin.number ? admin.number(inventoryStats.reservedUnits) : 0}</strong>
                        </div>
                        <div className="inventory-row" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active Units</span>
                            <strong style={{ fontSize: '26px', color: 'var(--success)' }}>{admin.number ? admin.number(inventoryStats.totalUnits) : 0}</strong>
                        </div>

                        <div className="stock-health" style={{ marginTop: '24px', borderTop: '1px dashed var(--border-strong)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ color: 'var(--muted)', fontSize: '10px', letterSpacing: '0.15em', margin: 0 }}>SYSTEM HEALTH</p>
                                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', color: 'var(--success)', textShadow: '0 0 8px var(--success)', fontWeight: 'bold' }}>{inventoryStats.stockHealth || 0}%</span>
                            </div>
                            <div className="bar" style={{ height: '6px', background: 'rgba(15, 23, 42, 0.8)', borderColor: 'var(--border)' }}>
                                <span style={{ width: `${inventoryStats.stockHealth || 0}%`, background: 'var(--success)', boxShadow: '0 0 10px var(--success)', display: 'block', height: '100%' }}></span>
                            </div>
                            <small style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '8px', display: 'block' }}>
                                Optimal parameters maintained.
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid two">
                {/* Recent Orders */}
                <div className="card">
                    <div className="card-title-row">
                        <h3 style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Ledger</h3>
                        <button
                            onClick={() => admin.setActiveTab && admin.setActiveTab('orders')}
                            className="secondary-btn"
                            style={{ padding: '4px 10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        >
                            View Log
                        </button>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ref ID</th>
                                    <th>Volume</th>
                                    <th>Pay Status</th>
                                    <th>State</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order, idx) => (
                                    <tr key={idx}>
                                        <td style={{ fontFamily: 'monospace' }}>{order.orderNumber}</td>
                                        <td style={{ fontWeight: 'bold' }}>{admin.currency ? admin.currency(order.total) : ''}</td>
                                        <td>
                                            <span className="status-pill">
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-pill">
                                                {order.fulfillmentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Auctions Ending Soon */}
                <div className="card">
                    <div className="card-title-row">
                        <h3 style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Bidding</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <span style={{ width: '6px', height: '6px', background: 'var(--danger)', borderRadius: '50%', boxShadow: '0 0 8px var(--danger)', animation: 'pulse 2s infinite' }}></span>
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--danger)', letterSpacing: '1px', textTransform: 'uppercase' }}>Live</span>
                        </div>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Bid Price</th>
                                    <th>ETA</th>
                                    <th>Vol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {endingAuctions.map((auction, idx) => (
                                    <tr key={idx}>
                                        <td style={{ fontWeight: '500' }}>{auction.title}</td>
                                        <td style={{ color: '#60a5fa', fontWeight: 'bold', fontFamily: 'monospace' }}>{admin.currency ? admin.currency(auction.currentPrice) : ''}</td>
                                        <td style={{ color: '#ef4444', fontWeight: 'bold', fontFamily: 'monospace' }}>{auction.timeLeftText}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{admin.number ? admin.number(auction.totalBids) : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
