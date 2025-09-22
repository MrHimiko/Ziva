import React, { useState, useEffect } from 'react';
import { UserProfile } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import EditProfileModal from './EditProfileModal';
import ProfileGeneralTab from './ProfileTabs/ProfileGeneralTab';
import ProfileHealthTab from './ProfileTabs/ProfileHealthTab';
import ProfileDevicesTab from './ProfileTabs/ProfileDevicesTab';
import ProfileEventsTab from './ProfileTabs/ProfileEventsTab';
import ProfileBiometricsTab from './ProfileTabs/ProfileBiometricsTab';

export interface HealthProfile {
    id: number;
    profileId: number;
    frequency: string;
    riskGroup: 'high' | 'control' | 'average' | 'moderate' | null;
    createdAt: string;
    updatedAt: string;
}

interface UserProfileModalProps {
    userId: number;
    isOpen: boolean;
    onClose: () => void;
    onDataUpdate?: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, isOpen, onClose, onDataUpdate }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'health' | 'biometrics' | 'devices' | 'events'>('general');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const { user: currentUser } = useAuth();
    const { showNotification } = useNotification();

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserProfile();
            fetchHealthProfile();
        }
    }, [isOpen, userId]);

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('accessToken');
            
            const response = await fetch(`https://ziva-health.netlify.app/api/v1/profile/profiles/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const data = await response.json();
            setUserProfile(data);
        } catch (error) {
            showNotification('error', 'Failed to load profile', error instanceof Error ? error.message : 'Please try again');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHealthProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            
            const response = await fetch(`https://ziva-health.netlify.app/api/v1/health-profile/health-profiles/profile/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch health profile');
            }

            const data = await response.json();
            
            if (Array.isArray(data) && data.length === 0) {
                setHealthProfile(null);
            } else if (Array.isArray(data) && data.length > 0) {
                setHealthProfile(data[0]);
            } else if (data && typeof data === 'object') {
                setHealthProfile(data);
            } else {
                setHealthProfile(null);
            }
        } catch (error) {
            console.error('Failed to load health profile:', error);
            setHealthProfile(null);
        }
    };

    const getDisplayName = (profile: UserProfile): string => {
        if (profile.firstName && profile.lastName) {
            return `${profile.firstName} ${profile.lastName}`;
        }
        if (profile.firstName) return profile.firstName;
        if (profile.lastName) return profile.lastName;
        return profile.email.split('@')[0];
    };

    const getInitials = (profile: UserProfile): string => {
        const name = getDisplayName(profile);
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const isCurrentUser = currentUser?.id === userId;

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content user-profile-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">User Profile</h2>
                        <button className="modal-close" onClick={onClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="modal-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading profile...</p>
                        </div>
                    ) : userProfile ? (
                        <>
                            <div className="profile-header">
                                <div className="profile-avatar-large">
                                    {userProfile.avatarUrl ? (
                                        <img src={userProfile.avatarUrl} alt={getDisplayName(userProfile)} />
                                    ) : (
                                        <span>{getInitials(userProfile)}</span>
                                    )}
                                </div>
                                <div className="profile-header-info">
                                    <h3 className="profile-name">{getDisplayName(userProfile)}</h3>
                                    <p className="profile-email">{userProfile.email}</p>
                                    <span className={`profile-status ${userProfile.isActive ? 'active' : 'inactive'}`}>
                                        {userProfile.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {isCurrentUser && (
                                    <button 
                                        className="edit-profile-btn"
                                        onClick={() => setShowEditModal(true)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            <div className="profile-tabs">
                                <button 
                                    className={`profile-tab ${activeTab === 'general' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('general')}
                                >
                                    General
                                </button>
                                <button 
                                    className={`profile-tab ${activeTab === 'health' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('health')}
                                >
                                    Health & Risk Groups
                                </button>
                                <button 
                                    className={`profile-tab ${activeTab === 'biometrics' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('biometrics')}
                                >
                                    Biometrics
                                </button>
                                <button 
                                    className={`profile-tab ${activeTab === 'devices' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('devices')}
                                >
                                    Devices
                                </button>
                                <button 
                                    className={`profile-tab ${activeTab === 'events' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('events')}
                                >
                                    Events
                                </button>
                            </div>

                            <div className="profile-tab-content">
                                {activeTab === 'general' && (
                                    <ProfileGeneralTab userProfile={userProfile} />
                                )}

                                {activeTab === 'health' && (
                                    <ProfileHealthTab 
                                        healthProfile={healthProfile}
                                        userId={userId}
                                        onHealthProfileUpdate={(updatedProfile) => {
                                            setHealthProfile(updatedProfile);
                                            onDataUpdate?.();
                                        }}
                                    />
                                )}

                                {activeTab === 'biometrics' && (
                                    <ProfileBiometricsTab userId={userId} />
                                )}

                                {activeTab === 'devices' && (
                                    <ProfileDevicesTab userId={userId} />
                                )}

                                {activeTab === 'events' && (
                                    <ProfileEventsTab userId={userId} />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="modal-error">
                            <p>Failed to load profile</p>
                        </div>
                    )}
                </div>
            </div>

            {showEditModal && userProfile && (
                <EditProfileModal
                    profile={userProfile}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSave={() => {
                        setShowEditModal(false);
                        fetchUserProfile();
                    }}
                />
            )}
        </>
    );
};

export default UserProfileModal;