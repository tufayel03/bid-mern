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
                    <h2>Inventory Management</h2>
                    <p>Manage products, view stock levels, and control pricing.</p>
                </div>
                <button
                    onClick={() => admin.openProductCreate && admin.openProductCreate()}
                    className="order-filter-btn primary"
                >
                    + Add Product
                </button>
            </div>

            <div className="admin-filter-bar">
                <input
                    value={inventoryFilters.search || ''}
                    onChange={(e) => { admin.inventoryFilters.search = e.target.value; }}
                    type="text"
                    placeholder="Search title, slug..."
                    className="admin-search-input"
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
                        {inventoryDeleting ? 'Deleting...' : 'Delete Selected'}
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
                                        <button onClick={() => admin.openProductEdit && admin.openProductEdit(item)} className="order-filter-btn" style={{ padding: '6px 10px' }}>
                                            <Icon name="edit-3" style={{ width: '14px', height: '14px' }} />
                                        </button>
                                        <button onClick={() => admin.deleteProduct && admin.deleteProduct(item)} className="order-filter-btn danger" style={{ padding: '6px 10px' }}>
                                            <Icon name="trash-2" style={{ width: '14px', height: '14px' }} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
