import React from 'react';
import { useAdmin } from '../../AdminContext';
import { Icon } from '../Icon';

export function ProductModal() {
    const admin = useAdmin();
    const { productModal = {}, productMediaPicker = {} } = admin;

    const getProductGalleryMediaList = () => {
        return admin.getProductGalleryMediaList ? admin.getProductGalleryMediaList() : [];
    };

    const filteredProductMediaAssets = () => {
        return admin.filteredProductMediaAssets ? admin.filteredProductMediaAssets() : [];
    };

    return (
        <>
            {/* Product Create/Edit Modal */}
            {productModal.open && (
                <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && admin.closeProductModal) admin.closeProductModal(); }}>
                    <div className="admin-modal">
                        <div className="admin-modal-head">
                            <div>
                                <h3 className="font-bold text-2xl uppercase text-[var(--secondary)] flex items-center gap-3">
                                    <Icon name="box" className="w-6 h-6" />
                                    {productModal.mode === 'create' ? 'Create Product' : 'Edit Product'}
                                </h3>
                                <p className="text-sm text-zinc-400 mt-1">Fill in product info, media, and optional auction setup in one place.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="status-badge status-live">{productModal.mode === 'create' ? 'NEW ENTRY' : 'EDITING'}</span>
                                <button onClick={() => admin.closeProductModal && admin.closeProductModal()} className="icon-btn">
                                    <Icon name="x" className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="admin-modal-body space-y-5">
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                                <div className="xl:col-span-2 admin-inset-card space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">Core Product Details</h4>
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Required fields first</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Title</p>
                                            <input
                                                value={productModal.form?.title || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.title = e.target.value; }}
                                                placeholder="Product title"
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Slug</p>
                                            <input
                                                value={productModal.form?.slug || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.slug = e.target.value; }}
                                                placeholder="optional-slug"
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm mono focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Price (BDT)</p>
                                            <input
                                                type="number" min="0" placeholder="0"
                                                value={productModal.form?.price || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.price = e.target.value; }}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">SKU</p>
                                            <input
                                                value={productModal.form?.sku || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.sku = e.target.value; }}
                                                placeholder="SKU code"
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm mono focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Stock</p>
                                            <input
                                                type="number" min="0" placeholder="0"
                                                value={productModal.form?.stock || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.stock = e.target.value; }}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Series</p>
                                            <input
                                                value={productModal.form?.series || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.series = e.target.value; }}
                                                placeholder="Series / Collection"
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-inset-card space-y-4">
                                    <h4 className="text-sm font-semibold">Catalog Setup</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Condition</p>
                                            <select
                                                value={productModal.form?.condition || 'carded'}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.condition = e.target.value; }}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            >
                                                <option value="carded">carded</option>
                                                <option value="loose">loose</option>
                                            </select>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Sale Mode</p>
                                            <select
                                                value={productModal.form?.saleMode || 'fixed'}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.saleMode = e.target.value; }}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            >
                                                <option value="fixed">fixed</option>
                                                <option value="auction">auction</option>
                                                <option value="hybrid">hybrid</option>
                                            </select>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Tags</p>
                                            <input
                                                value={productModal.form?.tags || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.tags = e.target.value; }}
                                                placeholder="comma,separated,tags"
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!productModal.form?.isFeatured}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.isFeatured = e.target.checked; }}
                                            />
                                            Featured
                                        </label>
                                        <label className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!productModal.form?.isNewDrop}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.isNewDrop = e.target.checked; }}
                                            />
                                            New Drop
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {productModal.form?.saleMode !== 'fixed' && (
                                <div className="rounded-xl border border-blue-900/50 bg-blue-950/10 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-blue-200">Auction Setup</p>
                                            <p className="text-[11px] text-zinc-400">Schedule, floor, reserve, and minimum increment for this product.</p>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider text-blue-300">Auction enabled</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Start At</p>
                                            <input
                                                type="datetime-local"
                                                value={productModal.form?.auctionStartAt || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.auctionStartAt = e.target.value; }}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">End At</p>
                                            <input
                                                type="datetime-local"
                                                value={productModal.form?.auctionEndAt || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.auctionEndAt = e.target.value; }}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Starting Price</p>
                                            <input
                                                type="number" min="0" placeholder="0"
                                                value={productModal.form?.auctionStartingPrice || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.auctionStartingPrice = e.target.value; }}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Reserve Price</p>
                                            <input
                                                type="number" min="0" placeholder="optional"
                                                value={productModal.form?.auctionReservePrice || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.auctionReservePrice = e.target.value; }}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Minimum Increment</p>
                                            <input
                                                type="number" min="1" placeholder="1"
                                                value={productModal.form?.auctionMinIncrement || ''}
                                                onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.auctionMinIncrement = e.target.value; }}
                                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="admin-inset-card space-y-3 relative">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold">Product Images</p>
                                        <p className="text-[11px] text-zinc-500">Upload in Media tab, then select primary and gallery images.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => admin.openProductMediaPicker && admin.openProductMediaPicker()} type="button" className="secondary-btn !py-1 !text-[11px]">Choose From Media</button>
                                        <button onClick={() => admin.refreshProductMediaPicker && admin.refreshProductMediaPicker()} type="button" className="secondary-btn !py-1 !text-[11px]">Reload</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Primary Image</p>
                                        <div className="h-40 sm:h-44 md:h-48 rounded border border-zinc-800 bg-zinc-950/60 overflow-hidden flex items-center justify-center">
                                            {productModal.form?.primaryImage ? (
                                                <img src={admin.mediaUrl ? admin.mediaUrl(productModal.form.primaryImage) : productModal.form.primaryImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[11px] text-zinc-500">No image selected</span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <button onClick={() => admin.openProductMediaPicker && admin.openProductMediaPicker()} type="button" className="secondary-btn flex-1 !py-1.5 !text-[10px]">Select</button>
                                            <button onClick={() => admin.clearProductPrimaryMedia && admin.clearProductPrimaryMedia()} type="button" className="secondary-btn !py-1.5 !text-[10px]">Clear</button>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Gallery Images</p>
                                        <div className="min-h-[152px] max-h-[230px] overflow-y-auto custom-scrollbar space-y-2">
                                            {getProductGalleryMediaList().map(url => (
                                                <div key={url} className="flex items-center gap-2 p-1.5 rounded border border-zinc-800 bg-zinc-900/60">
                                                    <img src={admin.mediaUrl ? admin.mediaUrl(url) : url} alt="" className="w-8 h-8 rounded object-cover border border-zinc-700" />
                                                    <p className="text-[10px] mono text-[var(--primary)] break-all flex-1">{url}</p>
                                                    <button onClick={() => admin.removeProductGalleryMedia && admin.removeProductGalleryMedia(url)} type="button" className="secondary-btn !py-1 !px-2 !text-[9px]">Remove</button>
                                                </div>
                                            ))}
                                            {getProductGalleryMediaList().length === 0 && (
                                                <p className="text-[11px] text-zinc-500">No gallery images selected.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {productMediaPicker.open && (
                                    <div className="absolute top-14 left-4 right-4 z-10 rounded-lg border border-zinc-700 bg-zinc-900 p-4 shadow-xl space-y-3">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <input
                                                value={productMediaPicker.search || ''}
                                                onChange={(e) => { if (admin.productMediaPicker) admin.productMediaPicker.search = e.target.value; }}
                                                placeholder="Search media by filename..."
                                                className="flex-1 min-w-[220px] bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none"
                                            />
                                            <button onClick={() => admin.refreshProductMediaPicker && admin.refreshProductMediaPicker()} type="button" className="secondary-btn !py-2 !text-xs">
                                                {productMediaPicker.loading ? 'Loading...' : 'Refresh'}
                                            </button>
                                            <button onClick={() => admin.closeProductMediaPicker && admin.closeProductMediaPicker()} type="button" className="secondary-btn !py-2 !text-xs">Close</button>
                                        </div>
                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto custom-scrollbar">
                                            {filteredProductMediaAssets().map(asset => (
                                                <div key={asset.id} className="rounded border border-zinc-800 bg-zinc-900/70 p-1.5 space-y-1.5">
                                                    <div className="aspect-square rounded border border-zinc-800 overflow-hidden bg-zinc-950/60">
                                                        <img src={admin.mediaPreviewUrl ? admin.mediaPreviewUrl(asset) : ''} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <p className="text-[10px] text-zinc-400 truncate" title={asset.fileName}>{asset.fileName}</p>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        <button onClick={() => admin.setProductPrimaryMedia && admin.setProductPrimaryMedia(asset)} type="button" className="secondary-btn !py-1 !px-1 !text-[9px]">Primary</button>
                                                        <button
                                                            onClick={() => admin.toggleProductGalleryMedia && admin.toggleProductGalleryMedia(asset)}
                                                            type="button"
                                                            className={`secondary-btn !py-1 !px-1 !text-[9px] ${admin.hasProductGalleryMedia && admin.hasProductGalleryMedia(asset) ? '!bg-[var(--primary)] !text-[#000]' : ''}`}
                                                        >
                                                            {admin.hasProductGalleryMedia && admin.hasProductGalleryMedia(asset) ? 'Added' : 'Gallery'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {filteredProductMediaAssets().length === 0 && (
                                            <p className="text-xs text-zinc-500">No media found. Upload from Media tab first.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Description</p>
                                <textarea
                                    value={productModal.form?.description || ''}
                                    onChange={(e) => { if (admin.productModal?.form) admin.productModal.form.description = e.target.value; }}
                                    placeholder="Write product description, condition notes, or collector highlights..."
                                    className="w-full h-32 bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none custom-scrollbar"
                                ></textarea>
                            </div>
                        </div>

                        <div className="admin-modal-foot">
                            <button onClick={() => admin.closeProductModal && admin.closeProductModal()} className="secondary-btn">Cancel</button>
                            <button onClick={() => admin.saveProductModal && admin.saveProductModal()} className="primary-btn">
                                {productModal.saving ? 'SAVING OP...' : 'SAVE PRODUCT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
