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
                    <h2>{admin.mediaTrashMode ? 'Media Trash' : 'Media Library'}</h2>
                    <p>{admin.mediaTrashMode ? 'Restore deleted assets or permanently erase them.' : 'Upload images once and reuse in products and email templates.'}</p>
                </div>
                <button onClick={() => admin.loadMedia && admin.loadMedia()} className="order-filter-btn">
                    Reload
                </button>
            </div>

            {!admin.mediaTrashMode && (
                <div className="admin-card">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', alignItems: 'center' }}>
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
                                        {mediaUpload.uploading ? 'UPLOADING DATA...' : 'SELECT DIGITAL ASSETS'}
                                    </span>
                                    <span style={{ color: '#8fa0be', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {mediaUpload.uploading ? 'Please wait while asset is being stored' : 'Drag & drop or Click to browse'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-card">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '200px' }}>
                        <input
                            value={mediaFilters.search || ''}
                            onChange={(e) => { admin.mediaFilters.search = e.target.value; }}
                            placeholder="Search by file name..."
                            className="admin-search-input"
                            style={{ flex: 1 }}
                        />
                        <button onClick={() => admin.loadMedia && admin.loadMedia(null, true)} className="order-filter-btn">
                            Search
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(0, 243, 255, 0.05)', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-strong)', boxShadow: 'inset 0 0 10px rgba(0, 243, 255, 0.05)' }}>
                        <button
                            onClick={() => { admin.mediaViewMode = 'grid'; admin.forceUpdate && admin.forceUpdate(); }}
                            className="order-filter-btn"
                            style={{
                                padding: '6px 16px', fontSize: '12px',
                                background: admin.mediaViewMode === 'grid' ? 'var(--primary)' : 'transparent',
                                color: admin.mediaViewMode === 'grid' ? '#000' : 'var(--primary)',
                                border: admin.mediaViewMode === 'grid' ? 'none' : '1px solid var(--primary)',
                                textShadow: admin.mediaViewMode === 'grid' ? 'none' : '0 0 5px var(--primary)'
                            }}
                        >
                            GRID
                        </button>
                        <button
                            onClick={() => { admin.mediaViewMode = 'columns'; admin.forceUpdate && admin.forceUpdate(); }}
                            className="order-filter-btn"
                            style={{
                                padding: '6px 16px', fontSize: '12px',
                                background: admin.mediaViewMode === 'columns' ? 'var(--primary)' : 'transparent',
                                color: admin.mediaViewMode === 'columns' ? '#000' : 'var(--primary)',
                                border: admin.mediaViewMode === 'columns' ? 'none' : '1px solid var(--primary)',
                                textShadow: admin.mediaViewMode === 'columns' ? 'none' : '0 0 5px var(--primary)'
                            }}
                        >
                            LIST
                        </button>
                        <button
                            onClick={() => { admin.mediaTrashMode = !admin.mediaTrashMode; admin.loadMedia && admin.loadMedia(null, true).then(() => admin.forceUpdate && admin.forceUpdate()); }}
                            className="order-filter-btn"
                            style={{
                                padding: '6px 16px', fontSize: '12px', marginLeft: '12px',
                                background: admin.mediaTrashMode ? 'var(--primary-magenta)' : 'transparent',
                                color: admin.mediaTrashMode ? '#000' : 'var(--primary-magenta)',
                                border: admin.mediaTrashMode ? 'none' : '1px solid var(--primary-magenta)',
                                textShadow: admin.mediaTrashMode ? 'none' : '0 0 5px var(--primary-magenta)',
                                boxShadow: admin.mediaTrashMode ? '0 0 15px rgba(255, 0, 255, 0.4)' : 'none'
                            }}
                        >
                            {admin.mediaTrashMode ? 'VIEW LIBRARY' : 'TRASH BIN'}
                        </button>
                    </div>
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
                        Clear Selection
                    </button>
                    {admin.mediaTrashMode && (
                        <button onClick={() => admin.restoreSelectedMedia && admin.restoreSelectedMedia()} className="order-filter-btn" style={{ padding: '6px 12px', fontSize: '12px', background: '#10b981', color: '#fff', border: 'none' }}>
                            Restore Selected
                        </button>
                    )}
                    <button onClick={() => admin.deleteSelectedMedia && admin.deleteSelectedMedia()} className="order-filter-btn danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        {admin.mediaTrashMode ? 'Delete Forever' : 'Trash Selected'}
                    </button>
                    <button onClick={() => admin.deleteAllMedia && admin.deleteAllMedia()} className="order-filter-btn danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        {admin.mediaTrashMode ? 'Empty Trash' : 'Trash All Images'}
                    </button>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: admin.mediaViewMode === 'columns'
                        ? '1fr'
                        : 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: admin.mediaViewMode === 'columns' ? '0px' : '16px',
                    border: admin.mediaViewMode === 'columns' ? '1px solid var(--border-strong)' : 'none',
                    borderRadius: admin.mediaViewMode === 'columns' ? '4px' : '0'
                }}
            >
                {filtered.map((item, index) => {
                    const isSelected = admin.isMediaSelected && admin.isMediaSelected(item);

                    if (admin.mediaViewMode === 'columns') {
                        // LIST VIEW (Table Row Style)
                        return (
                            <div
                                key={item.id || item.fileName || index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '12px',
                                    background: isSelected ? 'rgba(59, 130, 246, 0.1)' : (index % 2 === 0 ? 'transparent' : 'rgba(11, 13, 18, 0.3)'),
                                    borderBottom: index < filtered.length - 1 ? '1px solid var(--border-strong)' : 'none',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <label style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', margin: 0, cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => admin.toggleMediaSelection && admin.toggleMediaSelection(item)}
                                        className="order-check"
                                    />
                                </label>

                                <div style={{ width: '40px', height: '40px', background: 'rgba(11, 13, 18, 0.6)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                    <img src={admin.mediaPreviewUrl ? admin.mediaPreviewUrl(item) : ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#f8fafc' }}>
                                        {item.fileName}
                                    </p>
                                    <p className="mono" style={{ fontSize: '11px', color: '#93c5fd', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {admin.mediaTemplatePlaceholder ? admin.mediaTemplatePlaceholder(item.fileName) : ''}
                                    </p>
                                </div>

                                <div style={{ width: '120px', flexShrink: 0 }}>
                                    <p className="mono" style={{ fontSize: '11px', color: '#8fa0be' }}>{admin.formatBytes ? admin.formatBytes(item.size) : ''}</p>
                                </div>

                                <div style={{ width: '120px', flexShrink: 0 }}>
                                    <p className="mono" style={{ fontSize: '11px', color: '#8fa0be' }}>{admin.date ? admin.date(item.modifiedAt) : ''}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    {admin.mediaTrashMode ? (
                                        <button
                                            onClick={() => admin.restoreMedia && admin.restoreMedia(item)}
                                            className="order-filter-btn" style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none' }}
                                        >
                                            Restore
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => admin.copyMediaTemplateTag && admin.copyMediaTemplateTag(item)}
                                            className="order-filter-btn" style={{ padding: '6px 12px' }}
                                        >
                                            Copy Tag
                                        </button>
                                    )}
                                    <button
                                        onClick={() => admin.deleteMedia && admin.deleteMedia(item)}
                                        className="order-filter-btn danger" style={{ padding: '6px 12px' }}
                                    >
                                        {admin.mediaTrashMode ? 'Delete Forever' : 'Trash'}
                                    </button>
                                </div>
                            </div>
                        );
                    }

                    // GRID VIEW (Thumbnail Cards)
                    return (
                        <div
                            key={item.id || item.fileName || index}
                            className="admin-card no-pad"
                            style={{ border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(53, 57, 71, 0.65)' }}
                        >
                            <div style={{
                                aspectRatio: '1',
                                background: 'rgba(11, 13, 18, 0.4)',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img
                                    src={admin.mediaPreviewUrl ? admin.mediaPreviewUrl(item) : ''}
                                    alt=""
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                            <div style={{ padding: '8px', display: 'grid', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ fontSize: '11px', fontWeight: 700, wordBreak: 'break-all', lineHeight: 1.2 }}>{item.fileName}</p>
                                        <p className="mono" style={{ fontSize: '9px', color: '#8fa0be', marginTop: '2px' }}>{admin.formatBytes ? admin.formatBytes(item.size) : ''}</p>
                                        <p className="mono" style={{ fontSize: '9px', color: '#93c5fd', marginTop: '2px', wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }} title={admin.mediaTemplatePlaceholder ? admin.mediaTemplatePlaceholder(item.fileName) : ''}>
                                            {admin.mediaTemplatePlaceholder ? admin.mediaTemplatePlaceholder(item.fileName) : ''}
                                        </p>
                                    </div>
                                    <label style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', margin: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => admin.toggleMediaSelection && admin.toggleMediaSelection(item)}
                                            className="order-check"
                                        />
                                    </label>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '2px' }}>
                                    {admin.mediaTrashMode ? (
                                        <button
                                            onClick={() => admin.restoreMedia && admin.restoreMedia(item)}
                                            className="order-filter-btn" style={{ padding: '4px', fontSize: '10px', background: '#10b981', color: '#fff', border: 'none' }}
                                            title="Restore"
                                        >
                                            Restore
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => admin.copyMediaTemplateTag && admin.copyMediaTemplateTag(item)}
                                            className="order-filter-btn" style={{ padding: '4px', fontSize: '10px' }}
                                            title="Copy Tag"
                                        >
                                            Copy
                                        </button>
                                    )}
                                    <button
                                        onClick={() => admin.deleteMedia && admin.deleteMedia(item)}
                                        className="order-filter-btn danger" style={{ padding: '4px', fontSize: '10px' }}
                                        title={admin.mediaTrashMode ? 'Delete Forever' : 'Trash'}
                                    >
                                        {admin.mediaTrashMode ? 'Erase' : 'Trash'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {filtered.length === 0 && <div className="text-sm text-zinc-500">No media found.</div>}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <span className="mono" style={{ fontSize: '12px', color: '#8fa0be' }}>
                    Page {admin.mediaMeta?.page || 1} of {admin.mediaMeta?.totalPages || 1} ({admin.mediaMeta?.total || 0} items)
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        disabled={(admin.mediaMeta?.page || 1) <= 1}
                        onClick={() => {
                            if (admin.mediaFilters) {
                                admin.mediaFilters.page = Math.max(1, (admin.mediaFilters.page || 1) - 1);
                                admin.loadMedia && admin.loadMedia();
                            }
                        }}
                        className="order-filter-btn"
                    >
                        Prev
                    </button>
                    <button
                        disabled={(admin.mediaMeta?.page || 1) >= (admin.mediaMeta?.totalPages || 1)}
                        onClick={() => {
                            if (admin.mediaFilters) {
                                admin.mediaFilters.page = (admin.mediaFilters.page || 1) + 1;
                                admin.loadMedia && admin.loadMedia();
                            }
                        }}
                        className="order-filter-btn"
                    >
                        Next
                    </button>
                </div>
            </div>

            {admin.mediaDeleteModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal" style={{ maxWidth: '400px', textAlign: 'center', boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)', border: '1px solid var(--primary-magenta)' }}>
                        <h3 style={{ color: 'var(--primary-magenta)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {admin.mediaTrashMode ? 'Permanent Erase' : 'Move to Trash'}
                        </h3>
                        <p style={{ color: '#8fa0be', marginBottom: '24px', fontSize: '14px' }}>
                            {admin.mediaDeleteModal.type === 'single' && (
                                <>Are you sure you want to {admin.mediaTrashMode ? 'forever erase' : 'trash'} <br /><strong style={{ color: '#fff' }}>{admin.mediaDeleteModal.item.fileName}</strong>?</>
                            )}
                            {admin.mediaDeleteModal.type === 'selected' && (
                                <>Are you sure you want to {admin.mediaTrashMode ? 'forever erase' : 'trash'} <strong>{admin.mediaDeleteModal.count}</strong> selected images?</>
                            )}
                            {admin.mediaDeleteModal.type === 'all' && (
                                <>Are you sure you want to {admin.mediaTrashMode ? 'forever erase' : 'trash'} <strong>ALL {admin.mediaDeleteModal.count}</strong> images?</>
                            )}
                            <br /><br />
                            {admin.mediaTrashMode ? 'This action cannot be undone.' : 'You can restore them later from the Trash Bin.'}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                onClick={() => { admin.mediaDeleteModal = null; admin.forceUpdate && admin.forceUpdate(); }}
                                className="nl-input"
                                style={{ textAlign: 'center', cursor: 'pointer' }}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={() => admin.executeMediaDelete && admin.executeMediaDelete(admin.mediaDeleteModal)}
                                className="order-filter-btn danger"
                                style={{ height: 'auto', padding: '12px', fontSize: '14px', letterSpacing: '0.1em' }}
                            >
                                CONFIRM
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
