import React from 'react';
import { useAdmin } from '../AdminContext';

export function CampaignsTab() {
    const admin = useAdmin();
    const { campaigns = [], campaignDraft = {}, campaignTemplates = [], selectedCampaignTemplateId, campaignTemplateName } = admin;

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="admin-tab-header">
                <div>
                    <h2>Campaigns</h2>
                    <p>Create and send email marketing campaigns to your subscribers.</p>
                </div>
                <button onClick={() => admin.loadCampaigns && admin.loadCampaigns(true)} className="order-filter-btn">Reload</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', alignItems: 'start' }}>
                <div className="admin-card" style={{ display: 'grid', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Create Campaign</h3>
                    <div style={{ padding: '16px', background: 'var(--panel-bg)', border: '1px solid rgba(45, 51, 67, 0.4)', borderRadius: '12px', display: 'grid', gap: '12px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: '#e2e8f0' }}>Campaign Templates</p>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            <input
                                value={campaignTemplateName || ''}
                                onChange={(e) => { admin.campaignTemplateName = e.target.value; }}
                                placeholder="Template name (custom)"
                                className="admin-search-input"
                            />
                            <select
                                value={selectedCampaignTemplateId || ''}
                                onChange={(e) => {
                                    admin.selectedCampaignTemplateId = e.target.value;
                                    if (admin.applyCampaignTemplateById) admin.applyCampaignTemplateById(e.target.value);
                                }}
                                className="order-filter-select"
                            >
                                <option value="">Select saved template</option>
                                {campaignTemplates.map(template => (
                                    <option key={template.id} value={template.id}>{template.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <button onClick={() => admin.saveCampaignTemplate && admin.saveCampaignTemplate()} className="order-filter-btn primary" style={{ padding: '6px 0' }}>{selectedCampaignTemplateId ? 'Update' : 'Save'}</button>
                            <button onClick={() => admin.clearCampaignTemplateSelection && admin.clearCampaignTemplateSelection()} className="order-filter-btn" style={{ padding: '6px 0' }}>New</button>
                            <button onClick={() => admin.deleteCampaignTemplate && admin.deleteCampaignTemplate()} className="order-filter-btn danger" style={{ padding: '6px 0' }}>Delete</button>
                        </div>
                        <p style={{ fontSize: '11px', color: '#8fa0be', margin: 0 }}>Use custom template names and reuse them for future campaigns.</p>
                    </div>
                    <input
                        value={campaignDraft.subject || ''}
                        onChange={(e) => { admin.campaignDraft.subject = e.target.value; }}
                        placeholder="Subject"
                        className="admin-search-input" style={{ fontSize: '14px' }}
                    />
                    <textarea
                        value={campaignDraft.html || ''}
                        onChange={(e) => { admin.campaignDraft.html = e.target.value; }}
                        placeholder="HTML content..."
                        className="admin-search-input mono" style={{ height: '240px', padding: '12px', resize: 'vertical' }}
                    ></textarea>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => admin.openEmailMediaPicker && admin.openEmailMediaPicker('campaign')} className="order-filter-btn">Insert Uploaded Image Tag</button>
                        <button onClick={() => admin.setActiveTab && admin.setActiveTab('media')} className="order-filter-btn">Open Media</button>
                        <p style={{ fontSize: '11px', color: '#8fa0be', margin: '4px 0 0 0', width: '100%' }}>Build campaign HTML with uploaded images quickly.</p>
                    </div>
                    <button onClick={() => admin.createCampaign && admin.createCampaign()} className="order-filter-btn primary" style={{ width: '100%', padding: '10px', fontSize: '14px' }}>Create Draft</button>
                </div>
                <div className="admin-card no-pad" style={{ gridColumn: 'span 2' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(45, 51, 67, 0.8)' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Existing Campaigns</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Recipients</th>
                                    <th>Sent</th>
                                    <th>Opened</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map(campaign => (
                                    <tr key={campaign.id}>
                                        <td style={{ fontWeight: 700, color: '#f8fafc' }}>{campaign.subject}</td>
                                        <td>
                                            <span className={`status-badge ${campaign.status === 'draft' ? 'status-cancelled' : 'status-live'}`}>{campaign.status}</span>
                                        </td>
                                        <td className="mono" style={{ color: '#e2e8f0' }}>{admin.number ? admin.number(campaign.totalRecipients) : ''}</td>
                                        <td className="mono" style={{ color: '#3b82f6', fontWeight: 700 }}>{admin.number ? admin.number(campaign.sentCount) : ''}</td>
                                        <td className="mono" style={{ color: '#10b981', fontWeight: 700 }}>{admin.number ? admin.number(campaign.openCount) : ''}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => admin.sendCampaign && admin.sendCampaign(campaign)} className="order-filter-btn primary" style={{ padding: '6px 12px' }}>Send</button>
                                                <button onClick={() => admin.resendCampaign && admin.resendCampaign(campaign)} className="order-filter-btn" style={{ padding: '6px 12px' }}>Resend</button>
                                                <button onClick={() => admin.deleteCampaign && admin.deleteCampaign(campaign)} className="order-filter-btn danger" style={{ padding: '6px 12px' }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {campaigns.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#8fa0be' }}>No campaigns found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
