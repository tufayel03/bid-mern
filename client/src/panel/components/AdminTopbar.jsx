import React from 'react';
import { useAdmin } from '../AdminContext';
import { Icon } from './Icon';

export function AdminTopbar() {
    const admin = useAdmin();

    return (
        <header className="admin-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div className="admin-search-shell">
                    <Icon name="search" />
                    <input
                        type="text"
                        placeholder="Search operations... (Ctrl+K)"
                        onFocus={() => { admin.showSearch = true; }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontFamily: '"JetBrains Mono", monospace' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--success)', fontWeight: '600', letterSpacing: '0.05em', textShadow: '0 0 10px rgba(34, 197, 94, 0.4)' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)', animation: 'pulse 2s infinite' }}></div>
                        OP-LINK: 14ms
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '500' }}>
                        SYNC: JUST NOW
                    </div>
                </div>
            </div>

            <div className="admin-topbar-right">
                <button className="icon-btn">
                    <Icon name="bell" />
                    <span className="dot"></span>
                </button>
                <div style={{ width: '1px', height: '24px', background: 'var(--border-strong)' }}></div>
                <div className="admin-user">
                    <strong>{admin.authUser?.name || 'Admin User'}</strong>
                    <span>{admin.authUser?.role || 'admin'}</span>
                </div>
                <div className="avatar"></div>
            </div>
        </header>
    );
}
