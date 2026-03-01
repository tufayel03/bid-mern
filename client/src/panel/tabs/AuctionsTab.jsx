import React from 'react';
import { useAdmin } from '../AdminContext';

export function AuctionsTab() {
    const admin = useAdmin();
    const { auctionFilters, localSettings, auctionCards = [] } = admin;

    const filtered = admin.filteredAuctionCards ? admin.filteredAuctionCards() : [];

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="admin-tab-header">
                <div>
                    <h2>Auction Management</h2>
                    <p>Edit schedule, monitor bids, and control auction lifecycle.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => admin.loadAuctions && admin.loadAuctions(true)} className="order-filter-btn">Reload</button>
                    <button onClick={() => admin.openAuctionCreate && admin.openAuctionCreate()} className="order-filter-btn primary">Create Auction</button>
                </div>
            </div>

            <div className="order-panel">
                <input
                    value={auctionFilters.search || ''}
                    onChange={(e) => { admin.auctionFilters.search = e.target.value; }}
                    type="text"
                    placeholder="Search title, slug, winner..."
                    className="admin-search-input"
                />
                <select
                    value={auctionFilters.status || ''}
                    onChange={(e) => { admin.auctionFilters.status = e.target.value; }}
                    className="order-filter-select"
                    style={{ flex: '0 1 auto' }}
                >
                    <option value="">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="ended">Ended</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="order-selection-meta">
                        Showing <span className="mono">{admin.number ? admin.number(filtered.length) : 0}</span>
                        {' / '}
                        <span className="mono">{admin.number ? admin.number(auctionCards.length) : 0}</span>
                    </div>
                    <div style={{ display: 'inline-flex', borderRadius: '8px', border: '1px solid rgba(61, 67, 84, 0.8)', overflow: 'hidden' }}>
                        <button
                            onClick={() => admin.setAuctionView && admin.setAuctionView('grid')}
                            style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 700, borderRight: '1px solid rgba(61, 67, 84, 0.8)', background: localSettings.auctionView === 'grid' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: localSettings.auctionView === 'grid' ? '#60a5fa' : '#8fa0be', cursor: 'pointer' }}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => admin.setAuctionView && admin.setAuctionView('column')}
                            style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 700, background: localSettings.auctionView === 'column' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: localSettings.auctionView === 'column' ? '#60a5fa' : '#8fa0be', cursor: 'pointer', border: 'none' }}
                        >
                            Column
                        </button>
                    </div>
                </div>
            </div>

            {localSettings.auctionView !== 'column' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                    {filtered.map((auction) => (
                        <div key={auction.id || auction.productId} className="admin-card no-pad" style={{ padding: '24px', position: 'relative', display: 'grid', gap: '16px' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#3b82f6' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', minWidth: 0 }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(63, 77, 103, 0.7)', background: '#101725', flexShrink: 0 }}>
                                        {admin.mediaUrl && admin.mediaUrl(auction.productImage) && (
                                            <img src={admin.mediaUrl(auction.productImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <h3 style={{ fontWeight: 800, fontSize: '15px', lineHeight: 1.2, margin: 0, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{auction.title}</h3>
                                        <p className="mono" style={{ fontSize: '11px', color: '#8fa0be', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{auction.productSlug || auction.productId}</p>
                                    </div>
                                </div>
                                <span className={`status-badge status-${admin.normalizeStatus ? admin.normalizeStatus(auction.status) : auction.status}`}>{auction.status}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px' }}>
                                <div style={{ borderRadius: '8px', border: '1px solid rgba(45, 51, 67, 0.9)', background: 'rgba(10, 13, 20, 0.6)', padding: '10px' }}>
                                    <p style={{ color: '#8fa0be', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', margin: 0, fontWeight: 700 }}>Current</p>
                                    <p className="mono" style={{ color: '#60a5fa', fontWeight: 800, marginTop: '6px', margin: '4px 0 0 0' }}>{admin.currency ? admin.currency(auction.currentPrice) : ''}</p>
                                </div>
                                <div style={{ borderRadius: '8px', border: '1px solid rgba(45, 51, 67, 0.9)', background: 'rgba(10, 13, 20, 0.6)', padding: '10px' }}>
                                    <p style={{ color: '#8fa0be', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', margin: 0, fontWeight: 700 }}>Starting</p>
                                    <p className="mono" style={{ marginTop: '6px', margin: '4px 0 0 0', color: '#dce0ea' }}>{admin.currency ? admin.currency(auction.startingPrice) : ''}</p>
                                </div>
                                <div style={{ borderRadius: '8px', border: '1px solid rgba(45, 51, 67, 0.9)', background: 'rgba(10, 13, 20, 0.6)', padding: '10px' }}>
                                    <p style={{ color: '#8fa0be', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', margin: 0, fontWeight: 700 }}>Reserve</p>
                                    <p className="mono" style={{ marginTop: '6px', margin: '4px 0 0 0', color: '#dce0ea' }}>{auction.reservePrice !== null ? (admin.currency ? admin.currency(auction.reservePrice) : '') : '-'}</p>
                                </div>
                                <div style={{ borderRadius: '8px', border: '1px solid rgba(45, 51, 67, 0.9)', background: 'rgba(10, 13, 20, 0.6)', padding: '10px' }}>
                                    <p style={{ color: '#8fa0be', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', margin: 0, fontWeight: 700 }}>Min Increment</p>
                                    <p className="mono" style={{ marginTop: '6px', margin: '4px 0 0 0', color: '#dce0ea' }}>{admin.currency ? admin.currency(auction.minIncrement) : ''}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#8fa0be' }}>Bids</span>
                                    <span className="mono" style={{ color: '#f8fafc' }}>{admin.number ? admin.number(auction.totalBids) : ''}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#8fa0be' }}>Highest Bidder</span>
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%', textAlign: 'right', color: '#e2e8f0' }} title={admin.auctionBidderLabel ? admin.auctionBidderLabel(auction.highestBid) : ''}>
                                        {admin.auctionBidderLabel ? admin.auctionBidderLabel(auction.highestBid) : ''}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#8fa0be' }}>Winner</span>
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%', textAlign: 'right', color: '#e2e8f0' }} title={admin.auctionBidderLabel ? admin.auctionBidderLabel(auction.winner) : ''}>
                                        {admin.auctionBidderLabel ? admin.auctionBidderLabel(auction.winner) : ''}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#8fa0be' }}>Start</span>
                                    <span className="mono" style={{ color: '#e2e8f0' }}>{admin.dateTime ? admin.dateTime(auction.startAt) : ''}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#8fa0be' }}>End</span>
                                    <span className="mono" style={{ color: '#e2e8f0' }}>{admin.dateTime ? admin.dateTime(auction.endAt) : ''}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#8fa0be' }}>Time Left</span>
                                    <span className="mono" style={{ color: '#f87171', fontWeight: 700 }}>{auction.timeLeftText}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                                <button onClick={() => admin.openAuctionDetails && admin.openAuctionDetails(auction)} className="order-filter-btn">Details</button>
                                <button onClick={() => admin.openAuctionDetails && admin.openAuctionDetails(auction)} className="order-filter-btn primary">Edit</button>
                                {auction.status !== 'ended' && auction.status !== 'cancelled' && (
                                    <button onClick={() => admin.updateAuctionStatusQuick && admin.updateAuctionStatusQuick(auction, 'ended')} className="order-filter-btn danger" style={{ background: 'linear-gradient(130deg, #d97706, #b45309)', borderColor: '#b45309' }}>End Now</button>
                                )}
                                {(auction.status === 'scheduled' || auction.status === 'live') && (
                                    <button onClick={() => admin.updateAuctionStatusQuick && admin.updateAuctionStatusQuick(auction, 'cancelled')} className="order-filter-btn danger">Cancel</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {localSettings.auctionView === 'column' && (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {filtered.map((auction) => (
                        <div key={'column-' + (auction.id || auction.productId)} className="admin-card no-pad" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', minWidth: '240px', flex: '1 1 300px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(63, 77, 103, 0.7)', background: '#101725', flexShrink: 0 }}>
                                    {admin.mediaUrl && admin.mediaUrl(auction.productImage) && (
                                        <img src={admin.mediaUrl(auction.productImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h3 style={{ fontWeight: 800, fontSize: '14px', lineHeight: 1.2, margin: 0, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{auction.title}</h3>
                                        <span className={`status-badge status-${admin.normalizeStatus ? admin.normalizeStatus(auction.status) : auction.status}`}>{auction.status}</span>
                                    </div>
                                    <p className="mono" style={{ fontSize: '11px', color: '#8fa0be', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{auction.productSlug || auction.productId}</p>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#8fa0be' }}>
                                        <span title={admin.auctionBidderLabel ? admin.auctionBidderLabel(auction.highestBid) : ''}>Highest: <span style={{ color: '#e2e8f0' }}>{admin.auctionBidderLabel ? admin.auctionBidderLabel(auction.highestBid) : ''}</span></span>
                                        <span title={admin.auctionBidderLabel ? admin.auctionBidderLabel(auction.winner) : ''}>Winner: <span style={{ color: '#e2e8f0' }}>{admin.auctionBidderLabel ? admin.auctionBidderLabel(auction.winner) : ''}</span></span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px', flex: '2 1 400px' }}>
                                <div style={{ borderRadius: '8px', border: '1px solid rgba(45, 51, 67, 0.9)', background: 'rgba(10, 13, 20, 0.6)', padding: '10px' }}>
                                    <p style={{ color: '#8fa0be', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', margin: 0, fontWeight: 700 }}>Current</p>
                                    <p className="mono" style={{ color: '#60a5fa', fontWeight: 800, marginTop: '6px', margin: '4px 0 0 0' }}>{admin.currency ? admin.currency(auction.currentPrice) : ''}</p>
                                </div>
                                <div style={{ borderRadius: '8px', border: '1px solid rgba(45, 51, 67, 0.9)', background: 'rgba(10, 13, 20, 0.6)', padding: '10px' }}>
                                    <p style={{ color: '#8fa0be', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', margin: 0, fontWeight: 700 }}>Start</p>
                                    <p className="mono" style={{ marginTop: '6px', margin: '4px 0 0 0', color: '#dce0ea' }}>{admin.currency ? admin.currency(auction.startingPrice) : ''}</p>
                                </div>
                                <div style={{ borderRadius: '8px', border: '1px solid rgba(45, 51, 67, 0.9)', background: 'rgba(10, 13, 20, 0.6)', padding: '10px' }}>
                                    <p style={{ color: '#8fa0be', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', margin: 0, fontWeight: 700 }}>Reserve</p>
                                    <p className="mono" style={{ marginTop: '6px', margin: '4px 0 0 0', color: '#dce0ea' }}>{auction.reservePrice !== null ? (admin.currency ? admin.currency(auction.reservePrice) : '') : '-'}</p>
                                </div>
                                <div style={{ borderRadius: '8px', border: '1px solid rgba(45, 51, 67, 0.9)', background: 'rgba(10, 13, 20, 0.6)', padding: '10px' }}>
                                    <p style={{ color: '#8fa0be', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', margin: 0, fontWeight: 700 }}>Bids</p>
                                    <p className="mono" style={{ marginTop: '6px', margin: '4px 0 0 0', color: '#dce0ea' }}>{admin.number ? admin.number(auction.totalBids) : ''}</p>
                                </div>
                                <div style={{ borderRadius: '8px', border: '1px solid rgba(45, 51, 67, 0.9)', background: 'rgba(10, 13, 20, 0.6)', padding: '10px' }}>
                                    <p style={{ color: '#8fa0be', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', margin: 0, fontWeight: 700 }}>Increment</p>
                                    <p className="mono" style={{ marginTop: '6px', margin: '4px 0 0 0', color: '#dce0ea' }}>{admin.currency ? admin.currency(auction.minIncrement) : ''}</p>
                                </div>
                                <div style={{ borderRadius: '8px', border: '1px solid rgba(45, 51, 67, 0.9)', background: 'rgba(10, 13, 20, 0.6)', padding: '10px' }}>
                                    <p style={{ color: '#8fa0be', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', margin: 0, fontWeight: 700 }}>Time Left</p>
                                    <p className="mono" style={{ color: '#f87171', fontWeight: 700, marginTop: '6px', margin: '4px 0 0 0' }}>{auction.timeLeftText}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px', flex: '0 1 180px' }}>
                                <button onClick={() => admin.openAuctionDetails && admin.openAuctionDetails(auction)} className="order-filter-btn">Details</button>
                                <button onClick={() => admin.openAuctionDetails && admin.openAuctionDetails(auction)} className="order-filter-btn primary">Edit</button>
                                {auction.status !== 'ended' && auction.status !== 'cancelled' && (
                                    <button onClick={() => admin.updateAuctionStatusQuick && admin.updateAuctionStatusQuick(auction, 'ended')} className="order-filter-btn danger" style={{ background: 'linear-gradient(130deg, #d97706, #b45309)', borderColor: '#b45309' }}>End Now</button>
                                )}
                                {(auction.status === 'scheduled' || auction.status === 'live') && (
                                    <button onClick={() => admin.updateAuctionStatusQuick && admin.updateAuctionStatusQuick(auction, 'cancelled')} className="order-filter-btn danger">Cancel</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {auctionCards.length > 0 && filtered.length === 0 && <div style={{ color: '#8fa0be', fontSize: '14px' }}>No auctions match current filters.</div>}
            {auctionCards.length === 0 && <div style={{ color: '#8fa0be', fontSize: '14px' }}>No auction data found.</div>}
        </div>
    );
}
