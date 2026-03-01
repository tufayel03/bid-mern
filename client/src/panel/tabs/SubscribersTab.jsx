import React from 'react';
import { useAdmin } from '../AdminContext';

export function SubscribersTab() {
    const admin = useAdmin();
    const { subscribers = [], subscriberFilters = {}, subscriberDraft = {} } = admin;

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="admin-tab-header">
                <div>
                    <h2>Subscribers</h2>
                    <p>Manage newsletter contacts across manual insertion, footers, and checkouts.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => admin.importSubscribersCsv && admin.importSubscribersCsv()} className="order-filter-btn">Import CSV</button>
                    <button onClick={() => admin.exportSubscribersCsv && admin.exportSubscribersCsv()} className="order-filter-btn">Export CSV</button>
                    <button onClick={() => admin.loadSubscribers && admin.loadSubscribers(true)} className="order-filter-btn">Reload</button>
                </div>
            </div>

            <div className="admin-card" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    value={subscriberFilters.search || ''}
                    onChange={(e) => { admin.subscriberFilters.search = e.target.value; }}
                    placeholder="Search email/name..."
                    className="admin-search-input" style={{ flex: '1 1 200px' }}
                />
                <select
                    value={subscriberFilters.isActive || ''}
                    onChange={(e) => { admin.subscriberFilters.isActive = e.target.value; }}
                    className="order-filter-select" style={{ flex: '0 1 auto' }}
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
                <button onClick={() => admin.loadSubscribers && admin.loadSubscribers(true)} className="order-filter-btn primary">Apply</button>
            </div>
            <div className="admin-card" style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Add Subscriber Manually</h3>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8fa0be', fontWeight: 700 }}>Admin Insert</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <input
                        type="email"
                        value={subscriberDraft.email || ''}
                        onChange={(e) => { admin.subscriberDraft.email = e.target.value; }}
                        placeholder="Email address"
                        className="admin-search-input" style={{ gridColumn: 'span 2' /* This might wrap improperly depending on minmax but fine */ }}
                    />
                    <input
                        value={subscriberDraft.name || ''}
                        onChange={(e) => { admin.subscriberDraft.name = e.target.value; }}
                        placeholder="Name (optional)"
                        className="admin-search-input"
                    />
                    <select
                        value={subscriberDraft.source || 'manual'}
                        onChange={(e) => { admin.subscriberDraft.source = e.target.value; }}
                        className="order-filter-select"
                    >
                        <option value="manual">manual</option>
                        <option value="footer">footer</option>
                        <option value="checkout">checkout</option>
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#8fa0be', cursor: 'pointer', fontWeight: 700 }}>
                        <input
                            type="checkbox"
                            checked={!!subscriberDraft.isActive}
                            onChange={(e) => { admin.subscriberDraft.isActive = e.target.checked; }}
                            className="order-check"
                        />
                        Active on add
                    </label>
                    <button onClick={() => admin.createSubscriber && admin.createSubscriber()} className="order-filter-btn primary">Add Subscriber</button>
                </div>
            </div>

            <div className="admin-card no-pad">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Source</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map(subscriber => (
                                <tr key={subscriber.id}>
                                    <td className="mono" style={{ fontWeight: 700, color: '#f8fafc' }}>{subscriber.email}</td>
                                    <td>{subscriber.name || '-'}</td>
                                    <td style={{ color: '#8fa0be' }}>{subscriber.source || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${subscriber.isActive ? 'status-live' : 'status-cancelled'}`}>
                                            {subscriber.isActive ? 'active' : 'inactive'}
                                        </span>
                                    </td>
                                    <td>{admin.date ? admin.date(subscriber.createdAt) : ''}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => admin.toggleSubscriber && admin.toggleSubscriber(subscriber)} className="order-filter-btn primary" style={{ padding: '6px 12px' }}>Toggle</button>
                                            <button onClick={() => admin.deleteSubscriber && admin.deleteSubscriber(subscriber)} className="order-filter-btn danger" style={{ padding: '6px 12px' }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {subscribers.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#8fa0be' }}>No subscribers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
