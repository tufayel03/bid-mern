import React from 'react';
import { useAdmin } from '../AdminContext';

export function UsersTab() {
    const admin = useAdmin();
    const { users = [], usersMeta = {}, userFilters = {}, usersImport = {} } = admin;

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="admin-tab-header">
                <div>
                    <h2>User Management</h2>
                    <p>View, suspend, and manage all collectors registered on the platform.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => admin.exportUsersCsv && admin.exportUsersCsv()} className="order-filter-btn">Export CSV</button>
                    <button onClick={() => admin.loadUsers && admin.loadUsers(true)} className="order-filter-btn">Reload</button>
                </div>
            </div>
            <div className="admin-card" style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', color: '#f8fafc' }}>Import Users CSV</p>
                        <p style={{ fontSize: '11px', color: '#8fa0be', margin: 0 }}>Columns: <span className="mono" style={{ color: '#e2e8f0' }}>name,email,phone,role,isSuspended,password</span> (password required for new users).</p>
                    </div>
                    <button onClick={() => admin.importUsersCsv && admin.importUsersCsv()} className="order-filter-btn primary">
                        {usersImport.importing ? 'Importing...' : 'Import CSV'}
                    </button>
                </div>
                <div className="relative cursor-pointer w-full group" style={{ border: '1px dashed var(--primary)', background: 'rgba(0, 243, 255, 0.05)', padding: '16px', borderRadius: '4px', textAlign: 'center', transition: 'all 0.2s', boxShadow: 'inset 0 0 10px rgba(0, 243, 255, 0.1)' }}>
                    <input
                        id="usersImportInput"
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => admin.onUsersImportFileChange && admin.onUsersImportFileChange(e)}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                    />
                    <div className="pointer-events-none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, letterSpacing: '0.1em', color: '#00f3ff', textTransform: 'uppercase', fontSize: '14px', textShadow: '0 0 8px rgba(0, 243, 255, 0.6)' }}>
                            {usersImport.fileName ? `READY: ${usersImport.fileName}` : 'SELECT CSV DATA_MODULE'}
                        </span>
                        <span style={{ color: '#8fa0be', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Drop CSV file here</span>
                    </div>
                </div>
            </div>
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Orders</th>
                            <th>Spent</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id}>
                                <td className="mono" style={{ color: '#8fa0be' }}>{admin.userRowSerial ? admin.userRowSerial(index) : index + 1}</td>
                                <td style={{ fontWeight: 700, color: '#f8fafc' }}>{user.name}</td>
                                <td style={{ color: '#8fa0be' }}>{user.email}</td>
                                <td className="mono" style={{ color: '#e2e8f0' }}>{admin.number ? admin.number(user.orderCount) : ''}</td>
                                <td className="mono" style={{ color: '#3b82f6', fontWeight: 700 }}>{admin.currency ? admin.currency(user.totalSpent) : ''}</td>
                                <td>
                                    <select className="order-filter-select" style={{ minWidth: 0, padding: '4px 8px' }} value={user.role || ''} onChange={(e) => admin.setUserRole && admin.setUserRole(user, e.target.value)}>
                                        <option value="customer">customer</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.isSuspended ? 'status-cancelled' : 'status-live'}`}>
                                        {user.isSuspended ? 'suspended' : 'active'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <button onClick={() => admin.viewUserDetails && admin.viewUserDetails(user)} className="order-filter-btn" style={{ padding: '6px 12px' }}>View</button>
                                        <button onClick={() => admin.sendUserPasswordReset && admin.sendUserPasswordReset(user)} className="order-filter-btn" style={{ padding: '6px 12px' }}>Reset PW</button>
                                        <button onClick={() => admin.toggleUserSuspend && admin.toggleUserSuspend(user)} className={`order-filter-btn ${user.isSuspended ? 'primary' : 'danger'}`} style={{ padding: '6px 12px' }}>
                                            {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#8fa0be' }}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#8fa0be', flexWrap: 'wrap', gap: '12px' }}>
                <span>Page {usersMeta.page} of {usersMeta.totalPages} • <span className="mono">{admin.number ? admin.number(usersMeta.total) : ''}</span> users</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label>Rows:</label>
                    <select
                        value={userFilters.limit || 20}
                        onChange={(e) => {
                            admin.userFilters.limit = parseInt(e.target.value);
                            if (admin.changeUsersLimit) admin.changeUsersLimit(parseInt(e.target.value));
                        }}
                        className="order-filter-select" style={{ minWidth: 0, padding: '4px 8px' }}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <button onClick={() => admin.changeUsersPage && admin.changeUsersPage(usersMeta.page - 1)} disabled={usersMeta.page <= 1} className="order-filter-btn" style={{ padding: '4px 12px' }}>Prev</button>
                    <button onClick={() => admin.changeUsersPage && admin.changeUsersPage(usersMeta.page + 1)} disabled={usersMeta.page >= usersMeta.totalPages} className="order-filter-btn" style={{ padding: '4px 12px' }}>Next</button>
                </div>
            </div>
        </div >
    );
}
