import React from 'react';
import { useAdmin } from '../AdminContext';
import { Icon } from './Icon';

export function AdminSidebar() {
    const admin = useAdmin();

    // Extract necessary state from Proxy
    const collapsed = admin.localSettings?.sidebarCollapsed;
    const activeTab = admin.activeTab;
    const menuItems = admin.menuItems || [];

    return (
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="admin-brand">
                <div className="admin-brand-badge">B</div>
                <div>
                    <h1>BIDNSTEAL</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <p style={{ margin: 0 }}>Admin Panel</p>
                        <span style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--info)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: '800',
                            letterSpacing: '0.05em',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            opacity: collapsed ? 0 : 1,
                            transition: 'opacity 200ms'
                        }}>SYS-OP</span>
                    </div>
                </div>
            </div>

            <nav className="admin-nav custom-scrollbar" style={{ overflowY: 'auto' }}>
                {menuItems.map((item, index) => {
                    let groupLabel = null;
                    if (item.id === 'dashboard') groupLabel = "OPERATIONS";
                    if (item.id === 'users') groupLabel = "AUDIENCE & CRM";
                    if (item.id === 'analytics') groupLabel = "INTELLIGENCE";

                    return (
                        <React.Fragment key={item.id}>
                            {groupLabel && (
                                <div style={{
                                    opacity: collapsed ? 0 : 1,
                                    transition: 'opacity 200ms',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    color: 'var(--border-strong)',
                                    letterSpacing: '0.15em',
                                    padding: '12px 12px 4px',
                                    marginTop: index > 0 ? '8px' : '0'
                                }}>
                                    {groupLabel}
                                </div>
                            )}
                            <button
                                onClick={() => admin.setActiveTab(item.id)}
                                title={collapsed ? item.label : ''}
                                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            >
                                <Icon name={item.icon} />
                                <span>{item.label}</span>
                            </button>
                        </React.Fragment>
                    );
                })}
            </nav>

            <div className="admin-sidebar-footer">
                <button
                    onClick={() => admin.toggleSidebarCollapse()}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="admin-link-btn"
                >
                    <Icon name="panel-left-close" className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : 'rotate-0'}`} />
                    <span>
                        {collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    </span>
                </button>
                <button
                    onClick={() => admin.logout && admin.logout()}
                    title={collapsed ? 'Logout' : ''}
                    className="admin-link-btn logout"
                >
                    <Icon name="log-out" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
