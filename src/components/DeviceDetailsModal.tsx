import React from 'react';
import { Device } from '../services/deviceService';

interface DeviceDetailsModalProps {
    device: Device;
    isOpen: boolean;
    onClose: () => void;
}

// Mock device activity data interface
interface DeviceActivityMetric {
    id: string;
    metricType: string;
    value: number;
    timestamp: string;
}

const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({ device, isOpen, onClose }) => {
    if (!isOpen) return null;

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTimeSince = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays}d ago`;
        return formatDate(dateString);
    };

    // Extract model from name or use default
    const getDeviceModel = (name: string): string => {
        if (name.includes('EEG')) return name;
        return 'EEG-2000';
    };

    // Generate random battery percentage for demo
    const batteryPercentage = Math.floor(Math.random() * 100);

    // Calculate signal strength from RSSI
    const getSignalStrength = (rssi: number): { percentage: number; quality: string } => {
        // RSSI typically ranges from -100 to -30 dBm
        const percentage = Math.max(0, Math.min(100, (rssi + 100) * 1.43));
        let quality = 'Poor';
        if (percentage > 75) quality = 'Excellent';
        else if (percentage > 50) quality = 'Good';
        else if (percentage > 25) quality = 'Fair';
        return { percentage: Math.round(percentage), quality };
    };

    const signal = getSignalStrength(device.rssi);

    // Mock device activity data for demonstration
    const deviceActivity: { data: DeviceActivityMetric[] } = {
        data: [
            { id: '1', metricType: 'HRV', value: 45.2, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
            { id: '2', metricType: 'BPM', value: 72, timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
            { id: '3', metricType: 'SPO2', value: 98, timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
        ]
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content device-details-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Device Details: {device.localName || device.name}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                <div className="device-details-tabs">
                    <button className="device-tab active">Device Details</button>
                </div>

                <div className="device-details-content">
                    <div className="device-info-header">
                        <div className="device-image-placeholder">
                            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="120" height="120" rx="12" fill="#F3F4F6"/>
                                <path d="M60 45C66.627 45 72 51.373 72 58C72 64.627 66.627 70 60 70C53.373 70 48 64.627 48 58C48 51.373 53.373 45 60 45Z" fill="#D1D5DB"/>
                                <path d="M40 85C40 77.26 47.26 70 55 70H65C72.74 70 80 77.26 80 85C80 85 70 90 60 90C50 90 40 85 40 85Z" fill="#D1D5DB"/>
                            </svg>
                        </div>
                        <div className="device-main-info">
                            <h3>{getDeviceModel(device.name)}</h3>
                            <span className={`device-status-badge ${device.isConnectable ? 'connected' : 'disconnected'}`}>
                                {device.isConnectable ? 'Connected' : 'Disconnected'}
                            </span>
                            
                            <div className="device-quick-info">
                                <div className="info-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L2 7V11C2 16.5228 5.47715 21.4463 10.3802 22.8025L12 23L13.6198 22.8025C18.5228 21.4463 22 16.5228 22 11V7L12 2Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Serial: {device.id.substring(0, 12)}...</span>
                                </div>
                                <div className="info-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="1" y="6" width="22" height="12" rx="2" stroke="#6B7280" strokeWidth="2"/>
                                        <path d="M23 10V14" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    <span>Battery: {batteryPercentage}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="device-status-section">
                        <h4>Device Status</h4>
                        <div className="status-badges">
                            <span className={`status-badge ${device.isConnectable ? 'connected' : 'disconnected'}`}>
                                {device.isConnectable ? '● Connected' : '● Disconnected'}
                            </span>
                            {batteryPercentage < 20 && (
                                <span className="status-badge battery-low">
                                    ⚠ Low Battery
                                </span>
                            )}
                            <span className="status-badge synced">
                                ↻ Synced
                            </span>
                        </div>
                    </div>

                    <div className="device-stats-grid">
                        <div className="stat-card">
                            <h5>MTU Size</h5>
                            <p className="stat-value">{device.mtu}</p>
                            <p className="stat-label">Maximum Transmission Unit</p>
                        </div>
                        <div className="stat-card">
                            <h5>Signal Strength</h5>
                            <p className="stat-value">{device.rssi} dBm</p>
                            <p className="stat-label">{signal.quality} signal ({signal.percentage}%)</p>
                        </div>
                        <div className="stat-card">
                            <h5>Last Synced</h5>
                            <p className="stat-value">{getTimeSince(device.lastSyncAt)}</p>
                        </div>
                    </div>

                    <div className="device-technical-info">
                        <h4>Technical Information</h4>
                        <div className="tech-info-grid">
                            <div className="tech-info-item">
                                <label>Device ID</label>
                                <p>{device.id}</p>
                            </div>
                            <div className="tech-info-item">
                                <label>Device Name</label>
                                <p>{device.name}</p>
                            </div>
                            <div className="tech-info-item">
                                <label>Local Name</label>
                                <p>{device.localName || 'N/A'}</p>
                            </div>
                            <div className="tech-info-item">
                                <label>Created At</label>
                                <p>{formatDate(device.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div className="device-activity-section">
                        <h4>Recent Activity</h4>
                        {deviceActivity.data.length > 0 ? (
                            <div className="activity-list">
                                {deviceActivity.data.map((metric: DeviceActivityMetric, index: number) => (
                                    <div key={metric.id} className="activity-item">
                                        <div className="activity-info">
                                            <span className="activity-type">{metric.metricType.toUpperCase()}</span>
                                            <span className="activity-value">{metric.value}</span>
                                        </div>
                                        <span className="activity-time">{getTimeSince(metric.timestamp)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-activity">
                                <p>No recent activity data available</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default DeviceDetailsModal;