import React from 'react';
import { useAdmin } from '../AdminContext';

export function ProductFormTab() {
    const admin = useAdmin();
    const { productModal = {}, productMediaPicker = {} } = admin;

    const getProductGalleryMediaList = () => {
        return admin.getProductGalleryMediaList ? admin.getProductGalleryMediaList() : [];
    };

    const filteredProductMediaAssets = () => {
        try {
            const assets = admin.filteredProductMediaAssets ? admin.filteredProductMediaAssets() : (admin.mediaAssets || []);
            return Array.isArray(assets) ? assets : [];
        } catch (err) {
            console.warn("Failed to get filtered assets:", err);
            return [];
        }
    };

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="admin-tab-header">
                <div>
                    <h2>{productModal.mode === 'create' ? 'Terminal: NEW_ENTRY' : `Modify: ${productModal.form?.sku || 'ASSET'}`}</h2>
                    <p>Initialize neural uplink to synchronize product architecture and distributed media assets.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => admin.closeProductModal && admin.closeProductModal()}
                        className="order-filter-btn"
                    >
                        Abort Process
                    </button>
                    <button
                        onClick={() => admin.saveProductModal && admin.saveProductModal()}
                        className="order-filter-btn primary"
                        disabled={productModal.saving}
                    >
                        {productModal.saving ? 'Syncing...' : 'Execute Sync'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
                {/* Left Column: Core Data */}
                <div style={{ flex: '1 1 600px', display: 'grid', gap: '24px' }}>
                    {/* Primary Block */}
                    <div className="admin-card" style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Asset Overview</h3>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8fa0be', fontWeight: 700 }}>Core Identification & Pricing</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="settings-label">Product Title</label>
                                <input
                                    value={productModal.form?.title || ''}
                                    onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.title = e.target.value; }}
                                    placeholder="Enter product name..."
                                    className="admin-search-input"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="settings-label">URL Slug</label>
                                <input
                                    value={productModal.form?.slug || ''}
                                    onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.slug = e.target.value; }}
                                    placeholder="auto-generated-slug"
                                    className="admin-search-input"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="settings-label">Listing Price (BDT)</label>
                                <input
                                    type="number" min="0" placeholder="0.00"
                                    value={productModal.form?.price || ''}
                                    onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.price = e.target.value; }}
                                    className="admin-search-input"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="settings-label">SKU / Identifier</label>
                                <input
                                    value={productModal.form?.sku || ''}
                                    onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.sku = e.target.value; }}
                                    placeholder="HW-XXX-000"
                                    className="admin-search-input"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="settings-label">Stock</label>
                                <input
                                    type="number" min="0" placeholder="0"
                                    value={productModal.form?.stock || ''}
                                    onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.stock = e.target.value; }}
                                    className="admin-search-input"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="settings-label">Series / Set</label>
                                <input
                                    value={productModal.form?.series || ''}
                                    onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.series = e.target.value; }}
                                    placeholder="Ex: Track Stars"
                                    className="admin-search-input"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description Area */}
                    <div className="admin-card" style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Product Description</h3>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8fa0be', fontWeight: 700 }}>Markdown Supported</span>
                        </div>
                        <textarea
                            value={productModal.form?.description || ''}
                            onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.description = e.target.value; }}
                            placeholder="Enter detailed product specifications, history, and features here..."
                            className="settings-textarea admin-search-input"
                            style={{ width: '100%' }}
                        ></textarea>
                        <div style={{ textAlign: 'right', fontSize: '11px', color: '#8fa0be' }}>
                            Length: {(productModal.form?.description || '').length} chars
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Logic */}
                <div style={{ flex: '1 1 300px', display: 'grid', gap: '24px', alignContent: 'start' }}>
                    {/* Catalog Logic Card */}
                    <div className="admin-card" style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Sales Configuration</h3>
                        </div>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div>
                                <label className="settings-label">Item Condition</label>
                                <select
                                    value={productModal.form?.condition || 'carded'}
                                    onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.condition = e.target.value; }}
                                    className="order-filter-select"
                                    style={{ width: '100%' }}
                                >
                                    <option value="carded">Carded / Mint in Box</option>
                                    <option value="loose">Loose / Out of Box</option>
                                </select>
                            </div>

                            <div>
                                <label className="settings-label">Listing Type</label>
                                <select
                                    value={productModal.form?.saleMode || 'fixed'}
                                    onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.saleMode = e.target.value; }}
                                    className="order-filter-select"
                                    style={{ width: '100%' }}
                                >
                                    <option value="fixed">Fixed Price Sale</option>
                                    <option value="auction">Live Auction</option>
                                    <option value="hybrid">Auction + Buy It Now</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#8fa0be', cursor: 'pointer', fontWeight: 700 }}>
                                    <input
                                        type="checkbox"
                                        checked={!!productModal.form?.isFeatured}
                                        onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.isFeatured = e.target.checked; }}
                                        className="order-check"
                                    />
                                    Featured Item
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#8fa0be', cursor: 'pointer', fontWeight: 700 }}>
                                    <input
                                        type="checkbox"
                                        checked={!!productModal.form?.isNewDrop}
                                        onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.isNewDrop = e.target.checked; }}
                                        className="order-check"
                                    />
                                    New Drop
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Auction HUD (Conditional) */}
                    {productModal.form?.saleMode !== 'fixed' && (
                        <div className="admin-card" style={{ display: 'grid', gap: '16px', borderColor: 'rgba(249, 115, 22, 0.4)', boxShadow: '0 0 15px rgba(249,115,22,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#fba94c' }}>Auction Parameters</h3>
                            </div>

                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div>
                                    <label className="settings-label">Start Date/Time</label>
                                    <input
                                        type="datetime-local"
                                        value={productModal.form?.auctionStartAt || ''}
                                        onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.auctionStartAt = e.target.value; }}
                                        className="admin-search-input inverted-datetime-color"
                                        style={{ width: '100%', borderColor: 'rgba(249, 115, 22, 0.3)' }}
                                    />
                                </div>
                                <div>
                                    <label className="settings-label">End Date/Time</label>
                                    <input
                                        type="datetime-local"
                                        value={productModal.form?.auctionEndAt || ''}
                                        onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.auctionEndAt = e.target.value; }}
                                        className="admin-search-input inverted-datetime-color"
                                        style={{ width: '100%', borderColor: 'rgba(249, 115, 22, 0.3)' }}
                                    />
                                </div>
                                <div>
                                    <label className="settings-label">Starting Bid</label>
                                    <input
                                        type="number" min="0" placeholder="0.00"
                                        value={productModal.form?.auctionStartingPrice || ''}
                                        onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.auctionStartingPrice = e.target.value; }}
                                        className="admin-search-input"
                                        style={{ width: '100%', borderColor: 'rgba(249, 115, 22, 0.3)' }}
                                    />
                                </div>
                                <div>
                                    <label className="settings-label">Minimum Increment</label>
                                    <input
                                        type="number" min="1" placeholder="10.00"
                                        value={productModal.form?.auctionMinIncrement || ''}
                                        onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.auctionMinIncrement = e.target.value; }}
                                        className="admin-search-input"
                                        style={{ width: '100%', borderColor: 'rgba(249, 115, 22, 0.3)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Imagery */}
            <div className="admin-card" style={{ display: 'grid', gap: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Product Imagery</h3>
                        <p style={{ margin: '4px 0 0 0', color: '#8fa0be', fontSize: '13px' }}>Connect visual assets to the product node</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={() => admin.openProductMediaPicker && admin.openProductMediaPicker()} className="order-filter-btn primary">
                            Open Media Vault
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    {/* Primary Target Slot */}
                    <div style={{ display: 'grid', gap: '12px', alignContent: 'start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label className="settings-label" style={{ margin: 0 }}>Primary Cover</label>
                        </div>
                        <div style={{ aspectRatio: '3/4', maxWidth: '300px', borderRadius: '8px', border: '1px dashed rgba(61, 67, 84, 0.8)', background: 'rgba(10, 13, 20, 0.6)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {productModal.form?.primaryImage ? (
                                <>
                                    <img src={admin.mediaUrl ? admin.mediaUrl(productModal.form.primaryImage) : productModal.form.primaryImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '12px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', display: 'flex', gap: '8px' }}>
                                        <button type="button" onClick={() => admin.openProductMediaPicker()} className="order-filter-btn primary" style={{ flex: 1, padding: '6px 12px' }}>Update</button>
                                        <button type="button" onClick={() => admin.clearProductPrimaryMedia()} className="order-filter-btn danger" style={{ padding: '6px 12px' }}>Remove</button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#8fa0be' }}>
                                    <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, margin: 0 }}>Select Visual</p>
                                    <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>Slot Empty</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sub-Asset Grid */}
                    <div style={{ display: 'grid', gap: '12px', gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label className="settings-label" style={{ margin: 0 }}>Gallery Images ({getProductGalleryMediaList().length}/8)</label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                            {getProductGalleryMediaList().map((url, idx) => (
                                <div key={url + idx} style={{ aspectRatio: '1', borderRadius: '8px', border: '1px solid rgba(61, 67, 84, 0.8)', background: 'rgba(10, 13, 20, 0.6)', position: 'relative', overflow: 'hidden' }}>
                                    <img src={admin.mediaUrl ? admin.mediaUrl(url) : url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button type="button" onClick={() => admin.removeProductGalleryMedia && admin.removeProductGalleryMedia(url)} className="order-filter-btn danger" style={{ position: 'absolute', top: '4px', right: '4px', padding: '4px 8px', fontSize: '10px', minWidth: 'auto' }}>Del</button>
                                </div>
                            ))}

                            {getProductGalleryMediaList().length < 8 && (
                                <button
                                    type="button"
                                    onClick={() => admin.openProductMediaPicker()}
                                    style={{ aspectRatio: '1', borderRadius: '8px', border: '1px dashed rgba(61, 67, 84, 0.8)', background: 'rgba(10, 13, 20, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8fa0be' }}
                                >
                                    <span style={{ fontSize: '24px' }}>+</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Immersive HUD Media Picker (Digital Vault) */}
            {productMediaPicker.open && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal" style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="admin-modal-head">
                            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px', fontWeight: 800 }}>Media Vault</h3>
                            <button type="button" onClick={() => admin.closeProductMediaPicker()} className="order-filter-btn">Close</button>
                        </div>

                        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-strong)', display: 'flex', gap: '12px' }}>
                            <input
                                value={productMediaPicker.search || ''}
                                onChange={(e) => { if (admin.productMediaPicker) admin.productMediaPicker.search = e.target.value; }}
                                placeholder="Search by filename or tag..."
                                className="admin-search-input"
                            />
                            <button type="button" onClick={() => admin.refreshProductMediaPicker()} className="order-filter-btn primary">
                                {productMediaPicker.loading ? 'Syncing...' : 'Refresh'}
                            </button>
                        </div>

                        <div className="admin-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                                {filteredProductMediaAssets().map((asset, i) => {
                                    if (!asset) return null;
                                    const assetId = asset.id || asset._id || `asset-${i}`;
                                    const assetName = asset.fileName || asset.name || 'Untitled';

                                    return (
                                        <div key={assetId} className="admin-card" style={{ padding: '12px', display: 'grid', gap: '12px' }}>
                                            <div style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', background: 'rgba(10, 13, 20, 0.6)' }}>
                                                <img
                                                    src={admin.mediaPreviewUrl ? admin.mediaPreviewUrl(asset) : ''}
                                                    alt={assetName}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: '11px', color: '#f8fafc', fontWeight: 700, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={assetName}>
                                                    {assetName}
                                                </p>
                                                <p className="mono" style={{ fontSize: '9px', color: '#8fa0be', margin: 0 }}>ID: {String(assetId).slice(-8)}</p>
                                            </div>
                                            <div style={{ display: 'grid', gap: '8px' }}>
                                                <button type="button" onClick={() => admin.setProductPrimaryMedia && admin.setProductPrimaryMedia(asset)} className="order-filter-btn primary" style={{ padding: '6px', fontSize: '10px' }}>
                                                    Set Primary
                                                </button>
                                                <button type="button" onClick={() => admin.toggleProductGalleryMedia && admin.toggleProductGalleryMedia(asset)} className="order-filter-btn" style={{ padding: '6px', fontSize: '10px' }}>
                                                    {admin.hasProductGalleryMedia && admin.hasProductGalleryMedia(asset) ? '- Gallery' : '+ Gallery'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {filteredProductMediaAssets().length === 0 && (
                                <div style={{ textAlign: 'center', color: '#8fa0be', padding: '40px' }}>
                                    No media assets found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
