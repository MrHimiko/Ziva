import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import UserProfileModal from '../components/UserProfileModal';
import CreateRiskGroupModal from '../components/CreateRiskGroupModal';
import AddUserToGroupModal from '../components/AddUserToGroupModal';
import { riskGroupService, RiskGroup, RiskGroupMember } from '../services/riskGroupService';
import { useNotification } from '../contexts/NotificationContext';

const Groups: React.FC = () => {
    const [riskGroups, setRiskGroups] = useState<RiskGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<RiskGroup | null>(null);
    const [groupMembers, setGroupMembers] = useState<RiskGroupMember[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchRiskGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchGroupMembers(selectedGroup.id);
        }
    }, [selectedGroup]);

    const fetchRiskGroups = async () => {
        try {
            setIsLoadingGroups(true);
            const groups = await riskGroupService.getAllRiskGroups();
            setRiskGroups(groups);
            
            if (!selectedGroup && groups.length > 0) {
                setSelectedGroup(groups[0]);
            }
        } catch (error) {
            showNotification('error', 'Failed to load risk groups', error instanceof Error ? error.message : 'Please try again');
        } finally {
            setIsLoadingGroups(false);
        }
    };

    const fetchGroupMembers = async (groupId: number) => {
        try {
            setIsLoadingMembers(true);
            const response = await riskGroupService.getRiskGroupMembers(groupId, {
                limit: 100,
                sortBy: 'firstName',
                sortOrder: 'asc'
            });
            setGroupMembers(response.data);
            
            setRiskGroups(prev => prev.map(group => 
                group.id === groupId 
                    ? { ...group, memberCount: response.total }
                    : group
            ));
        } catch (error) {
            showNotification('error', 'Failed to load group members', error instanceof Error ? error.message : 'Please try again');
            setGroupMembers([]);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    const handleCreateGroup = async (name: string, description: string) => {
        try {
            await riskGroupService.createRiskGroup({ name, description });
            showNotification('success', 'Group created', 'Risk group created successfully');
            setShowCreateModal(false);
            fetchRiskGroups();
        } catch (error) {
            showNotification('error', 'Failed to create group', error instanceof Error ? error.message : 'Please try again');
        }
    };

    const handleDeleteGroup = async (groupId: number) => {
        if (!window.confirm('Are you sure you want to delete this risk group?')) {
            return;
        }

        try {
            await riskGroupService.deleteRiskGroup(groupId);
            showNotification('success', 'Group deleted', 'Risk group deleted successfully');
            
            const updatedGroups = riskGroups.filter(g => g.id !== groupId);
            setRiskGroups(updatedGroups);
            
            if (selectedGroup?.id === groupId) {
                setSelectedGroup(updatedGroups.length > 0 ? updatedGroups[0] : null);
                setGroupMembers([]);
            }
        } catch (error) {
            showNotification('error', 'Failed to delete group', error instanceof Error ? error.message : 'Please try again');
        }
    };

    const handleRemoveUserFromGroup = async (groupId: number, userId: number) => {
        if (!window.confirm('Are you sure you want to remove this user from the group?')) {
            return;
        }

        try {
            await riskGroupService.removeUserFromGroup(groupId, userId);
            showNotification('success', 'User removed', 'User removed from group successfully');
            
            if (selectedGroup) {
                fetchGroupMembers(selectedGroup.id);
            }
        } catch (error) {
            showNotification('error', 'Failed to remove user', error instanceof Error ? error.message : 'Please try again');
        }
    };

    const handleUserClick = (userId: number) => {
        setSelectedUserId(userId);
        setShowProfileModal(true);
    };

    const getDisplayName = (member: RiskGroupMember): string => {
        if (member.firstName && member.lastName) {
            return `${member.firstName} ${member.lastName}`;
        }
        if (member.firstName) return member.firstName;
        if (member.lastName) return member.lastName;
        return member.email.split('@')[0];
    };

    const filteredMembers = groupMembers.filter(member =>
        getDisplayName(member).toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateAvatar = (name: string): string => {
        const colors = ['#6D64D3', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const colorIndex = name.charCodeAt(0) % colors.length;
        const color = colors[colorIndex];
        
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="${color}"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-family="Inter" font-size="14" font-weight="500">${initials}</text>
            </svg>
        `)}`;
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoadingGroups) {
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
                                <h1 className="h1-48">Risk Group Management</h1>
                                <p className="text-op-60">Manage risk groups and their members</p>
                            </div>
                        </section>
                        
                        <section className="animate-entrance animate-entrance-delay-2">
                            <div className="groups-layout">
                                <div className="groups-sidebar">
                                    <div className="groups-sidebar-header">
                                        <h3 className="groups-sidebar-title">Risk Groups</h3>
                                        <button 
                                            className="create-group-btn"
                                            onClick={() => setShowCreateModal(true)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Create Group
                                        </button>
                                    </div>
                                    <div className="groups-list">
                                        {riskGroups.length === 0 ? (
                                            <div className="no-groups">
                                                <p>No risk groups found</p>
                                                <button 
                                                    className="create-first-group-btn"
                                                    onClick={() => setShowCreateModal(true)}
                                                >
                                                    Create your first group
                                                </button>
                                            </div>
                                        ) : (
                                            riskGroups.map(group => (
                                                <div
                                                    key={group.id}
                                                    className={`group-item ${selectedGroup?.id === group.id ? 'group-item-active' : ''}`}
                                                    onClick={() => setSelectedGroup(group)}
                                                >
                                                    <div className="group-item-content">
                                                        <div className="group-item-icon">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </div>
                                                        <div className="group-item-info">
                                                            <span className="group-item-name">{group.name}</span>
                                                            <span className="group-item-count">
                                                                {group.memberCount ?? 0} members
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="group-item-actions">
                                                        <button 
                                                            className="group-delete-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteGroup(group.id);
                                                            }}
                                                            title="Delete group"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                
                                <div className="groups-main">
                                    {selectedGroup ? (
                                        <>
                                            <div className="groups-main-header">
                                                <div className="groups-main-title-section">
                                                    <h2 className="groups-main-title">
                                                        {selectedGroup.name}
                                                        <span className="group-count-badge">
                                                            {selectedGroup.memberCount ?? 0} members
                                                        </span>
                                                    </h2>
                                                    {selectedGroup.description && (
                                                        <p className="group-description">{selectedGroup.description}</p>
                                                    )}
                                                </div>
                                                <div className="groups-main-controls">
                                                    <div className="search-container">
                                                        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M21 21L16.65 16.65" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Search members..." 
                                                            className="search-input"
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                        />
                                                    </div>
                                                    <button 
                                                        className="add-user-btn"
                                                        onClick={() => setShowAddUserModal(true)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 1.17157 16.1716C0.421427 16.9217 0 17.9391 0 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M8 11C10.2091 11 12 9.20914 12 7C12 4.79086 10.2091 3 8 3C5.79086 3 4 4.79086 4 7C4 9.20914 5.79086 11 8 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        Add User
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {isLoadingMembers ? (
                                                <div className="members-loading">
                                                    <div className="loading-spinner"></div>
                                                    <p>Loading members...</p>
                                                </div>
                                            ) : (
                                                <div className="members-grid">
                                                    {filteredMembers.length === 0 ? (
                                                        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(5, 44, 88, 0.6)' }}>
                                                            {searchTerm ? 'No members found matching your search' : 'No members in this group'}
                                                        </div>
                                                    ) : (
                                                        filteredMembers.map(member => (
                                                            <div 
                                                                key={member.id} 
                                                                className="member-card"
                                                                onClick={() => handleUserClick(member.id)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <div className="member-card-header">
                                                                    <img 
                                                                        src={generateAvatar(getDisplayName(member))} 
                                                                        alt={getDisplayName(member)}
                                                                        className="member-avatar"
                                                                    />
                                                                    <div className="member-info">
                                                                        <h4 className="member-name">{getDisplayName(member)}</h4>
                                                                        <p className="member-email">{member.email}</p>
                                                                    </div>
                                                                    <button
                                                                        className="remove-member-btn"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRemoveUserFromGroup(selectedGroup.id, member.id);
                                                                        }}
                                                                        title="Remove from group"
                                                                    >
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                                <div className="member-details">
                                                                    <div className="member-detail-row">
                                                                        <span className="member-detail-label">Age:</span>
                                                                        <span className="member-detail-value">{member.age || 'N/A'}</span>
                                                                        <span className="member-detail-label">Added:</span>
                                                                        <span className="member-detail-value">{formatDate(member.addedAt)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="no-group-selected">
                                            <p>Select a risk group to view its members</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <CreateRiskGroupModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateGroup}
                />
            )}

            {showAddUserModal && selectedGroup && (
                <AddUserToGroupModal
                    groupId={selectedGroup.id}
                    groupName={selectedGroup.name}
                    isOpen={showAddUserModal}
                    onClose={() => setShowAddUserModal(false)}
                    onUserAdded={() => {
                        if (selectedGroup) {
                            fetchGroupMembers(selectedGroup.id);
                        }
                    }}
                />
            )}

            {showProfileModal && selectedUserId && (
                <UserProfileModal
                    userId={selectedUserId}
                    isOpen={showProfileModal}
                    onClose={() => {
                        setShowProfileModal(false);
                        setSelectedUserId(null);
                    }}
                    onDataUpdate={() => {
                        if (selectedGroup) {
                            fetchGroupMembers(selectedGroup.id);
                        }
                    }}
                />
            )}
        </>
    );
};

export default Groups;