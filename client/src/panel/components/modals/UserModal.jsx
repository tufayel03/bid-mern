import React from 'react';
import { useAdmin } from '../../AdminContext';
import { Icon } from '../Icon';

export function UserModal() {
    const admin = useAdmin();
    const { selectedUserDetails, userDetailsLoading } = admin;

    return (
        <>
            {/* User Detail Drawer */}
            {(selectedUserDetails || userDetailsLoading) && (
                <div className="fixed inset-0 z-[105] bg-black/70 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget && admin.closeUserDetails) admin.closeUserDetails(); }}>
                    <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-zinc-900 border-l border-zinc-800 p-6 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">User Detail</h3>
                            <button onClick={() => admin.closeUserDetails && admin.closeUserDetails()} className="text-zinc-500 hover:text-zinc-300">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        {userDetailsLoading && (
                            <div className="mt-6 text-sm text-zinc-500">Loading user data...</div>
                        )}

                        {selectedUserDetails && (
                            <div className="mt-6 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                                        <p className="text-[10px] uppercase text-zinc-500">Name</p>
                                        <p className="font-semibold">{selectedUserDetails.name}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                                        <p className="text-[10px] uppercase text-zinc-500">Email</p>
                                        <p className="mono text-xs break-all">{selectedUserDetails.email}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                                        <p className="text-[10px] uppercase text-zinc-500">Role</p>
                                        <p className="font-semibold">{selectedUserDetails.role}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                                        <p className="text-[10px] uppercase text-zinc-500">Status</p>
                                        <p className="font-semibold">{selectedUserDetails.isSuspended ? 'suspended' : 'active'}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                                        <p className="text-[10px] uppercase text-zinc-500">Total Orders</p>
                                        <p className="font-semibold mono">{admin.number ? admin.number(selectedUserDetails.orderCount) : selectedUserDetails.orderCount}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                                        <p className="text-[10px] uppercase text-zinc-500">Total Spent</p>
                                        <p className="font-semibold mono">{admin.currency ? admin.currency(selectedUserDetails.totalSpent) : selectedUserDetails.totalSpent}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                                        <p className="text-[10px] uppercase text-zinc-500">Phone</p>
                                        <p className="font-semibold mono text-xs">{selectedUserDetails.phone || '-'}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                                        <p className="text-[10px] uppercase text-zinc-500">Joined</p>
                                        <p className="font-semibold text-xs">{admin.date ? admin.date(selectedUserDetails.createdAt) : selectedUserDetails.createdAt}</p>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Address Book</p>
                                        <span className="text-[11px] text-zinc-500">{admin.number ? admin.number((selectedUserDetails?.addresses || []).length) : 0} saved</span>
                                    </div>
                                    <div className="mt-3 space-y-3">
                                        {(selectedUserDetails?.addresses || []).map((address, index) => (
                                            <div key={`${index}-${address.label || address.addressLine1 || 'addr'}`} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                                                <div className="flex justify-between gap-3">
                                                    <p className="text-xs font-semibold">{address.label || (`Address #${index + 1}`)}</p>
                                                    <p className="text-[11px] mono text-zinc-500">{address.phone || '-'}</p>
                                                </div>
                                                <p className="text-xs text-zinc-400 mt-1">{address.fullName || selectedUserDetails?.name || '-'}</p>
                                                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                                                    {[address.addressLine1, address.addressLine2, address.area, address.city, address.postalCode, address.country].filter(Boolean).join(', ') || '-'}
                                                </p>
                                            </div>
                                        ))}
                                        {!(selectedUserDetails?.addresses || []).length && (
                                            <p className="text-xs text-zinc-500">No saved addresses.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">User Orders</p>
                                        <span className="text-[11px] text-zinc-500">{admin.number ? admin.number((selectedUserDetails?.recentOrders || []).length) : 0} loaded</span>
                                    </div>
                                    <div className="mt-4 space-y-4">
                                        {(selectedUserDetails?.recentOrders || []).map((order) => (
                                            <div key={order.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-3">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold mono">{order.orderNumber}</p>
                                                        <p className="text-[11px] text-zinc-500">{admin.date ? admin.date(order.createdAt) : order.createdAt}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className={`status-badge status-${admin.normalizeStatus ? admin.normalizeStatus(order.paymentStatus) : order.paymentStatus}`}>
                                                            {order.paymentStatus || 'unknown'}
                                                        </span>
                                                        <span className={`status-badge status-${admin.normalizeStatus ? admin.normalizeStatus(order.fulfillmentStatus) : order.fulfillmentStatus}`}>
                                                            {order.fulfillmentStatus || 'unknown'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                                    <div className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-2">
                                                        <p className="text-[10px] uppercase text-zinc-500">Method</p>
                                                        <p className="text-xs font-semibold">{order.paymentMethod || '-'}</p>
                                                    </div>
                                                    <div className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-2">
                                                        <p className="text-[10px] uppercase text-zinc-500">Subtotal</p>
                                                        <p className="text-xs mono">{admin.currency ? admin.currency(order.subtotal) : order.subtotal}</p>
                                                    </div>
                                                    <div className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-2">
                                                        <p className="text-[10px] uppercase text-zinc-500">Shipping</p>
                                                        <p className="text-xs mono">{admin.currency ? admin.currency(order.shipping) : order.shipping}</p>
                                                    </div>
                                                    <div className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-2">
                                                        <p className="text-[10px] uppercase text-zinc-500">Discount</p>
                                                        <p className="text-xs mono">{admin.currency ? admin.currency(order.discount) : order.discount}</p>
                                                    </div>
                                                    <div className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-2">
                                                        <p className="text-[10px] uppercase text-zinc-500">Total</p>
                                                        <p className="text-xs mono font-semibold text-blue-300">{admin.currency ? admin.currency(order.total) : order.total}</p>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                                                    <p className="text-[10px] uppercase text-zinc-500">Customer Note</p>
                                                    <p className="text-xs text-zinc-200 mt-1 whitespace-pre-line">{order.customerNote || '-'}</p>
                                                </div>

                                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                                                    <p className="text-[10px] uppercase text-zinc-500">Courier</p>
                                                    <div className="mt-1 space-y-1 text-xs">
                                                        <p className="text-zinc-200">{order.courier?.trackingCode ? `Tracking: ${order.courier.trackingCode}` : 'Tracking: -'}</p>
                                                        <p className="text-zinc-400 mono">{order.courier?.consignmentId ? `Consignment: ${order.courier.consignmentId}` : 'Consignment: -'}</p>
                                                        <p className="text-zinc-400 mono">{order.courier?.statusCode ? `Code: ${order.courier.statusCode}` : 'Code: -'}</p>
                                                        <p className="text-zinc-300">{order.courier?.deliveryStatus ? `Status: ${admin.courierStatusLabel ? admin.courierStatusLabel(order.courier.deliveryStatus) : order.courier.deliveryStatus}` : 'Status: not synced'}</p>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-zinc-900/60 text-zinc-500">
                                                            <tr>
                                                                <th className="px-3 py-2">Item</th>
                                                                <th className="px-3 py-2">Qty</th>
                                                                <th className="px-3 py-2">Unit</th>
                                                                <th className="px-3 py-2">Subtotal</th>
                                                                <th className="px-3 py-2">Type</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-zinc-800">
                                                            {(order.items || []).map((item, itemIndex) => (
                                                                <tr key={item.productId || itemIndex}>
                                                                    <td className="px-3 py-2">
                                                                        <p className="font-semibold text-zinc-100">{item.titleSnapshot || 'Item'}</p>
                                                                        <p className="mono text-[10px] text-zinc-500">{item.productId || '-'}</p>
                                                                    </td>
                                                                    <td className="px-3 py-2 mono">{admin.number ? admin.number(item.qty) : item.qty}</td>
                                                                    <td className="px-3 py-2 mono">{admin.currency ? admin.currency(item.unitPrice) : item.unitPrice}</td>
                                                                    <td className="px-3 py-2 mono">{admin.currency ? admin.currency((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)) : ((Number(item.qty) || 0) * (Number(item.unitPrice) || 0))}</td>
                                                                    <td className="px-3 py-2 text-zinc-400">{item.type || 'fixed'}</td>
                                                                </tr>
                                                            ))}
                                                            {!(order.items || []).length && (
                                                                <tr>
                                                                    <td colSpan="5" className="px-3 py-3 text-center text-zinc-500">No order items.</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                                                    <p className="text-[10px] uppercase text-zinc-500">Shipping Address</p>
                                                    <p className="text-xs text-zinc-200 mt-1">{order.shippingAddress?.fullName || selectedUserDetails?.name || '-'}</p>
                                                    <p className="text-xs text-zinc-400 mt-1">{order.shippingAddress?.phone || selectedUserDetails?.phone || '-'}</p>
                                                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                                                        {[order.shippingAddress?.addressLine1, order.shippingAddress?.addressLine2, order.shippingAddress?.area, order.shippingAddress?.city, order.shippingAddress?.postalCode, order.shippingAddress?.country].filter(Boolean).join(', ') || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {!(selectedUserDetails?.recentOrders || []).length && (
                                            <p className="py-4 text-center text-sm text-zinc-500">No orders found for this user.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
