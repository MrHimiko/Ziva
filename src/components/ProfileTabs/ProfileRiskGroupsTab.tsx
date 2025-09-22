import React, { useState, useEffect } from 'react';
import { riskGroupService, RiskGroup } from '../../services/riskGroupService';
import { useNotification } from '../../contexts/NotificationContext';

interface ProfileRiskGroupsTabProps {
    userId: number;
}

const ProfileRiskGroupsTab: React.FC<ProfileRiskGroupsTabProps> = ({ userId }) => {
    const [userGroups, setUserGroups] = useState<{ groupId: number; groupName: string; createdAt: string; addedBy: number }[]>([]);
    const [availableGroups, setAvailableGroups] = useState<RiskGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchUserRiskGroups();
        fetchAvailableGroups();
    }, [userId]);

    const fetchUserRiskGroups = async () => {
        try {
            const response = await riskGroupService.getUserRiskGroups(userId);
            setUserGroups(response.groups);
        } catch (error) {
            console.error('Failed to fetch user risk groups:', error);
            setUserGroups([]);
        }
    };

    const fetchAvailableGroups = async () => {
        try {
            setIsLoading(true);
            const groups = await riskGroupService.getAllRiskGroups();
            setAvailableGroups(groups);
        } catch (error) {
            console.error('Failed to fetch available groups:', error);
            setAvailableGroups([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="profile-risk-groups-tab">
                <div className="loading-section">
                    <div className="loading-spinner"></div>
                    <p>Loading risk groups...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-risk-groups-tab">
            <div className="risk-groups-content">
                {userGroups.length === 0 ? (
                    <div className="no-groups">
                        <p>This user is not assigned to any risk groups</p>
                    </div>
                ) : (
                    <div className="user-groups-list">
                        <h4>Assigned Risk Groups</h4>
                        <div className="groups-grid">
                            {userGroups.map(group => (
                                <div key={group.groupId} className="group-card">
                                    <h5>{group.groupName}</h5>
                                    <div className="group-meta">
                                        <span>Added: {formatDate(group.createdAt)}</span>
                                        <span>Added by: User #{group.addedBy}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileRiskGroupsTab;