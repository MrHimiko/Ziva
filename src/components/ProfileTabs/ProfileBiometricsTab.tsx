import React, { useState, useEffect } from 'react';
import { biometricService, BiometricResponse } from '../../services/biometricService';
import { useNotification } from '../../contexts/NotificationContext';

interface ProfileBiometricsTabProps {
    userId: number;
}

type TimeRange = '7' | '30' | '90';

const ProfileBiometricsTab: React.FC<ProfileBiometricsTabProps> = ({ userId }) => {
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('7');
    const [biometricData, setBiometricData] = useState<{
        hrv?: BiometricResponse;
        bpm?: BiometricResponse;
        spo2?: BiometricResponse;
        battery?: BiometricResponse;
    }>({});
    const [isLoading, setIsLoading] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchBiometricData();
    }, [userId, selectedTimeRange]);

    const fetchBiometricData = async () => {
        try {
            setIsLoading(true);
            const endDate = new Date().toISOString();
            const startDate = new Date(Date.now() - parseInt(selectedTimeRange) * 24 * 60 * 60 * 1000).toISOString();

            const params = {
                startDate,
                endDate,
                limit: 1000
            };

            const [hrvResult, bpmResult, spo2Result, batteryResult] = await Promise.allSettled([
                biometricService.getHRV(params),
                biometricService.getBPM(params),
                biometricService.getSPO2(params),
                biometricService.getBatteryLevel(params)
            ]);

            setBiometricData({
                hrv: hrvResult.status === 'fulfilled' ? hrvResult.value : undefined,
                bpm: bpmResult.status === 'fulfilled' ? bpmResult.value : undefined,
                spo2: spo2Result.status === 'fulfilled' ? spo2Result.value : undefined,
                battery: batteryResult.status === 'fulfilled' ? batteryResult.value : undefined,
            });
        } catch (error) {
            showNotification('error', 'Failed to load biometric data', error instanceof Error ? error.message : 'Please try again');
        } finally {
            setIsLoading(false);
        }
    };

    const getTimeRangeLabel = (range: TimeRange): string => {
        switch (range) {
            case '7': return '7 Days';
            case '30': return '30 Days';
            case '90': return '90 Days';
            default: return '7 Days';
        }
    };

    if (isLoading) {
        return (
            <div className="biometrics-tab-content">
                <div className="biometrics-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading biometric data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="biometrics-tab-content">
            <div className="tab-header">
                <h4>Biometric Data</h4>
                <div className="time-range-selector">
                    {(['7', '30', '90'] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            className={`time-range-btn ${selectedTimeRange === range ? 'active' : ''}`}
                            onClick={() => setSelectedTimeRange(range)}
                        >
                            {getTimeRangeLabel(range)}
                        </button>
                    ))}
                    <button 
                        className="refresh-btn"
                        onClick={fetchBiometricData}
                        disabled={isLoading}
                        title="Refresh Data"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20.49 9C19.9828 7.56678 19.1209 6.28392 17.9845 5.27543C16.8482 4.26693 15.4745 3.57344 13.9917 3.26125C12.5089 2.94906 10.9652 3.03406 9.52618 3.50762C8.08716 3.98119 6.79365 4.83077 5.77 5.97L1 10M23 14L18.23 18.03C17.2064 19.1693 15.9129 20.0188 14.4738 20.4925C13.0348 20.9661 11.4911 21.0511 10.0083 20.7389C8.52547 20.4267 7.15183 19.7332 6.01547 18.7247C4.87912 17.7162 4.01717 16.4333 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Refresh Data
                    </button>
                </div>
            </div>

            <div className="biometric-cards-grid">
                {/* HRV Card */}
                <div className="biometric-card hrv-card">
                    <div className="biometric-card-header">
                        <h5>Heart Rate Variability</h5>
                        <div className="biometric-icon">💓</div>
                    </div>
                    {biometricData.hrv ? (
                        <div className="biometric-stats">
                            <div className="stat-row primary">
                                <span className="stat-label">Average</span>
                                <span className="stat-value">{biometricData.hrv.mean.toFixed(1)} ms</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Minimum</span>
                                <span className="stat-value">{biometricData.hrv.min.toFixed(1)} ms</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Maximum</span>
                                <span className="stat-value">{biometricData.hrv.max.toFixed(1)} ms</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Count</span>
                                <span className="stat-value">{biometricData.hrv.count}</span>
                            </div>
                            {biometricData.hrv.stdDev !== undefined && (
                                <div className="stat-row">
                                    <span className="stat-label">Std. Deviation</span>
                                    <span className="stat-value">{biometricData.hrv.stdDev.toFixed(1)} ms</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-data">No HRV data available</div>
                    )}
                </div>

                {/* BPM Card */}
                <div className="biometric-card bpm-card">
                    <div className="biometric-card-header">
                        <h5>Heart Rate</h5>
                        <div className="biometric-icon">❤️</div>
                    </div>
                    {biometricData.bpm ? (
                        <div className="biometric-stats">
                            <div className="stat-row primary">
                                <span className="stat-label">Average</span>
                                <span className="stat-value">{biometricData.bpm.mean.toFixed(0)} BPM</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Minimum</span>
                                <span className="stat-value">{biometricData.bpm.min.toFixed(0)} BPM</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Maximum</span>
                                <span className="stat-value">{biometricData.bpm.max.toFixed(0)} BPM</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Count</span>
                                <span className="stat-value">{biometricData.bpm.count}</span>
                            </div>
                            {biometricData.bpm.stdDev !== undefined && (
                                <div className="stat-row">
                                    <span className="stat-label">Std. Deviation</span>
                                    <span className="stat-value">{biometricData.bpm.stdDev.toFixed(1)} BPM</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-data">No heart rate data available</div>
                    )}
                </div>

                {/* SPO2 Card */}
                <div className="biometric-card spo2-card">
                    <div className="biometric-card-header">
                        <h5>Blood Oxygen</h5>
                        <div className="biometric-icon">🫁</div>
                    </div>
                    {biometricData.spo2 ? (
                        <div className="biometric-stats">
                            <div className="stat-row primary">
                                <span className="stat-label">Average</span>
                                <span className="stat-value">{biometricData.spo2.mean.toFixed(1)}%</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Minimum</span>
                                <span className="stat-value">{biometricData.spo2.min.toFixed(1)}%</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Maximum</span>
                                <span className="stat-value">{biometricData.spo2.max.toFixed(1)}%</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Count</span>
                                <span className="stat-value">{biometricData.spo2.count}</span>
                            </div>
                            {biometricData.spo2.stdDev !== undefined && (
                                <div className="stat-row">
                                    <span className="stat-label">Std. Deviation</span>
                                    <span className="stat-value">{biometricData.spo2.stdDev.toFixed(1)}%</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-data">No blood oxygen data available</div>
                    )}
                </div>

                {/* Battery Card */}
                <div className="biometric-card battery-card">
                    <div className="biometric-card-header">
                        <h5>Device Battery</h5>
                        <div className="biometric-icon">🔋</div>
                    </div>
                    {biometricData.battery ? (
                        <div className="biometric-stats">
                            <div className="stat-row primary">
                                <span className="stat-label">Average</span>
                                <span className="stat-value">{biometricData.battery.mean.toFixed(0)}%</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Minimum</span>
                                <span className="stat-value">{biometricData.battery.min.toFixed(0)}%</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Maximum</span>
                                <span className="stat-value">{biometricData.battery.max.toFixed(0)}%</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Count</span>
                                <span className="stat-value">{biometricData.battery.count}</span>
                            </div>
                            {biometricData.battery.stdDev !== undefined && (
                                <div className="stat-row">
                                    <span className="stat-label">Std. Deviation</span>
                                    <span className="stat-value">{biometricData.battery.stdDev.toFixed(1)}%</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-data">No battery data available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileBiometricsTab;