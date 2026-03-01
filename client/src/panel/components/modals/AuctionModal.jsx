import React from 'react';
import { useAdmin } from '../../AdminContext';
import { Icon } from '../Icon';

export function AuctionModal() {
    const admin = useAdmin();
    const { auctionModal = {}, auctionDetailsModal = {}, inventory = [] } = admin;

    return (
        <>
            {/* Create Auction Modal */}
            {auctionModal.open && (
                <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && admin.closeAuctionModal) admin.closeAuctionModal(); }}>
                    <div className="admin-modal" style={{ maxWidth: '600px' }}>
                        <div className="admin-modal-head">
                            <h3 className="font-bold text-xl uppercase text-[var(--secondary)] flex items-center gap-3">
                                <Icon name="gavel" className="w-5 h-5" />
                                Create Auction
                            </h3>
                            <button onClick={() => admin.closeAuctionModal && admin.closeAuctionModal()} className="icon-btn">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="admin-modal-body space-y-4">
                            <select
                                value={auctionModal.form?.productId || ''}
                                onChange={(e) => { if (admin.auctionModal && admin.auctionModal.form) admin.auctionModal.form.productId = e.target.value; }}
                                className="w-full bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                            >
                                <option value="">Select product</option>
                                {inventory.filter(p => p.mode !== 'Fixed').map(item => (
                                    <option key={item.sku || item.id} value={item.id}>{item.title}</option>
                                ))}
                            </select>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="datetime-local"
                                    value={auctionModal.form?.startAt || ''}
                                    onChange={(e) => { if (admin.auctionModal && admin.auctionModal.form) admin.auctionModal.form.startAt = e.target.value; }}
                                    className="bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                                />
                                <input
                                    type="datetime-local"
                                    value={auctionModal.form?.endAt || ''}
                                    onChange={(e) => { if (admin.auctionModal && admin.auctionModal.form) admin.auctionModal.form.endAt = e.target.value; }}
                                    className="bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <input
                                    type="number" min="0" placeholder="Starting"
                                    value={auctionModal.form?.startingPrice || ''}
                                    onChange={(e) => { if (admin.auctionModal && admin.auctionModal.form) admin.auctionModal.form.startingPrice = e.target.value; }}
                                    className="bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                                />
                                <input
                                    type="number" min="0" placeholder="Reserve"
                                    value={auctionModal.form?.reservePrice || ''}
                                    onChange={(e) => { if (admin.auctionModal && admin.auctionModal.form) admin.auctionModal.form.reservePrice = e.target.value; }}
                                    className="bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                                />
                                <input
                                    type="number" min="1" placeholder="Min Increment"
                                    value={auctionModal.form?.minIncrement || ''}
                                    onChange={(e) => { if (admin.auctionModal && admin.auctionModal.form) admin.auctionModal.form.minIncrement = e.target.value; }}
                                    className="bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="admin-modal-foot">
                            <button onClick={() => admin.closeAuctionModal && admin.closeAuctionModal()} className="secondary-btn">Cancel</button>
                            <button onClick={() => admin.saveAuctionModal && admin.saveAuctionModal()} className="primary-btn">
                                {auctionModal.saving ? 'INITIATING OP...' : 'CREATE AUCTION'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Auction Details Modal */}
            {auctionDetailsModal.open && (
                <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && admin.closeAuctionDetails) admin.closeAuctionDetails(); }}>
                    <div className="admin-modal">
                        <div className="admin-modal-head">
                            <div>
                                <h3 className="font-bold text-xl uppercase text-[var(--secondary)] flex items-center gap-3">
                                    <Icon name="activity" className="w-5 h-5" />
                                    Auction Details
                                </h3>
                                <p className="text-xs text-zinc-400 mt-1">Inspect bid history and manage this auction lifecycle.</p>
                            </div>
                            <button onClick={() => admin.closeAuctionDetails && admin.closeAuctionDetails()} className="icon-btn">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="admin-modal-body space-y-5">
                            {auctionDetailsModal.loading && <div className="text-sm text-zinc-500">Loading auction details...</div>}

                            {!auctionDetailsModal.loading && auctionDetailsModal.detail && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        <div className="admin-inset-card space-y-3">
                                            <div className="flex justify-between items-start gap-3">
                                                <div>
                                                    <h4 className="font-bold text-base">{auctionDetailsModal.detail.product?.title || 'Untitled'}</h4>
                                                    <p className="text-[11px] text-zinc-500 mono">{auctionDetailsModal.detail.product?.slug || auctionDetailsModal.detail.productId}</p>
                                                </div>
                                                <span className={`status-badge status-${admin.normalizeStatus ? admin.normalizeStatus(auctionDetailsModal.detail.status) : auctionDetailsModal.detail.status}`}>
                                                    {auctionDetailsModal.detail.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
                                                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Current</p>
                                                    <p className="mono font-bold text-blue-400 mt-1">{admin.currency ? admin.currency(auctionDetailsModal.detail.currentPrice) : ''}</p>
                                                </div>
                                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
                                                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Starting</p>
                                                    <p className="mono mt-1">{admin.currency ? admin.currency(auctionDetailsModal.detail.startingPrice) : ''}</p>
                                                </div>
                                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
                                                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Reserve</p>
                                                    <p className="mono mt-1">{auctionDetailsModal.detail.reservePrice !== undefined && auctionDetailsModal.detail.reservePrice !== null ? (admin.currency ? admin.currency(auctionDetailsModal.detail.reservePrice) : '') : '-'}</p>
                                                </div>
                                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
                                                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Min Increment</p>
                                                    <p className="mono mt-1">{admin.currency ? admin.currency(auctionDetailsModal.detail.minIncrement) : ''}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">Total Bids</span>
                                                    <span className="mono">{admin.number ? admin.number(auctionDetailsModal.detail.totalBids) : ''}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">Highest Bidder</span>
                                                    <span className="truncate max-w-[65%] text-right" title={admin.auctionBidderLabel ? admin.auctionBidderLabel(auctionDetailsModal.detail.highestBid) : ''}>
                                                        {admin.auctionBidderLabel ? admin.auctionBidderLabel(auctionDetailsModal.detail.highestBid) : ''}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">Winner</span>
                                                    <span className="truncate max-w-[65%] text-right" title={admin.auctionBidderLabel ? admin.auctionBidderLabel(auctionDetailsModal.detail.winner) : ''}>
                                                        {admin.auctionBidderLabel ? admin.auctionBidderLabel(auctionDetailsModal.detail.winner) : ''}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">Start At</span>
                                                    <span className="mono">{admin.dateTime ? admin.dateTime(auctionDetailsModal.detail.startAt) : ''}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">End At</span>
                                                    <span className="mono">{admin.dateTime ? admin.dateTime(auctionDetailsModal.detail.endAt) : ''}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">Time Left</span>
                                                    <span className="mono text-red-400">{admin.msToClock ? admin.msToClock(auctionDetailsModal.detail.timeLeftMs || 0) : ''}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="admin-inset-card space-y-3">
                                            <h4 className="font-bold text-base">Edit Auction</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Status</label>
                                                    <select
                                                        value={auctionDetailsModal.draft?.status || 'scheduled'}
                                                        onChange={(e) => { if (admin.auctionDetailsModal?.draft) admin.auctionDetailsModal.draft.status = e.target.value; }}
                                                        className="w-full bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                                                    >
                                                        <option value="scheduled">scheduled</option>
                                                        <option value="live">live</option>
                                                        <option value="ended">ended</option>
                                                        <option value="cancelled">cancelled</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Min Increment</label>
                                                    <input
                                                        type="number" min="1"
                                                        value={auctionDetailsModal.draft?.minIncrement || ''}
                                                        onChange={(e) => { if (admin.auctionDetailsModal?.draft) admin.auctionDetailsModal.draft.minIncrement = e.target.value; }}
                                                        className="w-full bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Start At</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={auctionDetailsModal.draft?.startAt || ''}
                                                        onChange={(e) => { if (admin.auctionDetailsModal?.draft) admin.auctionDetailsModal.draft.startAt = e.target.value; }}
                                                        className="w-full bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">End At</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={auctionDetailsModal.draft?.endAt || ''}
                                                        onChange={(e) => { if (admin.auctionDetailsModal?.draft) admin.auctionDetailsModal.draft.endAt = e.target.value; }}
                                                        className="w-full bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Starting Price</label>
                                                    <input
                                                        type="number" min="0"
                                                        value={auctionDetailsModal.draft?.startingPrice || ''}
                                                        onChange={(e) => { if (admin.auctionDetailsModal?.draft) admin.auctionDetailsModal.draft.startingPrice = e.target.value; }}
                                                        className="w-full bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Reserve Price</label>
                                                    <input
                                                        type="number" min="0" placeholder="leave empty to remove"
                                                        value={auctionDetailsModal.draft?.reservePrice || ''}
                                                        onChange={(e) => { if (admin.auctionDetailsModal?.draft) admin.auctionDetailsModal.draft.reservePrice = e.target.value; }}
                                                        className="w-full bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-zinc-500">Note: some fields may be locked by server rules once bids are placed.</p>
                                        </div>
                                    </div>

                                    <div className="admin-inset-card overflow-hidden !p-0">
                                        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                                            <h4 className="font-bold text-sm">Bid Timeline</h4>
                                            <span className="text-xs text-zinc-500">
                                                <span className="mono text-zinc-200">{admin.number ? admin.number((auctionDetailsModal.detail.bids || []).length) : 0}</span> bids shown
                                            </span>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-zinc-900/60 text-zinc-500 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3 w-12">#</th>
                                                        <th className="px-4 py-3">Bidder</th>
                                                        <th className="px-4 py-3">Amount</th>
                                                        <th className="px-4 py-3">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800">
                                                    {(auctionDetailsModal.detail.bids || []).map((bid, bidIndex) => (
                                                        <tr key={bid.id || bidIndex} className="hover:bg-zinc-800/30 text-xs">
                                                            <td className="px-4 py-3 mono">{bidIndex + 1}</td>
                                                            <td className="px-4 py-3">
                                                                <p className="truncate" title={admin.auctionBidderLabel ? admin.auctionBidderLabel(bid) : ''}>
                                                                    {admin.auctionBidderLabel ? admin.auctionBidderLabel(bid) : ''}
                                                                </p>
                                                            </td>
                                                            <td className="px-4 py-3 mono font-bold text-blue-400">{admin.currency ? admin.currency(bid.amount) : ''}</td>
                                                            <td className="px-4 py-3 mono text-zinc-400">{admin.dateTime ? admin.dateTime(bid.createdAt) : ''}</td>
                                                        </tr>
                                                    ))}
                                                    {!(auctionDetailsModal.detail.bids || []).length && (
                                                        <tr>
                                                            <td colSpan="4" className="px-4 py-3 text-xs text-zinc-500 text-center">No bids yet.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="admin-modal-foot">
                            <button onClick={() => admin.refreshAuctionDetails && admin.refreshAuctionDetails()} className="secondary-btn">
                                {auctionDetailsModal.loading ? '...' : 'Refresh'}
                            </button>
                            <button onClick={() => admin.closeAuctionDetails && admin.closeAuctionDetails()} className="secondary-btn">Close</button>
                            <button
                                onClick={() => admin.saveAuctionDetails && admin.saveAuctionDetails()}
                                disabled={auctionDetailsModal.loading || auctionDetailsModal.saving}
                                className="primary-btn disabled:opacity-50"
                            >
                                {auctionDetailsModal.saving ? 'SAVING OP...' : 'SAVE CHANGES'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
