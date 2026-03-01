import React from 'react';
import { useAdmin } from '../AdminContext';

export function MediaTab() {
    const admin = useAdmin();
    const { mediaFilters, mediaUpload } = admin;

    const filtered = admin.filteredMediaAssets ? admin.filteredMediaAssets() : [];

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="admin-tab-header">
                <div>
                    <h2>Media Library</h2>
                    <p>Upload images once and reuse in products and email templates.</p>
                </div>
                <button onClick={() => admin.loadMedia && admin.loadMedia()} className="order-filter-btn">
                    Reload
                </button>
            </div>

            <div className="admin-card">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '12px', alignItems: 'end' }}>
                    <div>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', display: 'block', marginBottom: '8px', fontWeight: 700 }}>Upload Images</label>
                        <div className="relative cursor-pointer w-full group" style={{ border: '1px dashed var(--primary)', background: 'rgba(0, 243, 255, 0.05)', padding: '16px', borderRadius: '4px', textAlign: 'center', transition: 'all 0.2s', boxShadow: 'inset 0 0 10px rgba(0, 243, 255, 0.1)' }}>
                            <input
                                id="mediaUploadInput"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => admin.onMediaFileChange && admin.onMediaFileChange(e)}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                            />
                            <div className="pointer-events-none" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 700, letterSpacing: '0.1em', color: '#00f3ff', textTransform: 'uppercase', fontSize: '14px', textShadow: '0 0 8px rgba(0, 243, 255, 0.6)' }}>
                                    {mediaUpload.files.length ? `${mediaUpload.files.length} DATA_MODULE(S) READY` : 'SELECT DIGITAL ASSETS'}
                                </span>
                                <span style={{ color: '#8fa0be', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Drag & drop or Click to browse</span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => admin.uploadSelectedMedia && admin.uploadSelectedMedia()}
                        className="primary-btn"
                    >
                        {mediaUpload.uploading ? 'UPLOADING...' : 'UPLOAD DATA'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', marginTop: '16px' }}>
                    <input
                        value={mediaFilters.search || ''}
                        onChange={(e) => { admin.mediaFilters.search = e.target.value; }}
                        placeholder="Search by file name..."
                        className="admin-search-input"
                    />
                    <button onClick={() => admin.loadMedia && admin.loadMedia()} className="order-filter-btn">
                        Search
                    </button>
                </div>
            </div>

            <div className="order-panel">
                <p className="order-selection-meta">
                    Selected: <span className="mono">{admin.number ? admin.number(admin.selectedMediaCount ? admin.selectedMediaCount() : 0) : 0}</span>
                    {' / '}
                    <span className="mono">{admin.number ? admin.number(filtered.length) : 0}</span> visible
                </p>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => admin.selectAllVisibleMedia && admin.selectAllVisibleMedia()} className="order-filter-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Select Visible
                    </button>
                    <button onClick={() => admin.clearMediaSelection && admin.clearMediaSelection()} className="order-filter-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Clear
                    </button>
                    <button onClick={() => admin.deleteSelectedMedia && admin.deleteSelectedMedia()} className="order-filter-btn danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Delete Selected
                    </button>
                    <button onClick={() => admin.deleteAllMedia && admin.deleteAllMedia()} className="order-filter-btn danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Delete All Images
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {filtered.map((item) => (
                    <div
                        key={item.id}
                        className="admin-card no-pad"
                        style={{ border: (admin.isMediaSelected && admin.isMediaSelected(item)) ? '1px solid #3b82f6' : '1px solid rgba(53, 57, 71, 0.65)' }}
                    >
                        <div style={{ aspectRatio: '1', background: 'rgba(11, 13, 18, 0.4)', overflow: 'hidden' }}>
                            <img src={admin.mediaPreviewUrl ? admin.mediaPreviewUrl(item) : ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '12px', display: 'grid', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                <div style={{ overflow: 'hidden' }}>
                                    <p style={{ fontSize: '13px', fontWeight: 700, wordBreak: 'break-all', lineHeight: 1.2 }}>{item.fileName}</p>
                                    <p className="mono" style={{ fontSize: '10px', color: '#8fa0be', marginTop: '4px' }}>{admin.formatBytes ? admin.formatBytes(item.size) : ''} • {admin.date ? admin.date(item.modifiedAt) : ''}</p>
                                    <p className="mono" style={{ fontSize: '10px', color: '#93c5fd', marginTop: '4px', wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }} title={admin.mediaTemplatePlaceholder ? admin.mediaTemplatePlaceholder(item.fileName) : ''}>
                                        {admin.mediaTemplatePlaceholder ? admin.mediaTemplatePlaceholder(item.fileName) : ''}
                                    </p>
                                </div>
                                <label style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#8fa0be', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={admin.isMediaSelected ? admin.isMediaSelected(item) : false}
                                        onChange={() => admin.toggleMediaSelection && admin.toggleMediaSelection(item)}
                                        className="order-check"
                                    />
                                    Select
                                </label>
                            </div>
                            <div style={{ display: 'grid', gap: '8px', marginTop: '4px' }}>
                                <button
                                    onClick={() => admin.copyMediaTemplateTag && admin.copyMediaTemplateTag(item)}
                                    className="order-filter-btn" style={{ padding: '6px' }}
                                >
                                    Copy Tag
                                </button>
                                <button
                                    onClick={() => admin.deleteMedia && admin.deleteMedia(item)}
                                    className="order-filter-btn danger" style={{ padding: '6px' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filtered.length === 0 && <div className="text-sm text-zinc-500">No media found.</div>}
        </div>
    );
}
