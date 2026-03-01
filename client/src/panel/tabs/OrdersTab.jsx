import React from 'react';
import { useAdmin } from '../AdminContext';

export function OrdersTab() {
    const admin = useAdmin();
    const { orderFilters, orders = [], ordersDeleting, orderDrafts, ordersMeta } = admin;

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="admin-tab-header">
                <div>
                    <h2>Order Management</h2>
                    <p>Track, update, dispatch, and clean orders from one control surface.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => admin.exportOrdersCsv && admin.exportOrdersCsv()} className="order-filter-btn">Export Orders</button>
                    <button onClick={() => admin.loadOrders && admin.loadOrders(true)} className="order-filter-btn">Reload</button>
                </div>
            </div>
            <div className="order-panel">
                <select
                    value={orderFilters.status || ''}
                    onChange={(e) => { admin.orderFilters.status = e.target.value; }}
                    className="order-filter-select" style={{ flex: '0 1 auto' }}
                >
                    <option value="">All Fulfillment</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select
                    value={orderFilters.paymentStatus || ''}
                    onChange={(e) => { admin.orderFilters.paymentStatus = e.target.value; }}
                    className="order-filter-select" style={{ flex: '0 1 auto' }}
                >
                    <option value="">All Payment</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="collected">Collected</option>
                    <option value="refunded">Refunded</option>
                </select>
                <button onClick={() => admin.loadOrders && admin.loadOrders(true)} className="order-filter-btn primary">Apply</button>
                <button onClick={() => admin.resetOrderFilters && admin.resetOrderFilters()} className="order-filter-btn">Reset</button>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div className="order-selection-meta">
                        Selected: <span className="mono">{admin.number ? admin.number(admin.selectedOrderCount ? admin.selectedOrderCount() : 0) : 0}</span>
                        {' / '}
                        <span className="mono">{admin.number ? admin.number(orders.length) : 0}</span>
                    </div>
                    <button onClick={() => admin.selectAllVisibleOrders && admin.selectAllVisibleOrders()} className="order-filter-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>Select Visible</button>
                    <button onClick={() => admin.clearOrderSelection && admin.clearOrderSelection()} className="order-filter-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>Clear</button>
                    <button
                        onClick={() => admin.deleteSelectedOrders && admin.deleteSelectedOrders()}
                        disabled={!(admin.selectedOrderCount && admin.selectedOrderCount()) || ordersDeleting}
                        className="order-filter-btn danger" style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                        {ordersDeleting ? 'Deleting...' : 'Delete Selected'}
                    </button>
                </div>
            </div>
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={orders.length > 0 && admin.selectedOrderCount && admin.selectedOrderCount() === orders.length}
                                    onChange={(e) => e.target.checked ? admin.selectAllVisibleOrders() : admin.clearOrderSelection()}
                                    className="order-check"
                                />
                            </th>
                            <th style={{ width: '40px' }}>#</th>
                            <th>Order #</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Fulfillment</th>
                            <th>Customer Note</th>
                            <th>Courier</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={order.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={admin.isOrderSelected ? admin.isOrderSelected(order) : false}
                                        onChange={() => admin.toggleOrderSelection && admin.toggleOrderSelection(order)}
                                        className="order-check"
                                    />
                                </td>
                                <td className="mono" style={{ color: '#8fa0be' }}>{admin.orderSerial ? admin.orderSerial(index) : index + 1}</td>
                                <td className="mono" style={{ fontWeight: 800, color: '#f8fafc' }}>{order.orderNumber}</td>
                                <td className="mono" style={{ fontWeight: 800, color: '#3b82f6' }}>{admin.currency ? admin.currency(order.total) : ''}</td>
                                <td>
                                    <select
                                        className="order-filter-select" style={{ minWidth: 0, padding: '4px 8px' }}
                                        value={orderDrafts[order.id]?.paymentStatus || 'unpaid'}
                                        onChange={(e) => { if (admin.orderDrafts[order.id]) admin.orderDrafts[order.id].paymentStatus = e.target.value; }}
                                    >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="collected">Collected</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </td>
                                <td>
                                    <select
                                        className="order-filter-select" style={{ minWidth: 0, padding: '4px 8px' }}
                                        value={orderDrafts[order.id]?.fulfillmentStatus || 'pending'}
                                        onChange={(e) => { if (admin.orderDrafts[order.id]) admin.orderDrafts[order.id].fulfillmentStatus = e.target.value; }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td>
                                    <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '12px', color: '#e2e8f0', maxWidth: '200px' }} title={order.customerNote || ''}>{order.customerNote || '-'}</p>
                                </td>
                                <td>
                                    <div style={{ display: 'grid', gap: '4px' }}>
                                        {order.courier?.trackingCode && <p className="mono" style={{ fontSize: '10px', color: '#93c5fd', margin: 0 }}>Track: {order.courier.trackingCode}</p>}
                                        {order.courier?.consignmentId && <p className="mono" style={{ fontSize: '10px', color: '#8fa0be', margin: 0 }}>CID: {order.courier.consignmentId}</p>}
                                        {order.courier?.statusCode && <p className="mono" style={{ fontSize: '10px', color: '#8fa0be', margin: 0 }}>Code: {order.courier.statusCode}</p>}
                                        {order.courier?.deliveryStatus && (
                                            <span className={`status-badge ${admin.courierStatusClass ? admin.courierStatusClass(order.courier?.deliveryStatus) : ''}`}>
                                                {admin.courierStatusLabel ? admin.courierStatusLabel(order.courier?.deliveryStatus) : ''}
                                            </span>
                                        )}
                                        {!order.courier?.trackingCode && !order.courier?.consignmentId && !order.courier?.statusCode && (
                                            <p style={{ fontSize: '11px', color: '#8fa0be', margin: 0 }}>Not sent</p>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <p style={{ fontSize: '12px', margin: 0, color: '#f8fafc' }}>{admin.date ? admin.date(order.createdAt) : ''}</p>
                                    <p className="mono" style={{ fontSize: '10px', color: '#8fa0be', margin: '4px 0 0 0' }}>{admin.time ? admin.time(order.createdAt) : ''}</p>
                                </td>
                                <td>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <button onClick={() => admin.openOrderDetails && admin.openOrderDetails(order)} className="order-filter-btn" style={{ padding: '4px 8px', fontSize: '11px', gridColumn: 'span 2' }}>Details</button>
                                        <button onClick={() => admin.saveOrder && admin.saveOrder(order)} className="order-filter-btn primary" style={{ padding: '4px 8px', fontSize: '11px' }}>Save</button>
                                        <button onClick={() => admin.sendOrderToCourier && admin.sendOrderToCourier(order)} className="order-filter-btn" style={{ padding: '4px 8px', fontSize: '11px' }}>Send</button>
                                        <button onClick={() => admin.syncOrderCourierStatus && admin.syncOrderCourierStatus(order)} className="order-filter-btn" style={{ padding: '4px 8px', fontSize: '11px' }}>Sync</button>
                                        <button onClick={() => admin.deleteOrder && admin.deleteOrder(order)} className="order-filter-btn danger" style={{ padding: '4px 8px', fontSize: '11px' }}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#8fa0be' }}>No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#8fa0be' }}>
                <span>Page {ordersMeta.page} of {ordersMeta.totalPages}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => admin.changeOrdersPage && admin.changeOrdersPage(ordersMeta.page - 1)} disabled={ordersMeta.page <= 1} className="order-filter-btn" style={{ padding: '6px 16px' }}>Prev</button>
                    <button onClick={() => admin.changeOrdersPage && admin.changeOrdersPage(ordersMeta.page + 1)} disabled={ordersMeta.page >= ordersMeta.totalPages} className="order-filter-btn" style={{ padding: '6px 16px' }}>Next</button>
                </div>
            </div>
        </div>
    );
}
