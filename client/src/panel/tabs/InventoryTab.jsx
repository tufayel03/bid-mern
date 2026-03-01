import React from 'react';
import { useAdmin } from '../AdminContext';
import { Icon } from '../components/Icon';

export function InventoryTab() {
    const admin = useAdmin();
    const { inventoryFilters, inventory = [], inventoryDeleting } = admin;

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="admin-tab-header">
                <div>
                    <h2>{admin.inventoryTrashMode ? 'Inventory Trash' : 'Inventory Management'}</h2>
                    <p>{admin.inventoryTrashMode ? 'Restore deleted products or permanently erase them.' : 'Manage products, view stock levels, and control pricing.'}</p>
                </div>
                {!admin.inventoryTrashMode && (
                    <button
                        onClick={() => admin.openProductCreate && admin.openProductCreate()}
                        className="order-filter-btn primary"
                    >
                        + Add Product
                    </button>
                )}
            </div>

            <div className="admin-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '200px', alignItems: 'center' }}>
                    <input
                        value={inventoryFilters.search || ''}
                        onChange={(e) => { admin.inventoryFilters.search = e.target.value; }}
                        type="text"
                        placeholder="Search title, slug..."
                        className="admin-search-input"
                        style={{ flex: 1 }}
                    />
                    <select
                        value={inventoryFilters.saleMode || 'All Sale Modes'}
                        onChange={(e) => { admin.inventoryFilters.saleMode = e.target.value; }}
                        className="order-filter-select"
                        style={{ flex: '0 1 auto', minWidth: '150px' }}
                    >
                        <option>All Sale Modes</option>
                        <option>Fixed Price</option>
                        <option>Auction</option>
                    </select>
                    <button
                        onClick={() => admin.loadInventory && admin.loadInventory(true)}
                        className="order-filter-btn"
                    >
                        Apply Filters
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(0, 243, 255, 0.05)', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-strong)', boxShadow: 'inset 0 0 10px rgba(0, 243, 255, 0.05)' }}>
                    <button
                        onClick={() => { admin.inventoryTrashMode = !admin.inventoryTrashMode; admin.loadInventory && admin.loadInventory(true).then(() => admin.forceUpdate && admin.forceUpdate()); }}
                        className="order-filter-btn"
                        style={{
                            padding: '6px 16px', fontSize: '12px',
                            background: admin.inventoryTrashMode ? 'var(--primary-magenta)' : 'transparent',
                            color: admin.inventoryTrashMode ? '#000' : 'var(--primary-magenta)',
                            border: admin.inventoryTrashMode ? 'none' : '1px solid var(--primary-magenta)',
                            textShadow: admin.inventoryTrashMode ? 'none' : '0 0 5px var(--primary-magenta)',
                            boxShadow: admin.inventoryTrashMode ? '0 0 15px rgba(255, 0, 255, 0.4)' : 'none'
                        }}
                    >
                        {admin.inventoryTrashMode ? 'VIEW INVENTORY' : 'TRASH BIN'}
                    </button>
                </div>
            </div>

            <div className="order-panel p-3 flex flex-wrap items-center gap-2">
                <div className="order-selection-meta flex items-center gap-2 text-xs">
                    <span className="text-zinc-400">
                        Selected{' '}
                        <span className="mono text-zinc-200">{admin.number ? admin.number(admin.selectedInventoryCount ? admin.selectedInventoryCount() : 0) : 0}</span>
                        {' / '}
                        <span className="mono text-zinc-200">{admin.number ? admin.number(inventory.length) : 0}</span>
                    </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <button onClick={() => admin.selectAllVisibleInventory && admin.selectAllVisibleInventory()} className="order-filter-btn">
                        Select Visible
                    </button>
                    <button onClick={() => admin.clearInventorySelection && admin.clearInventorySelection()} className="order-filter-btn">
                        Clear
                    </button>
                    <button
                        onClick={() => admin.deleteSelectedInventory && admin.deleteSelectedInventory()}
                        disabled={!(admin.selectedInventoryCount && admin.selectedInventoryCount()) || inventoryDeleting}
                        className="order-filter-btn danger"
                    >
                        {inventoryDeleting ? 'Deleting...' : (admin.inventoryTrashMode ? 'Delete Forever' : 'Trash Selected')}
                    </button>
                </div>
            </div>

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px', paddingRight: '0' }}>
                                <input
                                    type="checkbox"
                                    checked={inventory.length > 0 && admin.selectedInventoryCount && admin.selectedInventoryCount() === inventory.length}
                                    onChange={(e) => e.target.checked ? admin.selectAllVisibleInventory() : admin.clearInventorySelection()}
                                    className="order-check"
                                />
                            </th>
                            <th>Image</th>
                            <th>Title / SKU</th>
                            <th>Mode</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Reserved</th>
                            <th>Available</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((item) => (
                            <tr key={item.id || item.slug}>
                                <td style={{ paddingRight: '0' }}>
                                    <input
                                        type="checkbox"
                                        checked={admin.isInventorySelected ? admin.isInventorySelected(item) : false}
                                        onChange={() => admin.toggleInventorySelection && admin.toggleInventorySelection(item)}
                                        className="order-check"
                                    />
                                </td>
                                <td>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(63, 77, 103, 0.7)', background: '#101725' }}>
                                        {admin.mediaUrl && admin.mediaUrl(item.image) && (
                                            <img src={admin.mediaUrl(item.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <p style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{item.title}</p>
                                    <p className="mono" style={{ fontSize: '11px', color: '#8d9ab3' }}>{item.sku}</p>
                                    <div style={{ marginTop: '4px', display: 'flex', gap: '4px' }}>
                                        {item.isFeatured && <span className="status-badge status-live">featured</span>}
                                        {item.isNewDrop && <span className="status-badge status-processing">new</span>}
                                    </div>
                                </td>
                                <td style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.mode}</td>
                                <td className="mono" style={{ fontWeight: 700, color: '#3b82f6' }}>{admin.currency ? admin.currency(item.price) : ''}</td>
                                <td className="mono">{admin.number ? admin.number(item.stock) : ''}</td>
                                <td className="mono" style={{ color: '#8fa0be' }}>{admin.number ? admin.number(item.reserved) : ''}</td>
                                <td className="mono" style={{ fontWeight: 700 }}>{admin.number ? admin.number(item.stock - item.reserved) : ''}</td>
                                <td>
                                    <span className={`status-badge ${item.stock < 10 ? 'status-low' : 'status-delivered'}`}>
                                        {item.stock < 10 ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {admin.inventoryTrashMode ? (
                                            <button
                                                onClick={() => admin.restoreProduct && admin.restoreProduct(item)}
                                                className="order-filter-btn primary"
                                                style={{ padding: '6px 10px', color: '#fff' }}
                                                title="Restore"
                                            >
                                                <Icon name="rotate-ccw" style={{ width: '14px', height: '14px' }} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => admin.openProductEdit && admin.openProductEdit(item)}
                                                className="order-filter-btn"
                                                style={{ padding: '6px 10px' }}
                                            >
                                                <Icon name="edit-3" style={{ width: '14px', height: '14px' }} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => admin.deleteProduct && admin.deleteProduct(item)}
                                            className="order-filter-btn danger"
                                            style={{ padding: '6px 10px' }}
                                            title={admin.inventoryTrashMode ? 'Permanent Erase' : 'Move to Trash'}
                                        >
                                            <Icon name={admin.inventoryTrashMode ? 'x-circle' : 'trash-2'} style={{ width: '14px', height: '14px' }} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {admin.inventoryDeleteModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal" style={{ maxWidth: '400px', textAlign: 'center', boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)', border: '1px solid var(--primary-magenta)' }}>
                        <h3 style={{ color: 'var(--primary-magenta)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {admin.inventoryTrashMode ? 'Permanent Erase' : 'Move to Trash'}
                        </h3>
                        <p style={{ color: '#8fa0be', marginBottom: '24px', fontSize: '14px' }}>
                            {admin.inventoryDeleteModal.type === 'single' && (
                                <>Are you sure you want to {admin.inventoryTrashMode ? 'forever erase' : 'trash'} <br /><strong style={{ color: '#fff' }}>{admin.inventoryDeleteModal.item?.title || admin.inventoryDeleteModal.item?.slug}</strong>?</>
                            )}
                            {admin.inventoryDeleteModal.type === 'selected' && (
                                <>Are you sure you want to {admin.inventoryTrashMode ? 'forever erase' : 'trash'} <strong>{admin.inventoryDeleteModal.count}</strong> selected product(s)?</>
                            )}
                            <br /><br />
                            {admin.inventoryTrashMode ? 'This action cannot be undone.' : 'You can restore them later from the Trash Bin.'}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                onClick={() => { admin.inventoryDeleteModal = null; admin.forceUpdate && admin.forceUpdate(); }}
                                className="nl-input"
                                style={{ textAlign: 'center', cursor: 'pointer' }}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={() => admin.executeInventoryDelete && admin.executeInventoryDelete(admin.inventoryDeleteModal)}
                                className="order-filter-btn danger"
                                style={{ height: 'auto', padding: '12px', fontSize: '14px', letterSpacing: '0.1em' }}
                            >
                                CONFIRM
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
