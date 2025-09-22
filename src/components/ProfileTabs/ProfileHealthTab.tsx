import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { riskGroupService, RiskGroup } from '../../services/riskGroupService';
import { HealthProfile } from '../UserProfileModal';

interface ProfileHealthTabProps {
    healthProfile: HealthProfile | null;
    userId: number;
    onHealthProfileUpdate: (profile: HealthProfile) => void;
}

const ProfileHealthTab: React.FC<ProfileHealthTabProps> = ({ 
    healthProfile, 
    userId,
    onHealthProfileUpdate 
}) => {
    const [isUpdatingRiskGroup, setIsUpdatingRiskGroup] = useState(false);
    const [availableRiskGroups, setAvailableRiskGroups] = useState<RiskGroup[]>([]);
    const [currentRiskGroupId, setCurrentRiskGroupId] = useState<number | null>(null);
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchRiskGroups();
        fetchUserCurrentGroup();
    }, [userId]);

    const fetchRiskGroups = async () => {
        try {
            const groups = await riskGroupService.getAllRiskGroups();
            setAvailableRiskGroups(groups);
        } catch (error) {
            console.error('Failed to fetch risk groups:', error);
            setAvailableRiskGroups([]);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    const fetchUserCurrentGroup = async () => {
        try {
            const userGroups = await riskGroupService.getUserRiskGroups(userId);
            if (userGroups.groups.length > 0) {
                setCurrentRiskGroupId(userGroups.groups[0].groupId);
            } else {
                setCurrentRiskGroupId(null);
            }
        } catch (error) {
            console.error('Failed to fetch user risk groups:', error);
            setCurrentRiskGroupId(null);
        }
    };

    const handleRiskGroupChange = async (newGroupId: string) => {
        const groupIdNumber = newGroupId === '' ? null : parseInt(newGroupId);
        
        setIsUpdatingRiskGroup(true);
        try {
            // Remove user from current group if they have one
            if (currentRiskGroupId) {
                await riskGroupService.removeUserFromGroup(currentRiskGroupId, userId);
            }
            
            // Add user to new group if selected
            if (groupIdNumber) {
                await riskGroupService.addUserToGroup(groupIdNumber, userId);
            }
            
            setCurrentRiskGroupId(groupIdNumber);
            
            const groupName = groupIdNumber 
                ? availableRiskGroups.find(g => g.id === groupIdNumber)?.name || 'Selected Group'
                : 'No Group';
            
            showNotification('success', 'Risk group updated', `User assigned to: ${groupName}`);
        } catch (error) {
            showNotification('error', 'Failed to update risk group', error instanceof Error ? error.message : 'Please try again');
            fetchUserCurrentGroup();
        } finally {
            setIsUpdatingRiskGroup(false);
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    if (!healthProfile) {
        return (
            <div className="profile-health-tab">
                <div className="profile-info-grid">
                    <div className="profile-info-item">
                        <label>Risk Group Assignment</label>
                        {isLoadingGroups ? (
                            <p>Loading groups...</p>
                        ) : (
                            <select 
                                className="risk-group-select"
                                value={currentRiskGroupId || ''}
                                onChange={(e) => handleRiskGroupChange(e.target.value)}
                                disabled={isUpdatingRiskGroup}
                            >
                                <option value="">Unassigned</option>
                                {availableRiskGroups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {isUpdatingRiskGroup && <span className="updating-indicator">Updating...</span>}
                    </div>
                    <div className="profile-info-item">
                        <label>Health Profile Status</label>
                        <p>No health profile setup</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-health-tab">
            <div className="profile-info-grid">
                <div className="profile-info-item">
                    <label>Health Profile ID</label>
                    <p>{healthProfile.id}</p>
                </div>
                <div className="profile-info-item">
                    <label>Risk Group Assignment</label>
                    {isLoadingGroups ? (
                        <p>Loading groups...</p>
                    ) : (
                        <select 
                            className="risk-group-select"
                            value={currentRiskGroupId || ''}
                            onChange={(e) => handleRiskGroupChange(e.target.value)}
                            disabled={isUpdatingRiskGroup}
                        >
                            <option value="">Unassigned</option>
                            {availableRiskGroups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {isUpdatingRiskGroup && <span className="updating-indicator">Updating...</span>}
                </div>
                <div className="profile-info-item">
                    <label>Frequency</label>
                    <p>{healthProfile.frequency || 'Not set'}</p>
                </div>
                <div className="profile-info-item">
                    <label>Profile Created</label>
                    <p>{formatDate(healthProfile.createdAt)}</p>
                </div>
                <div className="profile-info-item">
                    <label>Last Updated</label>
                    <p>{formatDate(healthProfile.updatedAt)}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileHealthTab;