import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';

export function SettingsTab() {
    const admin = useAdmin();
    const { templateEditor = {}, templatePreview = {}, templateKeys = [], templatePlaceholders = [], smtpSettings = {}, courierSettings = {}, localSettings = {} } = admin;

    const [activeTab, setActiveTab] = useState('templates');

    const filteredMediaTags = admin.mediaTemplateTags ? admin.mediaTemplateTags() : [];
    const courierDispatchEnabled = admin.courierDispatchEnabled ? admin.courierDispatchEnabled() : false;

    // Inner Navigation Component
    const renderNav = () => (
        <div className="flex space-x-2 border-b border-[var(--border-strong)] pb-3 mb-6">
            {['templates', 'smtp', 'courier', 'preferences'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-none transition-all ${activeTab === tab ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)] shadow-[0_0_15px_var(--primary-soft)]' : 'text-zinc-500 hover:text-[var(--secondary)] border border-transparent hover:border-[var(--secondary)] hover:bg-[var(--bg-soft)] shadow-none'}`}
                >
                    {tab === 'templates' && 'Email Templates'}
                    {tab === 'smtp' && 'SMTP Mailer'}
                    {tab === 'courier' && 'Courier Integration'}
                    {tab === 'preferences' && 'Local Preferences'}
                </button>
            ))}
        </div>
    );

    const renderTemplatesTab = () => (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="settings-card settings-editor-card w-full">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Email Template Editor</h3>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Live Backend</span>
                </div>

                <div>
                    <label className="settings-label">Template Library</label>
                    <select
                        value={templateEditor.selectedKey || ''}
                        onChange={(e) => {
                            admin.templateEditor.selectedKey = e.target.value;
                            if (admin.selectTemplate) admin.selectTemplate(e.target.value);
                        }}
                        className="settings-input text-sm w-full"
                    >
                        <option value="">Select template</option>
                        {templateKeys.map(key => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    <div>
                        <label className="settings-label">Template Key</label>
                        <input
                            value={templateEditor.key || ''}
                            onChange={(e) => { admin.templateEditor.key = e.target.value; }}
                            placeholder="template_key"
                            className="settings-input mono text-sm w-full"
                        />
                    </div>
                    <div>
                        <label className="settings-label">Subject Line</label>
                        <input
                            value={templateEditor.subjectTemplate || ''}
                            onChange={(e) => { admin.templateEditor.subjectTemplate = e.target.value; }}
                            placeholder="Subject template"
                            className="settings-input text-sm w-full"
                        />
                    </div>
                </div>

                <div>
                    <label className="settings-label">HTML Body</label>
                    <textarea
                        value={templateEditor.htmlTemplate || ''}
                        onChange={(e) => { admin.templateEditor.htmlTemplate = e.target.value; }}
                        placeholder="HTML template..."
                        className="settings-input h-[400px] text-sm mono w-full"
                    ></textarea>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button onClick={() => admin.openEmailMediaPicker && admin.openEmailMediaPicker('template')} className="settings-btn settings-btn-soft px-3 py-2 text-xs">Insert Uploaded Image Tag</button>
                        <button onClick={() => admin.setActiveTab && admin.setActiveTab('media')} className="settings-btn settings-btn-soft px-3 py-2 text-xs">Open Media</button>
                        <p className="text-[10px] text-zinc-500">Adds a ready <code>&lt;img ...&gt;</code> tag into this template.</p>
                    </div>
                </div>

                <div>
                    <label className="settings-label">Quick Placeholders</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {templatePlaceholders.map(tag => (
                            <button
                                key={tag}
                                onClick={() => admin.insertTemplateTag && admin.insertTemplateTag(tag)}
                                onDoubleClick={() => admin.copyText && admin.copyText(`{{${tag}}}`)}
                                className="px-2 py-1 rounded-none text-[11px] mono uppercase bg-[rgba(10,10,20,0.8)] border border-[var(--border-strong)] text-[var(--text)] hover:border-[var(--secondary)] hover:text-[#fff] hover:shadow-[0_0_10px_var(--secondary)] transition-all cursor-pointer"
                            >
                                {`{{${tag}}}`}
                            </button>
                        ))}
                    </div>
                    {filteredMediaTags.length > 0 && (
                        <div className="mt-3">
                            <label className="settings-label !mb-2 !text-[10px]">Media Auto Tags</label>
                            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto custom-scrollbar pr-1 mt-2">
                                {filteredMediaTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => admin.insertTemplateText && admin.insertTemplateText(tag)}
                                        onDoubleClick={() => admin.copyText && admin.copyText(tag)}
                                        className="px-2 py-1 rounded-none text-[11px] mono uppercase bg-[rgba(10,10,20,0.8)] border border-[var(--primary)]/50 text-[var(--primary)] hover:border-[var(--primary)] hover:text-[#000] hover:bg-[var(--primary)] hover:shadow-[0_0_10px_var(--primary)] transition-all cursor-pointer"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-2">Media tags are generated from uploaded files. Click to insert image source placeholders.</p>
                        </div>
                    )}
                    <p className="text-[10px] text-zinc-500 mt-2">Click to insert. Double-click to copy placeholder.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                    <button onClick={() => admin.createTemplate && admin.createTemplate()} className="settings-btn settings-btn-primary w-full">Create</button>
                    <button onClick={() => admin.updateTemplate && admin.updateTemplate()} className="settings-btn settings-btn-soft w-full">Update</button>
                    <button onClick={() => admin.previewTemplate && admin.previewTemplate()} className="settings-btn settings-btn-soft w-full">Preview</button>
                    <button onClick={() => admin.testSendTemplate && admin.testSendTemplate()} className="settings-btn settings-btn-soft w-full">Test Send</button>
                </div>

                <div className="w-full">
                    <label className="settings-label">Test Email Address</label>
                    <input
                        value={templateEditor.testEmail || ''}
                        onChange={(e) => { admin.templateEditor.testEmail = e.target.value; }}
                        placeholder="test@email.com"
                        className="settings-input text-sm w-full"
                    />
                </div>
            </div>

            <div className="settings-card w-full sticky top-6">
                <h3 className="text-lg font-semibold mb-4">Template Preview</h3>
                <div className="grid grid-cols-1 gap-4 w-full">
                    <div className="rounded-none border border-[var(--border)] bg-[rgba(0,0,0,0.4)] p-4 w-full shadow-[inset_0_0_20px_rgba(0,243,255,0.05)]">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--secondary)] mb-2 font-bold">Subject</p>
                        <p className="text-sm text-zinc-100 min-h-[24px] mono">{templatePreview.subject || 'No preview generated yet'}</p>
                    </div>
                    <div className="rounded-none border border-[var(--border)] bg-[rgba(0,0,0,0.4)] p-4 min-h-[500px] overflow-y-auto custom-scrollbar w-full shadow-[inset_0_0_20px_rgba(0,243,255,0.05)]">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--secondary)] mb-2 font-bold">Rendered HTML</p>
                        <pre className="text-xs whitespace-pre-wrap leading-6 text-[#00f3ff] mono">{templatePreview.html || 'No preview generated yet'}</pre>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSmtpTab = () => (
        <div className="max-w-4xl mx-auto w-full">
            <div className="settings-card w-full">
                <div className="settings-card-title-row">
                    <h3>Namecheap SMTP Mailer</h3>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Used for all email notifications</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div>
                        <label className="settings-label">SMTP Host</label>
                        <input value={smtpSettings.host || ''} onChange={e => { admin.smtpSettings.host = e.target.value }} placeholder="mail.privateemail.com" className="settings-input text-sm w-full" />
                    </div>
                    <div>
                        <label className="settings-label">SMTP Port</label>
                        <input type="number" value={smtpSettings.port || ''} onChange={e => { admin.smtpSettings.port = parseInt(e.target.value) || '' }} min="1" max="65535" className="settings-input text-sm mono w-full" />
                    </div>
                    <div>
                        <label className="settings-label">SMTP Username</label>
                        <input value={smtpSettings.username || ''} onChange={e => { admin.smtpSettings.username = e.target.value }} placeholder="no-reply@bidnsteal.com" className="settings-input text-sm w-full" />
                    </div>
                    <div>
                        <label className="settings-label">SMTP Password</label>
                        <input
                            type="password"
                            value={smtpSettings.password || ''}
                            onChange={e => { admin.smtpSettings.password = e.target.value }}
                            placeholder={smtpSettings.hasPassword ? 'Leave empty to keep current password' : 'Enter SMTP password'}
                            className="settings-input text-sm w-full"
                        />
                        {smtpSettings.hasPassword && <p className="text-[10px] text-zinc-500 mt-1">Saved password: <span className="mono">{smtpSettings.passwordMasked}</span></p>}
                    </div>
                    <div>
                        <label className="settings-label">From Email</label>
                        <input type="email" value={smtpSettings.fromEmail || ''} onChange={e => { admin.smtpSettings.fromEmail = e.target.value }} placeholder="no-reply@bidnsteal.com" className="settings-input text-sm w-full" />
                    </div>
                    <div>
                        <label className="settings-label">From Name</label>
                        <input value={smtpSettings.fromName || ''} onChange={e => { admin.smtpSettings.fromName = e.target.value }} placeholder="BidnSteal" className="settings-input text-sm w-full" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="settings-label">Reply-To Email (Optional)</label>
                        <input type="email" value={smtpSettings.replyTo || ''} onChange={e => { admin.smtpSettings.replyTo = e.target.value }} placeholder="support@bidnsteal.com" className="settings-input text-sm w-full" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-6">
                    <label className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition">
                        <div>
                            <p className="text-sm font-semibold">Enable SMTP</p>
                            <p className="text-xs text-zinc-500 mt-1">Use Namecheap SMTP for all emails</p>
                        </div>
                        <span className="settings-toggle-wrap">
                            <input type="checkbox" className="sr-only" checked={!!smtpSettings.enabled} onChange={e => { admin.smtpSettings.enabled = e.target.checked }} />
                            <span className={`settings-toggle ${smtpSettings.enabled ? 'is-on bg-[var(--primary-orange)] border-[var(--primary-orange)]' : ''}`}></span>
                        </span>
                    </label>
                    <label className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition">
                        <div>
                            <p className="text-sm font-semibold">Use SSL/TLS</p>
                            <p className="text-xs text-zinc-500 mt-1">Recommended for Namecheap Private Email</p>
                        </div>
                        <span className="settings-toggle-wrap">
                            <input type="checkbox" className="sr-only" checked={!!smtpSettings.secure} onChange={e => { admin.smtpSettings.secure = e.target.checked }} />
                            <span className={`settings-toggle ${smtpSettings.secure ? 'is-on bg-[var(--primary-orange)] border-[var(--primary-orange)]' : ''}`}></span>
                        </span>
                    </label>
                </div>

                <label className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition mt-4 w-full">
                    <div>
                        <p className="text-sm font-semibold">Ignore TLS Certificate Validation</p>
                        <p className="text-xs text-zinc-500 mt-1">Only use if your SMTP certificate chain is misconfigured.</p>
                    </div>
                    <span className="settings-toggle-wrap">
                        <input type="checkbox" className="sr-only" checked={!!smtpSettings.ignoreTLS} onChange={e => { admin.smtpSettings.ignoreTLS = e.target.checked }} />
                        <span className={`settings-toggle ${smtpSettings.ignoreTLS ? 'is-on bg-[var(--primary-orange)] border-[var(--primary-orange)]' : ''}`}></span>
                    </span>
                </label>

                <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5 mt-6 w-full flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                        <label className="settings-label">SMTP Test Recipient</label>
                        <input type="email" value={smtpSettings.testEmail || ''} onChange={e => { admin.smtpSettings.testEmail = e.target.value }} placeholder="test@yourmail.com" className="settings-input text-sm w-full" />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => admin.saveSmtpSettings && admin.saveSmtpSettings()} className="settings-btn settings-btn-primary px-6 flex-1 sm:flex-auto whitespace-nowrap">
                            {smtpSettings.saving ? 'Saving...' : 'Save SMTP'}
                        </button>
                        <button onClick={() => admin.testSmtpSettings && admin.testSmtpSettings()} className="settings-btn settings-btn-soft px-6 flex-1 sm:flex-auto whitespace-nowrap">
                            {smtpSettings.testing ? 'Sending...' : 'Send Test'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCourierTab = () => (
        <div className="max-w-4xl mx-auto w-full">
            {courierSettings && typeof courierSettings === 'object' ? (
                <div className="settings-card w-full">
                    <div className="settings-card-title-row items-center border-b border-zinc-800 pb-5 mb-5">
                        <div className="max-w-lg">
                            <h3 className="text-xl">Courier Integration (Steadfast)</h3>
                            <span style={{ textTransform: 'none', letterSpacing: 'normal' }} className="text-sm mt-1 block">Configure once, then dispatch orders directly from the Orders Manager panel.</span>
                        </div>
                        <button onClick={() => admin.checkCourierBalance && admin.checkCourierBalance()} className="settings-btn settings-btn-soft px-4 py-2 text-sm whitespace-nowrap">
                            {courierSettings.balanceLoading ? 'Checking...' : 'Check Balance'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
                        <label className="rounded-xl border border-[var(--primary-orange)]/30 bg-[var(--primary-glow)] p-5 flex items-center justify-between cursor-pointer">
                            <div>
                                <p className="text-sm font-bold text-white">Enable Courier Dispatch</p>
                                <p className="text-xs text-zinc-300 mt-1">Turn on direct order push to Steadfast.</p>
                            </div>
                            <button
                                type="button"
                                className="settings-toggle-wrap focus:outline-none"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); admin.toggleCourierDispatchEnabled && admin.toggleCourierDispatchEnabled(); }}
                            >
                                <span className={`settings-toggle ${courierDispatchEnabled ? 'is-on bg-[var(--primary-orange)] border-[var(--primary-orange)]' : ''}`}></span>
                            </button>
                        </label>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col justify-center">
                            <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Current Balance</p>
                            <p className="text-2xl mono mt-1 font-bold text-white tracking-widest">{courierSettings.balance === null ? '-' : (admin.currency ? admin.currency(courierSettings.balance) : '')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div>
                            <label className="settings-label">Base URL</label>
                            <input value={courierSettings.baseUrl || ''} onChange={e => { admin.courierSettings.baseUrl = e.target.value }} placeholder="https://portal.packzy.com/api/v1" className="settings-input mono text-sm w-full" />
                        </div>
                        <div>
                            <label className="settings-label">API Key</label>
                            <input value={courierSettings.apiKey || ''} onChange={e => { admin.courierSettings.apiKey = e.target.value }} placeholder="Steadfast API key" className="settings-input mono text-sm w-full" />
                        </div>
                        <div>
                            <label className="settings-label">Secret Key</label>
                            <input type="password" value={courierSettings.secretKey || ''} onChange={e => { admin.courierSettings.secretKey = e.target.value }} placeholder="Enter new secret (leave empty to keep current)" className="settings-input mono text-sm w-full" />
                            {courierSettings.hasSecret && <p className="text-[10px] text-zinc-500 mt-1">Saved: {courierSettings.secretKeyMasked}</p>}
                        </div>
                        <div>
                            <label className="settings-label">Default Delivery Type</label>
                            <select value={courierSettings.defaultDeliveryType || ''} onChange={e => { admin.courierSettings.defaultDeliveryType = e.target.value }} className="settings-input text-sm w-full">
                                <option value="0">Home Delivery</option>
                                <option value="1">Point / Hub Pickup</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 w-full">
                        <label className="settings-label">Item Description Template</label>
                        <input value={courierSettings.defaultItemDescription || ''} onChange={e => { admin.courierSettings.defaultItemDescription = e.target.value }} placeholder="Order {{order_number}} - {{items}}" className="settings-input w-full" />
                        <p className="text-[10px] text-zinc-500 mt-1">Supported placeholders: <span className="mono bg-zinc-800 px-1 rounded">{`{{order_number}}`}</span>, <span className="mono bg-zinc-800 px-1 rounded">{`{{items}}`}</span>, <span className="mono bg-zinc-800 px-1 rounded">{`{{total}}`}</span></p>
                    </div>

                    <div className="settings-card border-none bg-zinc-900/30 p-5 mt-8 w-full">
                        <label className="toggle-card p-0 mb-4 bg-transparent border-none">
                            <div>
                                <p className="font-semibold text-lg border-b border-zinc-800 pb-2 inline-block">Enable Customer Success Check</p>
                                <p className="text-[11px] text-zinc-400 mt-1 max-w-lg leading-relaxed">Uses Steadfast merchant login to fetch customer courier history by phone. This enables fraud checking signals when viewing an order.</p>
                            </div>
                            <button
                                type="button"
                                className="settings-toggle-wrap focus:outline-none"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); admin.toggleFraudCheckerEnabled && admin.toggleFraudCheckerEnabled(); }}
                            >
                                <span className={`settings-toggle ${courierSettings?.fraudCheckerEnabled ? 'is-on bg-[var(--primary-orange)] border-[var(--primary-orange)]' : ''}`}></span>
                            </button>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div>
                                <label className="settings-label">Steadfast Login Email</label>
                                <input type="email" value={courierSettings.fraudCheckerEmail || ''} onChange={e => { admin.courierSettings.fraudCheckerEmail = e.target.value }} placeholder="merchant@email.com" className="settings-input text-sm w-full" />
                            </div>
                            <div>
                                <label className="settings-label">Steadfast Login Password</label>
                                <input type="password" value={courierSettings.fraudCheckerPassword || ''} onChange={e => { admin.courierSettings.fraudCheckerPassword = e.target.value }} placeholder="Enter new password (leave empty to keep current)" className="settings-input text-sm w-full" />
                                {courierSettings.fraudCheckerHasPassword && <p className="text-[10px] text-zinc-500 mt-1">Saved: {courierSettings.fraudCheckerPasswordMasked}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6 border-t border-zinc-800 pt-6">
                        <button onClick={() => admin.saveCourierSettings && admin.saveCourierSettings()} className="settings-btn settings-btn-primary px-8 text-sm font-semibold tracking-wider bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/80 text-white">
                            {courierSettings.saving ? 'Saving...' : 'SAVE COURIER SETTINGS'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="settings-card p-8 space-y-4 max-w-xl mx-auto w-full text-center border-red-500/20 bg-red-500/5">
                    <h3 className="text-xl font-semibold text-red-400">Courier Integration Error</h3>
                    <p className="text-sm text-zinc-300">Courier settings state became invalid or failed to load correctly.</p>
                    <p className="text-xs text-zinc-500">Click recover to rebuild this panel state.</p>
                    <div className="flex justify-center pt-4">
                        <button onClick={() => admin.resetCourierSettingsState && admin.resetCourierSettingsState()} className="settings-btn settings-btn-primary px-6 bg-red-600 hover:bg-red-500 text-white">
                            Recover Courier Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderPreferencesTab = () => (
        <div className="max-w-3xl mx-auto w-full">
            <div className="settings-card w-full">
                <h3 className="text-xl mb-6">Local Admin Preferences</h3>
                <div className="grid gap-4 w-full">
                    <label className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition">
                        <div>
                            <p className="text-sm font-semibold text-white">Auto Refresh Tabs</p>
                            <p className="text-xs text-zinc-400 mt-1 max-w-md">Automatically refresh dashboard and table data when switching between tabs. Disabling this saves bandwidth but requires manual reloading.</p>
                        </div>
                        <span className="settings-toggle-wrap">
                            <input type="checkbox" className="sr-only" checked={!!localSettings.autoRefresh} onChange={e => { admin.localSettings.autoRefresh = e.target.checked; if (admin.saveLocalSettings) admin.saveLocalSettings(); }} />
                            <span className={`settings-toggle ${localSettings.autoRefresh ? 'is-on bg-[var(--primary-orange)] border-[var(--primary-orange)]' : ''}`}></span>
                        </span>
                    </label>
                    <label className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition">
                        <div>
                            <p className="text-sm font-semibold text-white">Developer Debug Logs</p>
                            <p className="text-xs text-zinc-400 mt-1 max-w-md">Show detailed payload dumps and performance metrics in the browser's developer console.</p>
                        </div>
                        <span className="settings-toggle-wrap">
                            <input type="checkbox" className="sr-only" checked={!!localSettings.debug} onChange={e => { admin.localSettings.debug = e.target.checked; if (admin.saveLocalSettings) admin.saveLocalSettings(); }} />
                            <span className={`settings-toggle ${localSettings.debug ? 'is-on bg-[var(--primary-orange)] border-[var(--primary-orange)]' : ''}`}></span>
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <div className="settings-page max-w-[1600px] mx-auto overflow-hidden">
            <div className="settings-head flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900/80 pb-6 mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white m-0">System Control</h2>
                    <p className="text-zinc-500 text-sm mt-1">Manage core infrastructure, integrations, and local ops console preferences.</p>
                </div>
                <button onClick={() => admin.loadSettings && admin.loadSettings(true)} className="settings-btn settings-btn-soft border-zinc-700 max-w-max">Force Sync Cloud Settings</button>
            </div>

            {renderNav()}

            <div className="pt-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'templates' && renderTemplatesTab()}
                {activeTab === 'smtp' && renderSmtpTab()}
                {activeTab === 'courier' && renderCourierTab()}
                {activeTab === 'preferences' && renderPreferencesTab()}
            </div>
        </div>
    );
}
