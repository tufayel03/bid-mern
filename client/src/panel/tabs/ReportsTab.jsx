import React from 'react';
import { useAdmin } from '../AdminContext';

export function ReportsTab() {
    const admin = useAdmin();
    const {
        financialSummary = {},
        wallets = [],
        reservations = { active: [], expired: [], consumed: [] },
        systemHealth = {},
        disputes = [],
        disputeFilters = {},
        disputeDrafts = {},
    } = admin;

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="admin-tab-header">
                <div>
                    <h2>Financial & Operations Reports</h2>
                    <p>Track GMV, revenue, wallet balances, system health, and disputes.</p>
                </div>
                <button onClick={() => admin.loadReports && admin.loadReports(true)} className="order-filter-btn">Reload</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <div className="admin-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8fa0be', margin: 0 }}>GMV</p>
                    <h4 className="mono" style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>{admin.currency ? admin.currency(financialSummary.gmv) : ''}</h4>
                </div>
                <div className="admin-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8fa0be', margin: 0 }}>Net Revenue</p>
                    <h4 className="mono" style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>{admin.currency ? admin.currency(financialSummary.netRevenue) : ''}</h4>
                </div>
                <div className="admin-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8fa0be', margin: 0 }}>Fees Collected</p>
                    <h4 className="mono" style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>{admin.currency ? admin.currency(financialSummary.feesCollected) : ''}</h4>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', alignItems: 'start' }}>
                <div className="admin-card no-pad">
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(45, 51, 67, 0.8)' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Wallets</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Wallet</th>
                                    <th>User</th>
                                    <th>Balance</th>
                                    <th>Locked</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wallets.map(wallet => (
                                    <tr key={wallet.id}>
                                        <td className="mono" style={{ fontSize: '12px' }}>{wallet.id}</td>
                                        <td className="mono" style={{ fontSize: '12px', color: '#8fa0be' }}>{wallet.userId}</td>
                                        <td className="mono">{admin.currency ? admin.currency(wallet.balance) : ''}</td>
                                        <td className="mono" style={{ color: '#fbbf24' }}>{admin.currency ? admin.currency(wallet.lockedBalance) : ''}</td>
                                    </tr>
                                ))}
                                {wallets.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#8fa0be' }}>No wallets found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="admin-card">
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', color: '#f8fafc' }}>Reservations Snapshot</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
                        <div style={{ padding: '16px', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid rgba(45, 51, 67, 0.5)' }}>
                            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8fa0be', margin: 0 }}>Active</p>
                            <p className="mono" style={{ fontSize: '20px', margin: '4px 0 0 0', color: '#f8fafc' }}>{admin.number ? admin.number((reservations.active || []).length) : 0}</p>
                        </div>
                        <div style={{ padding: '16px', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid rgba(45, 51, 67, 0.5)' }}>
                            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8fa0be', margin: 0 }}>Expired</p>
                            <p className="mono" style={{ fontSize: '20px', margin: '4px 0 0 0', color: '#f8fafc' }}>{admin.number ? admin.number((reservations.expired || []).length) : 0}</p>
                        </div>
                        <div style={{ padding: '16px', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid rgba(45, 51, 67, 0.5)' }}>
                            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8fa0be', margin: 0 }}>Consumed</p>
                            <p className="mono" style={{ fontSize: '20px', margin: '4px 0 0 0', color: '#f8fafc' }}>{admin.number ? admin.number((reservations.consumed || []).length) : 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', alignItems: 'start' }}>
                <div className="admin-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>System Health</h3>
                        <button onClick={() => admin.loadReports && admin.loadReports(true)} className="order-filter-btn">Check</button>
                    </div>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', itemsCenter: 'center', padding: '12px', background: 'var(--panel-bg)', borderRadius: '6px', border: '1px solid rgba(45, 51, 67, 0.4)' }}>
                            <span style={{ color: '#8fa0be' }}>API</span>
                            <span className={`status-badge ${systemHealth.api === 'up' ? 'status-live' : 'status-cancelled'}`}>{systemHealth.api}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', itemsCenter: 'center', padding: '12px', background: 'var(--panel-bg)', borderRadius: '6px', border: '1px solid rgba(45, 51, 67, 0.4)' }}>
                            <span style={{ color: '#8fa0be' }}>Mongo + Redis</span>
                            <span className={`status-badge ${systemHealth.dependencies === 'up' ? 'status-live' : 'status-cancelled'}`}>{systemHealth.dependencies}</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '11px', color: '#8fa0be', marginTop: '12px' }}>{systemHealth.lastCheckedAt ? `Last checked: ${admin.date ? admin.date(systemHealth.lastCheckedAt) : ''}` : ''}</p>
                </div>
                <div className="admin-card no-pad" style={{ gridColumn: 'span 2' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(45, 51, 67, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Monthly Revenue Report</h3>
                        <button onClick={() => admin.exportFinancialMonthlyCsv && admin.exportFinancialMonthlyCsv()} className="order-filter-btn">Export CSV</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Orders</th>
                                    <th>GMV</th>
                                    <th>Net</th>
                                    <th>Fees</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(financialSummary.monthlyReport || []).map(row => (
                                    <tr key={row.month}>
                                        <td className="mono" style={{ color: '#f8fafc', fontWeight: 700 }}>{row.month}</td>
                                        <td className="mono">{admin.number ? admin.number(row.orders) : ''}</td>
                                        <td className="mono" style={{ color: '#3b82f6', fontWeight: 700 }}>{admin.currency ? admin.currency(row.gmv) : ''}</td>
                                        <td className="mono" style={{ color: '#10b981', fontWeight: 700 }}>{admin.currency ? admin.currency(row.netRevenue) : ''}</td>
                                        <td className="mono" style={{ color: '#fbbf24', fontWeight: 700 }}>{admin.currency ? admin.currency(row.fees) : ''}</td>
                                    </tr>
                                ))}
                                {!(financialSummary.monthlyReport || []).length && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#8fa0be' }}>No monthly data.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="admin-card no-pad">
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(45, 51, 67, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Dispute Resolution Center</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            value={disputeFilters.status || ''}
                            onChange={(e) => { admin.disputeFilters.status = e.target.value; }}
                            className="order-filter-select" style={{ padding: '6px 12px' }}
                        >
                            <option value="">All</option>
                            <option value="open">open</option>
                            <option value="under_review">under_review</option>
                            <option value="resolved">resolved</option>
                            <option value="rejected">rejected</option>
                        </select>
                        <button onClick={() => admin.applyReportFilters && admin.applyReportFilters()} className="order-filter-btn">Apply</button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Resolution</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disputes.map(item => (
                                <tr key={item.id}>
                                    <td className="mono" style={{ color: '#f8fafc', fontWeight: 700 }}>{item.orderId}</td>
                                    <td>{item.reason}</td>
                                    <td>
                                        <select
                                            value={disputeDrafts[item.id]?.status || 'open'}
                                            onChange={(e) => { if (admin.disputeDrafts[item.id]) admin.disputeDrafts[item.id].status = e.target.value; }}
                                            className="order-filter-select" style={{ minWidth: 0, padding: '4px 8px' }}
                                        >
                                            <option value="open">open</option>
                                            <option value="under_review">under_review</option>
                                            <option value="resolved">resolved</option>
                                            <option value="rejected">rejected</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div style={{ display: 'grid', gap: '6px' }}>
                                            <select
                                                value={disputeDrafts[item.id]?.resolution || 'none'}
                                                onChange={(e) => { if (admin.disputeDrafts[item.id]) admin.disputeDrafts[item.id].resolution = e.target.value; }}
                                                className="order-filter-select" style={{ minWidth: 0, padding: '4px 8px' }}
                                            >
                                                <option value="none">none</option>
                                                <option value="refund_buyer">refund_buyer</option>
                                                <option value="partial_refund">partial_refund</option>
                                                <option value="release_funds">release_funds</option>
                                            </select>
                                            {disputeDrafts[item.id]?.resolution === 'partial_refund' && (
                                                <input
                                                    value={disputeDrafts[item.id]?.resolutionAmount || ''}
                                                    onChange={(e) => { if (admin.disputeDrafts[item.id]) admin.disputeDrafts[item.id].resolutionAmount = e.target.value; }}
                                                    type="number" min="1" placeholder="Amount"
                                                    className="admin-search-input mono" style={{ minWidth: '80px', padding: '4px 8px' }}
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button onClick={() => admin.resolveDispute && admin.resolveDispute(item)} className="order-filter-btn primary" style={{ padding: '6px 12px' }}>Save</button>
                                    </td>
                                </tr>
                            ))}
                            {disputes.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#8fa0be' }}>No disputes found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
