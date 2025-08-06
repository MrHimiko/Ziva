import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { deviceService, Device } from '../services/deviceService';
import { useNotification } from '../contexts/NotificationContext';
import DeviceDetailsModal from '../components/DeviceDetailsModal';

const Devices: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            setIsLoading(true);
            const data = await deviceService.getAllDevices();
            setDevices(data);
        } catch (error) {
            showNotification('error', 'Failed to load devices', error instanceof Error ? error.message : 'Please try again');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (device: Device) => {
        setSelectedDevice(device);
        setShowDetailsModal(true);
    };

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
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays}d ago`;
        return formatDate(dateString);
    };

    const getSignalStrength = (rssi: number): string => {
        if (rssi > -50) return 'Excellent';
        if (rssi > -60) return 'Good';
        if (rssi > -70) return 'Fair';
        return 'Poor';
    };

    const getSignalColor = (rssi: number): string => {
        if (rssi > -50) return '#10B981';
        if (rssi > -60) return '#F59E0B';
        if (rssi > -70) return '#F97316';
        return '#EF4444';
    };

    const filteredDevices = devices.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.localName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Sidebar />
            <div className="content">
                <div className="top-right">
                    <div className="dh-embed">
                        <svg width={20} height={19} viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g opacity="0.3" clipPath="url(#clip0_864_301)">
                                <path d="M17.706 13.7598L15.606 6.18475C15.184 4.66096 14.2643 3.32221 12.9933 2.38173C11.7222 1.44125 10.173 0.95314 8.59247 0.995152C7.01189 1.03716 5.49082 1.60688 4.27156 2.61355C3.05229 3.62022 2.20495 5.00595 1.86451 6.55L0.240762 13.855C0.179888 14.1291 0.181353 14.4134 0.245049 14.6868C0.308746 14.9603 0.433046 15.216 0.608775 15.435C0.784504 15.654 1.00717 15.8307 1.26035 15.9521C1.51352 16.0735 1.79073 16.1366 2.07151 16.1365H5.17876C5.41744 16.9619 5.91784 17.6874 6.60461 18.2037C7.29137 18.72 8.12731 18.9992 8.98651 18.9992C9.84571 18.9992 10.6817 18.72 11.3684 18.2037C12.0552 17.6874 12.5556 16.9619 12.7943 16.1365H15.9C16.1891 16.1365 16.4742 16.0697 16.7332 15.9413C16.9921 15.8129 17.2179 15.6263 17.3928 15.3962C17.5677 15.1661 17.6871 14.8986 17.7416 14.6148C17.796 14.3309 17.7834 14.0383 17.706 13.7598ZM2.53876 13.8865L4.06126 7.03375C4.29445 5.9808 4.87317 5.03612 5.7053 4.35009C6.53742 3.66406 7.57512 3.2761 8.65322 3.24799C9.73131 3.21987 10.7878 3.55321 11.6546 4.19493C12.5213 4.83666 13.1485 5.74989 13.4363 6.78925L15.4073 13.8865H2.53876Z" fill="#052C58" />
                            </g>
                            <circle cx={16} cy={4} r={4} fill="#6D64D3" />
                            <defs>
                                <clipPath id="clip0_864_301">
                                    <rect width={18} height={18} fill="white" transform="translate(0 1)" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div id="hamburger-trigger" className="hamburger-trigger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <div className="gap-40">
                    <div className="gap-24">
                        <section className="animate-entrance animate-entrance-delay-1">
                            <div className="gap-10">
                                <h1 className="h1-48">Device Management</h1>
                                <p className="text-op-60">Monitor and manage connected biometric devices</p>
                            </div>
                        </section>
                        <section className="animate-entrance animate-entrance-delay-2">
                            <div className="users-controls">
                                <div className="search-container">
                                    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M21 21L16.65 16.65" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <input 
                                        type="text" 
                                        placeholder="Search devices..." 
                                        className="search-input"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                
                            </div>
                        </section>
                        <section className="animate-entrance animate-entrance-delay-3">
                            <div className="users-table-wrapper">
                                <div className="users-table-container">
                                    {isLoading ? (
                                        <div style={{ padding: '40px', textAlign: 'center' }}>
                                            <div className="loading-spinner"></div>
                                            <p style={{ marginTop: '16px', color: 'rgba(5, 44, 88, 0.6)' }}>Loading devices...</p>
                                        </div>
                                    ) : (
                                        <table className="users-table">
                                            <thead>
                                                <tr>
                                                    <th>Device Name</th>
                                                    <th>ID</th>
                                                    <th>Signal Strength</th>
                                                    <th>Status</th>
                                                    <th>Last Sync</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredDevices.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(5, 44, 88, 0.6)' }}>
                                                            No devices found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredDevices.map(device => (
                                                        <tr key={device.id}>
                                                            <td>
                                                                <div style={{fontWeight: 600}}>
                                                                    {device.localName || device.name}
                                                                </div>
                                                                <div style={{fontSize: 12, color: '#8A94A6'}}>
                                                                    MTU: {device.mtu}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <code style={{fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px'}}>
                                                                    {device.id.substring(0, 8)}...
                                                                </code>
                                                            </td>
                                                            <td>
                                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M5 12.55C5 11.1437 5.75994 9.79689 7.008 8.824C8.25606 7.85111 9.88856 7.34082 11.6124 7.41832C13.3362 7.49582 14.9326 8.15419 16.089 9.238C17.2454 10.3218 17.8757 11.7364 17.8653 13.2C17.8549 14.6636 17.2048 16.07 16.0334 17.1384C14.862 18.2068 13.2547 18.85 11.5308 18.9124" stroke={getSignalColor(device.rssi)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                        <path d="M5 17L11 11L17 17" stroke={getSignalColor(device.rssi)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    </svg>
                                                                    <span style={{color: getSignalColor(device.rssi), fontWeight: 500}}>
                                                                        {getSignalStrength(device.rssi)}
                                                                    </span>
                                                                    <span style={{fontSize: 12, color: '#8A94A6'}}>
                                                                        ({device.rssi} dBm)
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={`status-indicator ${device.isConnectable ? 'active' : 'inactive'}`}>
                                                                    {device.isConnectable ? 'Connected' : 'Disconnected'}
                                                                </span>
                                                            </td>
                                                            <td>{getTimeSince(device.lastSyncAt)}</td>
                                                            <td>
                                                                <button 
                                                                    className="btn-view-details"
                                                                    onClick={() => handleViewDetails(device)}
                                                                    style={{
                                                                        padding: '6px 16px',
                                                                        background: '#6D64D3',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        fontSize: '13px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    View Details
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {showDetailsModal && selectedDevice && (
                <DeviceDetailsModal
                    device={selectedDevice}
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedDevice(null);
                    }}
                />
            )}
        </>
    );
};

export default Devices;