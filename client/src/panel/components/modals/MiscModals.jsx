import React from 'react';
import { useAdmin } from '../../AdminContext';
import { Icon } from '../Icon';

export function MiscModals() {
    const admin = useAdmin();
    const { emailMediaPicker = {}, toast = {}, showSearch, menuItems = [] } = admin;

    const filteredEmailMediaAssets = () => {
        return admin.filteredEmailMediaAssets ? admin.filteredEmailMediaAssets() : [];
    };

    return (
        <>
            {/* Email Image Picker Modal */}
            {emailMediaPicker.open && (
                <div className="fixed inset-0 z-[109] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget && admin.closeEmailMediaPicker) admin.closeEmailMediaPicker(); }}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-6xl p-5 max-h-[90vh] overflow-y-auto custom-scrollbar space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Insert Uploaded Image Tag</h3>
                                <p className="text-xs text-zinc-500">
                                    {emailMediaPicker.target === 'campaign' ? 'Target: Campaign HTML editor' : 'Target: Email template HTML editor'}
                                </p>
                            </div>
                            <button onClick={() => admin.closeEmailMediaPicker && admin.closeEmailMediaPicker()} className="text-zinc-500 hover:text-zinc-300">
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                            <input
                                value={emailMediaPicker.search || ''}
                                onChange={(e) => { if (admin.emailMediaPicker) admin.emailMediaPicker.search = e.target.value; }}
                                placeholder="Search uploaded image..."
                                className="bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                            />
                            <input
                                value={emailMediaPicker.alt || ''}
                                onChange={(e) => { if (admin.emailMediaPicker) admin.emailMediaPicker.alt = e.target.value; }}
                                placeholder="Alt text (optional)"
                                className="bg-zinc-800 border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none"
                            />
                            <button
                                onClick={() => admin.refreshEmailMediaPicker && admin.refreshEmailMediaPicker()}
                                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm"
                            >
                                {emailMediaPicker.loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
                        <p className="text-[11px] text-zinc-500">For templates, insert uses auto placeholders like <span className="mono">{'{{media.image_file_png}}'}</span>. Campaign target inserts direct media URLs.</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                            {filteredEmailMediaAssets().map(asset => (
                                <div key={asset.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2 space-y-2">
                                    <div className="aspect-square rounded border border-zinc-800 bg-zinc-950/60 overflow-hidden">
                                        <img src={admin.mediaPreviewUrl ? admin.mediaPreviewUrl(asset) : ''} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <p className="text-[11px] text-zinc-400 truncate" title={asset.fileName}>{asset.fileName}</p>
                                    <p className="text-[10px] text-blue-300/80 mono truncate" title={admin.mediaTemplatePlaceholder ? admin.mediaTemplatePlaceholder(asset.fileName) : ''}>
                                        {admin.mediaTemplatePlaceholder ? admin.mediaTemplatePlaceholder(asset.fileName) : ''}
                                    </p>
                                    <div className="grid grid-cols-2 gap-1">
                                        <button
                                            onClick={() => admin.insertEmailImageTag && admin.insertEmailImageTag(asset)}
                                            className="px-2 py-1 rounded bg-blue-600 text-white text-[11px] hover:bg-blue-500"
                                        >
                                            {emailMediaPicker.target === 'campaign' ? 'Insert URL' : 'Insert Tag'}
                                        </button>
                                        <button
                                            onClick={() => admin.copyText && admin.copyText(emailMediaPicker.target === 'campaign' ? (admin.mediaPreviewUrl ? admin.mediaPreviewUrl(asset) : '') : (admin.mediaTemplatePlaceholder ? admin.mediaTemplatePlaceholder(asset.fileName) : ''))}
                                            className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-[11px] hover:bg-zinc-700"
                                        >
                                            {emailMediaPicker.target === 'campaign' ? 'Copy URL' : 'Copy Tag'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredEmailMediaAssets().length === 0 && (
                            <p className="text-sm text-zinc-500">No uploaded media found.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast.show && (
                <div style={{
                    position: 'fixed',
                    top: '80px',
                    right: '24px',
                    zIndex: 9999,
                    minWidth: '280px',
                    maxWidth: '420px',
                    padding: '14px 18px',
                    borderRadius: '4px',
                    background: 'rgba(5, 10, 24, 0.97)',
                    border: `1px solid ${toast.type === 'error' ? 'var(--danger)' : toast.type === 'success' ? 'var(--primary)' : 'var(--border-strong)'}`,
                    boxShadow: `0 0 18px ${toast.type === 'error' ? 'rgba(255,50,50,0.25)' : toast.type === 'success' ? 'rgba(0,243,255,0.2)' : 'rgba(0,0,0,0.4)'}`,
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono, monospace)',
                    letterSpacing: '0.03em',
                    pointerEvents: 'none'
                }}>
                    <p style={{ margin: 0, color: toast.type === 'error' ? 'var(--danger)' : toast.type === 'success' ? 'var(--primary)' : '#e2e8f0' }}>
                        {toast.type === 'error' ? '⚠ ' : toast.type === 'success' ? '✓ ' : ''}{toast.message}
                    </p>
                </div>
            )}

            {/* Global Search Modal (Ctrl+K) */}
            {showSearch && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 bg-black/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget && admin.setShowSearch) admin.setShowSearch(false); }}>
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
                            <Icon name="search" className="w-5 h-5 text-zinc-500" />
                            <input type="text" placeholder="Jump to command, order, or user..." className="bg-transparent border-none outline-none flex-1 text-lg" autoFocus />
                            <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-500">ESC</span>
                        </div>
                        <div className="p-2 max-h-96 overflow-y-auto custom-scrollbar">
                            <div className="px-3 py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Navigation</div>
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (admin.setActiveTab) admin.setActiveTab(item.id);
                                        if (admin.setShowSearch) admin.setShowSearch(false);
                                    }}
                                    className="w-full text-left px-3 py-3 hover:bg-zinc-800 rounded-lg flex items-center justify-between group"
                                >
                                    <span className="text-sm">Go to {item.label}</span>
                                    <Icon name="arrow-right" className="w-4 h-4 text-zinc-700 group-hover:text-blue-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
