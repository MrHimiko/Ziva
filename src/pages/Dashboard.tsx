import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { userService, CombinedUserProfile } from '../services/userService';
import { eventService } from '../services/eventService';
import { biometricService, BiometricResponse } from '../services/biometricService';
import { riskGroupService } from '../services/riskGroupService';
import { useNotification } from '../contexts/NotificationContext';
import UsersTable from '../components/UsersTable';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard: React.FC = () => {
    const [users, setUsers] = useState<CombinedUserProfile[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalEvents, setTotalEvents] = useState(0);
    const [totalRiskGroups, setTotalRiskGroups] = useState(0);
    const [activeToday, setActiveToday] = useState(0);
    const [biometricOverview, setBiometricOverview] = useState<{
        avgHRV?: number;
        avgBPM?: number;
        avgSPO2?: number;
        avgBattery?: number;
    }>({});
    const [eventsTimelineData, setEventsTimelineData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
    const [isLoading, setIsLoading] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            
            // Fetch users and risk groups in parallel
            const [usersData, eventsResponse, riskGroups] = await Promise.all([
                userService.getCombinedUserProfiles(),
                eventService.getEvents({ limit: 1 }),
                riskGroupService.getAllRiskGroups().catch(() => []) // Don't fail if risk groups fail
            ]);

            setUsers(usersData.slice(0, 10)); // Get first 10 for table
            setTotalUsers(usersData.length);
            setTotalEvents(eventsResponse.total);
            setTotalRiskGroups(riskGroups.length);
            
            // Calculate active today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const activeTodayCount = usersData.filter(user => {
                const lastLogin = new Date(user.lastLoginAt);
                return lastLogin >= today;
            }).length;
            setActiveToday(activeTodayCount);
            
            // Fetch biometric overview (last 7 days)
            await fetchBiometricOverview();
            
            // Generate events timeline data (last 30 days)
            const timelineLabels: string[] = [];
            const timelineData: number[] = [];
            
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                timelineLabels.push(dateStr);
                // Generate random data for demo (in real app, you'd fetch this from API)
                timelineData.push(Math.floor(Math.random() * 20) + 5);
            }
            
            setEventsTimelineData({ labels: timelineLabels, data: timelineData });
            
        } catch (error) {
            showNotification('error', 'Failed to load dashboard data', error instanceof Error ? error.message : 'Please try again');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBiometricOverview = async () => {
        try {
            const endDate = new Date().toISOString();
            const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days

            const params = {
                startDate,
                endDate,
                limit: 1000
            };

            const [hrv, bpm, spo2, battery] = await Promise.allSettled([
                biometricService.getHRV(params),
                biometricService.getBPM(params),
                biometricService.getSPO2(params),
                biometricService.getBatteryLevel(params)
            ]);

            setBiometricOverview({
                avgHRV: hrv.status === 'fulfilled' ? hrv.value.mean : undefined,
                avgBPM: bpm.status === 'fulfilled' ? bpm.value.mean : undefined,
                avgSPO2: spo2.status === 'fulfilled' ? spo2.value.mean : undefined,
                avgBattery: battery.status === 'fulfilled' ? battery.value.mean : undefined
            });
        } catch (error) {
            console.error('Failed to fetch biometric overview:', error);
        }
    };

    // Events Timeline Chart
    const eventsTimelineChartData = {
        labels: eventsTimelineData.labels,
        datasets: [
            {
                label: 'Events',
                data: eventsTimelineData.data,
                borderColor: '#6D64D3',
                backgroundColor: 'rgba(109, 100, 211, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6D64D3',
                pointBorderColor: '#6D64D3',
                pointRadius: 3,
                pointHoverRadius: 5,
            },
        ],
    };

    const eventsTimelineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#052C58',
                bodyColor: '#052C58',
                borderColor: '#6D64D3',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: function(context: any) {
                        return `Events: ${context.parsed.y}`;
                    },
                },
            },
        },
        scales: {
            x: {
                display: true,
                grid: {
                    display: false,
                },
                ticks: {
                    color: 'rgba(5, 44, 88, 0.6)',
                    font: {
                        size: 12,
                    },
                    maxTicksLimit: 10,
                },
            },
            y: {
                display: true,
                grid: {
                    color: 'rgba(5, 44, 88, 0.1)',
                    borderDash: [5, 5],
                },
                ticks: {
                    color: 'rgba(5, 44, 88, 0.6)',
                    font: {
                        size: 12,
                    },
                },
            },
        },
    };

    if (isLoading) {
        return (
            <>
                <Sidebar />
                <div className="content">
                    <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </>
        );
    }

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
                                <h1 className="h1-48">Dashboard</h1>
                                <p className="text-op-60">Monitor user activity and system performance</p>
                            </div>
                        </section>
                        
                        <section className="animate-entrance animate-entrance-delay-2">
                            <div className="grid-4">
                                <div className="grid-info-item">
                                    <span className="text-op-60">Total Users</span>
                                    <span className="span-item-procent">{totalUsers}</span>
                                </div>
                                <div className="grid-info-item">
                                    <span className="text-op-60">Total Events</span>
                                    <span className="span-item-procent">{totalEvents}</span>
                                </div>
                                <div className="grid-info-item">
                                    <span className="text-op-60">Risk Groups</span>
                                    <span className="span-item-procent">{totalRiskGroups}</span>
                                </div>
                                <div className="grid-info-item">
                                    <span className="text-op-60">Active Today</span>
                                    <span className="span-item-procent">{activeToday}</span>
                                </div>
                            </div>
                        </section>

                        {/* Biometric Overview */}
                        <section className="animate-entrance animate-entrance-delay-3">
                            <div className="biometric-overview-section">
                                <h2 className="section-title">Biometric Overview (7 Days)</h2>
                                <div className="biometric-overview-grid">
                                    <div className="biometric-overview-card">
                                        <div className="biometric-icon hrv">💓</div>
                                        <div className="biometric-info">
                                            <span className="biometric-label">Avg. HRV</span>
                                            <span className="biometric-value">
                                                {biometricOverview.avgHRV ? `${biometricOverview.avgHRV.toFixed(1)} ms` : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="biometric-overview-card">
                                        <div className="biometric-icon bpm">❤️</div>
                                        <div className="biometric-info">
                                            <span className="biometric-label">Avg. Heart Rate</span>
                                            <span className="biometric-value">
                                                {biometricOverview.avgBPM ? `${biometricOverview.avgBPM.toFixed(0)} BPM` : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="biometric-overview-card">
                                        <div className="biometric-icon spo2">🫁</div>
                                        <div className="biometric-info">
                                            <span className="biometric-label">Avg. Blood Oxygen</span>
                                            <span className="biometric-value">
                                                {biometricOverview.avgSPO2 ? `${biometricOverview.avgSPO2.toFixed(1)}%` : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="biometric-overview-card">
                                        <div className="biometric-icon battery">🔋</div>
                                        <div className="biometric-info">
                                            <span className="biometric-label">Avg. Battery</span>
                                            <span className="biometric-value">
                                                {biometricOverview.avgBattery ? `${biometricOverview.avgBattery.toFixed(0)}%` : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="">
                            <div className="users-table-wrapper">
                                <h2
                                  className="table-title"
                                  style={{
                                    padding: '20px 24px 0 0',
                                    fontSize: '28px',
                                    fontWeight: 400,
                                    marginBottom: '20px',
                                    fontFamily: 'Instrument Serif'
                                  }}
                                >
                                  Recent Users
                                </h2>
                                <section className="">
                                  <UsersTable 
                                      users={users}
                                      showControls={false}
                                      maxRows={10}
                                      onDataUpdate={fetchDashboardData}
                                  />
                                </section>
                            </div>  
                        </section>

                        <section className="animate-entrance animate-entrance-delay-4">
                            <div className="chart-wrapper">
                                <span className="semi-bold">Events Over Time (Last 30 Days)</span>
                                <div className="chart">
                                    <Line data={eventsTimelineChartData} options={eventsTimelineChartOptions} />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;