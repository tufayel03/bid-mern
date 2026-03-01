import React from 'react';
import { useAdmin } from '../AdminContext';

export function CouponsTab() {
    const admin = useAdmin();
    const { coupons = [], couponFilters = {}, couponDraft = {} } = admin;

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="admin-tab-header">
                <div>
                    <h2>Coupon Management</h2>
                    <p>Create and control discount codes independently from reports.</p>
                </div>
                <button onClick={() => admin.loadCoupons && admin.loadCoupons(true)} className="order-filter-btn">Reload</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>
                <div className="admin-card" style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', gap: '12px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Create Coupon</h3>
                        <button onClick={() => admin.applyCouponFilters && admin.applyCouponFilters()} className="order-filter-btn" style={{ padding: '4px 8px', fontSize: '11px', marginLeft: 'auto' }}>Apply Filter</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                            value={couponFilters.isActive || ''}
                            onChange={(e) => { admin.couponFilters.isActive = e.target.value; }}
                            className="order-filter-select" style={{ flex: 1, minWidth: 0, padding: '8px 12px' }}
                        >
                            <option value="">All status</option>
                            <option value="true">active</option>
                            <option value="false">inactive</option>
                        </select>
                        <button onClick={() => admin.applyCouponFilters && admin.applyCouponFilters()} className="order-filter-btn" style={{ padding: '8px 16px' }}>Filter</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <input
                            value={couponDraft.code || ''}
                            onChange={(e) => { admin.couponDraft.code = e.target.value; }}
                            placeholder="Code"
                            className="admin-search-input mono" style={{ textTransform: 'uppercase' }}
                        />
                        <select
                            value={couponDraft.type || 'percent'}
                            onChange={(e) => { admin.couponDraft.type = e.target.value; }}
                            className="order-filter-select" style={{ minWidth: 0 }}
                        >
                            <option value="percent">percent</option>
                            <option value="flat">flat</option>
                        </select>
                        <input
                            value={couponDraft.value || ''}
                            onChange={(e) => { admin.couponDraft.value = e.target.value; }}
                            type="number" min="0" placeholder="Value"
                            className="admin-search-input mono"
                        />
                        <input
                            value={couponDraft.maxUses || ''}
                            onChange={(e) => { admin.couponDraft.maxUses = e.target.value; }}
                            type="number" min="1" placeholder="Max Uses"
                            className="admin-search-input mono"
                        />
                        <input
                            value={couponDraft.expiresAt || ''}
                            onChange={(e) => { admin.couponDraft.expiresAt = e.target.value; }}
                            type="datetime-local"
                            className="admin-search-input"
                        />
                        <input
                            value={couponDraft.minOrderAmount || ''}
                            onChange={(e) => { admin.couponDraft.minOrderAmount = e.target.value; }}
                            type="number" min="0" placeholder="Min Order"
                            className="admin-search-input mono"
                        />
                    </div>
                    <select
                        value={couponDraft.appliesTo || 'both'}
                        onChange={(e) => { admin.couponDraft.appliesTo = e.target.value; }}
                        className="order-filter-select"
                    >
                        <option value="both">Applies to: Both</option>
                        <option value="fixed">Applies to: Fixed Price Only</option>
                        <option value="auction">Applies to: Auction Only</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#8fa0be', cursor: 'pointer', fontWeight: 700 }}>
                            <input
                                type="checkbox"
                                checked={!!couponDraft.isActive}
                                onChange={(e) => { admin.couponDraft.isActive = e.target.checked; }}
                                className="order-check"
                            />
                            Active
                        </label>
                        <button onClick={() => admin.createCoupon && admin.createCoupon()} className="order-filter-btn primary">Create Coupon</button>
                    </div>
                </div>

                <div className="admin-card no-pad" style={{ gridColumn: 'span 2' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(45, 51, 67, 0.8)' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Existing Coupons</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Type</th>
                                    <th>Value</th>
                                    <th>Max Uses</th>
                                    <th>Min Order</th>
                                    <th>Applies</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((coupon, index) => (
                                    <tr key={coupon.id || index}>
                                        <td className="mono" style={{ fontWeight: 700, color: '#f8fafc' }}>{coupon.code}</td>
                                        <td>
                                            <select
                                                value={coupon.type || 'percent'}
                                                onChange={(e) => { admin.coupons[index].type = e.target.value; }}
                                                className="order-filter-select" style={{ minWidth: 0, padding: '4px 8px' }}
                                            >
                                                <option value="percent">percent</option>
                                                <option value="flat">flat</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                value={coupon.value || 0}
                                                onChange={(e) => { admin.coupons[index].value = Number(e.target.value); }}
                                                type="number" min="0" className="admin-search-input mono" style={{ minWidth: '80px', padding: '4px 8px' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                value={coupon.maxUses || 0}
                                                onChange={(e) => { admin.coupons[index].maxUses = Number(e.target.value); }}
                                                type="number" min="1" className="admin-search-input mono" style={{ minWidth: '80px', padding: '4px 8px' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                value={coupon.minOrderAmount || 0}
                                                onChange={(e) => { admin.coupons[index].minOrderAmount = Number(e.target.value); }}
                                                type="number" min="0" className="admin-search-input mono" style={{ minWidth: '80px', padding: '4px 8px' }}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                value={coupon.appliesTo || 'both'}
                                                onChange={(e) => { admin.coupons[index].appliesTo = e.target.value; }}
                                                className="order-filter-select" style={{ minWidth: 0, padding: '4px 8px' }}
                                            >
                                                <option value="both">both</option>
                                                <option value="fixed">fixed</option>
                                                <option value="auction">auction</option>
                                            </select>
                                        </td>
                                        <td>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8fa0be', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!coupon.isActive}
                                                    onChange={(e) => { admin.coupons[index].isActive = e.target.checked; }}
                                                    className="order-check" style={{ width: '14px', height: '14px' }}
                                                />
                                                <span className={`status-badge ${coupon.isActive ? 'status-live' : 'status-cancelled'}`}>{coupon.isActive ? 'active' : 'inactive'}</span>
                                            </label>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button onClick={() => admin.updateCoupon && admin.updateCoupon(coupon)} className="order-filter-btn primary" style={{ padding: '6px 12px' }}>Save</button>
                                                <button onClick={() => admin.deleteCoupon && admin.deleteCoupon(coupon)} className="order-filter-btn danger" style={{ padding: '6px 12px' }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {coupons.length === 0 && (
                                    <tr>
                                        <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#8fa0be' }}>No coupons found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
