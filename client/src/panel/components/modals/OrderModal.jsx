import React from 'react';
import { useAdmin } from '../../AdminContext';
import { Icon } from '../Icon';

export function OrderModal() {
    const admin = useAdmin();
    const { courierSuccessModal = {}, orderDetailsModal = {} } = admin;

    return (
        <>
            {/* Courier Success Modal */}
            {courierSuccessModal.open && (
                <div className="fixed inset-0 z-[109] bg-black/80 backdrop-blur-sm px-4" onClick={(e) => { if (e.target === e.currentTarget && admin.closeCourierSuccessModal) admin.closeCourierSuccessModal(); }}>
                    <div className="mx-auto mt-16 w-[94vw] max-w-xl rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 text-zinc-100 shadow-2xl shadow-black/60 overflow-hidden">
                        <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/60 flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-blue-500/40 bg-blue-500/10 text-[10px] uppercase tracking-[0.14em] text-blue-300">SteadFast</div>
                                <h4 className="text-2xl font-bold mt-3 leading-tight">Customer Success Rate</h4>
                                {courierSuccessModal.orderNumber && <p className="text-xs text-zinc-400 mt-2">Order: {courierSuccessModal.orderNumber}</p>}
                                {courierSuccessModal.phoneNumber && <p className="text-xs text-zinc-500 mono">Phone: {courierSuccessModal.phoneNumber}</p>}
                            </div>
                            <button onClick={() => admin.closeCourierSuccessModal && admin.closeCourierSuccessModal()} className="h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 flex items-center justify-center">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        {courierSuccessModal.loading && (
                            <div className="px-6 py-8 text-sm text-zinc-400">Checking customer history from SteadFast...</div>
                        )}

                        {!courierSuccessModal.loading && (
                            <div className="px-6 py-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Total Orders</p>
                                        <p className="mono text-2xl font-bold mt-2 text-zinc-100">{admin.number ? admin.number(courierSuccessModal.totalOrders) : 0}</p>
                                    </div>
                                    <div className="rounded-xl border border-emerald-700/50 bg-emerald-950/30 p-4">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-300/80">Delivered</p>
                                        <p className="mono text-2xl font-bold mt-2 text-emerald-300">{admin.number ? admin.number(courierSuccessModal.totalDelivered) : 0}</p>
                                    </div>
                                    <div className="rounded-xl border border-red-700/50 bg-red-950/25 p-4">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-red-300/80">Cancelled</p>
                                        <p className="mono text-2xl font-bold mt-2 text-red-300">{admin.number ? admin.number(courierSuccessModal.totalCancelled) : 0}</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-blue-700/40 bg-blue-950/20 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs uppercase tracking-[0.12em] text-blue-300/90">Success Ratio</p>
                                        <p className="mono text-lg font-bold text-blue-200">{Number(courierSuccessModal.successRatio || 0).toFixed(2)}%</p>
                                    </div>
                                    <div className="mt-3 h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.max(0, Math.min(100, Number(courierSuccessModal.successRatio || 0)))}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/55 flex justify-end">
                            <button onClick={() => admin.closeCourierSuccessModal && admin.closeCourierSuccessModal()} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-sm transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {orderDetailsModal.open && (
                <div className="fixed inset-0 z-[108] bg-black/75 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget && admin.closeOrderDetails) admin.closeOrderDetails(); }}>
                    <div className="mx-auto mt-6 w-[96vw] max-w-6xl max-h-[92vh] overflow-y-auto custom-scrollbar rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold">Order Details</h3>
                                <p className="text-xs text-zinc-500 mt-1">{orderDetailsModal.order?.orderNumber || ''}</p>
                            </div>
                            <button onClick={() => admin.closeOrderDetails && admin.closeOrderDetails()} className="text-zinc-500 hover:text-zinc-300">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        {orderDetailsModal.loading && (
                            <div className="mt-6 text-sm text-zinc-400">Loading order details...</div>
                        )}

                        {!orderDetailsModal.loading && orderDetailsModal.order && (
                            <div className="mt-5 grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-5">
                                <section className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 p-3">
                                            <p className="text-[10px] uppercase text-zinc-500">Total</p>
                                            <p className="mono text-xl font-bold text-zinc-100 mt-1">{admin.currency ? admin.currency(orderDetailsModal.order?.total) : ''}</p>
                                        </div>
                                        <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 p-3">
                                            <p className="text-[10px] uppercase text-zinc-500">Subtotal</p>
                                            <p className="mono text-xl font-bold text-zinc-100 mt-1">{admin.currency ? admin.currency(orderDetailsModal.order?.subtotal) : ''}</p>
                                        </div>
                                        <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 p-3">
                                            <p className="text-[10px] uppercase text-zinc-500">Shipping</p>
                                            <p className="mono text-xl font-bold text-zinc-100 mt-1">{admin.currency ? admin.currency(orderDetailsModal.order?.shipping) : ''}</p>
                                        </div>
                                        <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 p-3">
                                            <p className="text-[10px] uppercase text-zinc-500">Created</p>
                                            <p className="mono text-[13px] text-zinc-200 mt-1">{admin.dateTime ? admin.dateTime(orderDetailsModal.order?.createdAt) : ''}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <h4 className="text-sm font-semibold">Order Items</h4>
                                            <span className="text-[11px] text-zinc-500">
                                                <span className="mono text-zinc-300">{admin.number ? admin.number((orderDetailsModal.order?.items || []).length) : 0}</span> item(s)
                                            </span>
                                        </div>

                                        <div className="space-y-2.5">
                                            {(orderDetailsModal.order?.items || []).map((item, itemIndex) => (
                                                <article key={item.productId || itemIndex} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-14 h-14 rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center">
                                                            {admin.orderItemImage && admin.orderItemImage(item) ? (
                                                                <img src={admin.orderItemImage(item)} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="mono text-sm text-zinc-500">{admin.orderItemInitial ? admin.orderItemInitial(item) : 'IT'}</span>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0 space-y-2">
                                                            <div>
                                                                <p className="font-semibold text-zinc-100 truncate">{item.titleSnapshot || 'Item'}</p>
                                                                <p className="mono text-[10px] text-zinc-500 truncate">{item.productId || '-'}</p>
                                                            </div>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                                                                <div className="rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-1.5">
                                                                    <p className="text-zinc-500 uppercase tracking-wider text-[10px]">Qty</p>
                                                                    <p className="mono mt-1">{admin.number ? admin.number(item.qty) : item.qty}</p>
                                                                </div>
                                                                <div className="rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-1.5">
                                                                    <p className="text-zinc-500 uppercase tracking-wider text-[10px]">Unit</p>
                                                                    <p className="mono mt-1">{admin.currency ? admin.currency(item.unitPrice) : item.unitPrice}</p>
                                                                </div>
                                                                <div className="rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-1.5">
                                                                    <p className="text-zinc-500 uppercase tracking-wider text-[10px]">Subtotal</p>
                                                                    <p className="mono mt-1">{admin.currency ? admin.currency(admin.orderItemSubtotal ? admin.orderItemSubtotal(item) : ((Number(item.qty) || 0) * (Number(item.unitPrice) || 0))) : ((Number(item.qty) || 0) * (Number(item.unitPrice) || 0))}</p>
                                                                </div>
                                                                <div className="rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-1.5">
                                                                    <p className="text-zinc-500 uppercase tracking-wider text-[10px]">Type</p>
                                                                    <p className="mt-1 text-zinc-300 capitalize">{item.type || 'fixed'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))}

                                            {!(orderDetailsModal.order?.items || []).length && (
                                                <div className="rounded-lg border border-dashed border-zinc-800 px-3 py-4 text-center text-xs text-zinc-500">
                                                    No order items.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                                        <h4 className="text-sm font-semibold">Status + Customer Note</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Payment</p>
                                                <select
                                                    value={orderDetailsModal.draft?.paymentStatus || 'unpaid'}
                                                    onChange={(e) => { if (admin.orderDetailsModal?.draft) admin.orderDetailsModal.draft.paymentStatus = e.target.value; }}
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none"
                                                >
                                                    <option value="unpaid">Unpaid</option>
                                                    <option value="collected">Collected</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Fulfillment</p>
                                                <select
                                                    value={orderDetailsModal.draft?.fulfillmentStatus || 'pending'}
                                                    onChange={(e) => { if (admin.orderDetailsModal?.draft) admin.orderDetailsModal.draft.fulfillmentStatus = e.target.value; }}
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Customer Note</p>
                                            <textarea
                                                value={orderDetailsModal.draft?.customerNote || ''}
                                                onChange={(e) => { if (admin.orderDetailsModal?.draft) admin.orderDetailsModal.draft.customerNote = e.target.value; }}
                                                rows="3"
                                                maxLength="1000"
                                                placeholder="Customer note..."
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none custom-scrollbar"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                                        <h4 className="text-sm font-semibold">Shipping Address</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <input
                                                value={orderDetailsModal.draft?.shippingAddress?.fullName || ''}
                                                onChange={(e) => { if (admin.orderDetailsModal?.draft?.shippingAddress) admin.orderDetailsModal.draft.shippingAddress.fullName = e.target.value; }}
                                                placeholder="Full name"
                                                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none"
                                            />
                                            <input
                                                value={orderDetailsModal.draft?.shippingAddress?.phone || ''}
                                                onChange={(e) => { if (admin.orderDetailsModal?.draft?.shippingAddress) admin.orderDetailsModal.draft.shippingAddress.phone = e.target.value; }}
                                                placeholder="Phone"
                                                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none"
                                            />
                                            <input
                                                value={orderDetailsModal.draft?.shippingAddress?.addressLine1 || ''}
                                                onChange={(e) => { if (admin.orderDetailsModal?.draft?.shippingAddress) admin.orderDetailsModal.draft.shippingAddress.addressLine1 = e.target.value; }}
                                                placeholder="Address line 1"
                                                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none md:col-span-2"
                                            />
                                            <input
                                                value={orderDetailsModal.draft?.shippingAddress?.addressLine2 || ''}
                                                onChange={(e) => { if (admin.orderDetailsModal?.draft?.shippingAddress) admin.orderDetailsModal.draft.shippingAddress.addressLine2 = e.target.value; }}
                                                placeholder="Address line 2"
                                                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none md:col-span-2"
                                            />
                                            <input
                                                value={orderDetailsModal.draft?.shippingAddress?.area || ''}
                                                onChange={(e) => { if (admin.orderDetailsModal?.draft?.shippingAddress) admin.orderDetailsModal.draft.shippingAddress.area = e.target.value; }}
                                                placeholder="Area"
                                                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none"
                                            />
                                            <input
                                                value={orderDetailsModal.draft?.shippingAddress?.city || ''}
                                                onChange={(e) => { if (admin.orderDetailsModal?.draft?.shippingAddress) admin.orderDetailsModal.draft.shippingAddress.city = e.target.value; }}
                                                placeholder="City"
                                                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none"
                                            />
                                            <input
                                                value={orderDetailsModal.draft?.shippingAddress?.postalCode || ''}
                                                onChange={(e) => { if (admin.orderDetailsModal?.draft?.shippingAddress) admin.orderDetailsModal.draft.shippingAddress.postalCode = e.target.value; }}
                                                placeholder="Postal code"
                                                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none"
                                            />
                                            <input
                                                value="BD" disabled
                                                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                            <button onClick={() => admin.closeOrderDetails && admin.closeOrderDetails()} className="px-4 py-2 rounded border border-zinc-700 bg-zinc-800 text-sm">Close</button>
                            <button
                                onClick={() => admin.saveOrderDetails && admin.saveOrderDetails()}
                                disabled={orderDetailsModal.saving || orderDetailsModal.loading}
                                className="px-4 py-2 rounded bg-blue-600 text-sm font-semibold disabled:opacity-60"
                            >
                                {orderDetailsModal.saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
