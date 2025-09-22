import React, { useState, useEffect } from 'react';
import { CombinedUserProfile } from '../services/userService';
import { riskGroupService } from '../services/riskGroupService';
import UserProfileModal from './UserProfileModal';

type SortKey = 'name' | 'email' | 'lastLogin' | 'status' | 'createdAt' | 'riskGroup' | 'age' | 'gender';
type SortDirection = 'asc' | 'desc';

interface UsersTableProps {
    users: CombinedUserProfile[];
    showSearch?: boolean;
    showControls?: boolean;
    tableTitle?: string;
    maxRows?: number;
    onDataUpdate?: () => void;
}

interface UserRiskGroup {
    userId: number;
    groupName: string | null;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
    users, 
    showSearch = true, 
    showControls = true,
    tableTitle,
    maxRows,
    onDataUpdate
}) => {
    const [showActions, setShowActions] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: SortDirection }>({ key: 'name', direction: 'asc' });
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userRiskGroups, setUserRiskGroups] = useState<Map<number, string>>(new Map());

    // Fetch risk groups for all users
    useEffect(() => {
        fetchAllUserRiskGroups();
    }, [users]);

    const fetchAllUserRiskGroups = async () => {
        const riskGroupMap = new Map<number, string>();
        
        await Promise.all(
            users.map(async (user) => {
                try {
                    const userGroups = await riskGroupService.getUserRiskGroups(user.id);
                    if (userGroups.groups.length > 0) {
                        riskGroupMap.set(user.id, userGroups.groups[0].groupName);
                    } else {
                        riskGroupMap.set(user.id, 'Unassigned');
                    }
                } catch (error) {
                    riskGroupMap.set(user.id, 'Unassigned');
                }
            })
        );
        
        setUserRiskGroups(riskGroupMap);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showActions !== null && !(event.target as Element).closest('.action-menu') && !(event.target as Element).closest('.action-menu-trigger')) {
                setShowActions(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActions]);

    const handleUserMenuClick = (userId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        setShowActions(showActions === userId ? null : userId);
    };

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        
        if (sortConfig.key === key) {
            direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        }
        
        setSortConfig({ key, direction });
    };

    const handleViewProfile = (userId: number) => {
        setSelectedUserId(userId);
        setShowProfileModal(true);
        setShowActions(null);
    };

    const handleSendEmail = (email: string) => {
        window.location.href = `mailto:${email}`;
        setShowActions(null);
    };

    const handleRowClick = (userId: number) => {
        setSelectedUserId(userId);
        setShowProfileModal(true);
    };

    const getDisplayName = (user: CombinedUserProfile): string => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        if (user.firstName) {
            return user.firstName;
        }
        if (user.lastName) {
            return user.lastName;
        }
        return user.email.split('@')[0];
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const calculateAge = (dateOfBirth: string | null): number | null => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const getTimeSinceLastLogin = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return formatDate(dateString);
    };

    const getRiskGroupBadgeClass = (groupName: string): string => {
        const lowerName = groupName.toLowerCase();
        if (lowerName.includes('high') || lowerName.includes('danger')) return 'high-risk-badge';
        if (lowerName.includes('medium') || lowerName.includes('moderate')) return 'moderate-risk-badge';
        if (lowerName.includes('low') || lowerName.includes('safe')) return 'low-risk-badge';
        if (lowerName.includes('control')) return 'control-group-badge';
        return 'unassigned-badge';
    };

    // Filter users
    const filteredUsers = users.filter(user => 
        getDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort users
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
            case 'name':
                aValue = getDisplayName(a).toLowerCase();
                bValue = getDisplayName(b).toLowerCase();
                break;
            case 'email':
                aValue = a.email.toLowerCase();
                bValue = b.email.toLowerCase();
                break;
            case 'lastLogin':
                aValue = new Date(a.lastLoginAt).getTime();
                bValue = new Date(b.lastLoginAt).getTime();
                break;
            case 'status':
                aValue = a.isActive ? 1 : 0;
                bValue = b.isActive ? 1 : 0;
                break;
            case 'createdAt':
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                break;
            case 'riskGroup':
                aValue = userRiskGroups.get(a.id) || 'Unassigned';
                bValue = userRiskGroups.get(b.id) || 'Unassigned';
                break;
            case 'age':
                aValue = calculateAge(a.dateOfBirth) || 999;
                bValue = calculateAge(b.dateOfBirth) || 999;
                break;
            case 'gender':
                aValue = a.gender?.toLowerCase() || 'z';
                bValue = b.gender?.toLowerCase() || 'z';
                break;
            default:
                return 0;
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const displayUsers = maxRows ? sortedUsers.slice(0, maxRows) : sortedUsers;

    const renderSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) {
            return (
                <svg className="sort-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 9L12 3L6 9M6 15L12 21L18 15" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        }

        return sortConfig.direction === 'asc' ? (
            <svg className="sort-icon active" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 9L12 3L6 9" stroke="#6D64D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ) : (
            <svg className="sort-icon active" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 15L12 21L18 15" stroke="#6D64D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        );
    };

    return (
        <>
            {showControls && (
                <div className="users-controls">
                    <div className="search-container">
                        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 21L16.65 16.65" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="controls-right">
                        <button className="filter-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Filter
                        </button>
                        <button className="add-user-btn">Add User</button>
                    </div>
                </div>
            )}
            
            <div className="users-table-wrapper">
                {tableTitle && (
                    <h2 className="table-title" style={{ padding: '20px 24px 0 24px', fontSize: '22px', fontWeight: 600 }}>
                        {tableTitle}
                    </h2>
                )}
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th className="sortable" onClick={() => handleSort('name')}>
                                    <div className="th-content">
                                        <span>User</span>
                                        {renderSortIcon('name')}
                                    </div>
                                </th>
                                <th className="sortable" onClick={() => handleSort('age')}>
                                    <div className="th-content">
                                        <span>Age</span>
                                        {renderSortIcon('age')}
                                    </div>
                                </th>
                                <th className="sortable" onClick={() => handleSort('gender')}>
                                    <div className="th-content">
                                        <span>Gender</span>
                                        {renderSortIcon('gender')}
                                    </div>
                                </th>
                                <th className="sortable" onClick={() => handleSort('riskGroup')}>
                                    <div className="th-content">
                                        <span>Risk Group</span>
                                        {renderSortIcon('riskGroup')}
                                    </div>
                                </th>
                                <th className="sortable" onClick={() => handleSort('lastLogin')}>
                                    <div className="th-content">
                                        <span>Last Active</span>
                                        {renderSortIcon('lastLogin')}
                                    </div>
                                </th>
                                <th className="sortable" onClick={() => handleSort('status')}>
                                    <div className="th-content">
                                        <span>Status</span>
                                        {renderSortIcon('status')}
                                    </div>
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'rgba(5, 44, 88, 0.6)' }}>
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                displayUsers.map(user => (
                                    <tr key={user.id} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(user.id)}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {getDisplayName(user).charAt(0).toUpperCase()}
                                                </div>
                                                <div className="user-info">
                                                    <div className="user-name">{getDisplayName(user)}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{calculateAge(user.dateOfBirth) || 'N/A'}</td>
                                        <td>{user.gender || 'N/A'}</td>
                                        <td>
                                            <span className={`risk-badge ${getRiskGroupBadgeClass(userRiskGroups.get(user.id) || 'Unassigned')}`}>
                                                {userRiskGroups.get(user.id) || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td>{getTimeSinceLastLogin(user.lastLoginAt)}</td>
                                        <td>
                                            <span className={`status-indicator ${user.isActive ? 'active' : 'inactive'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                className="action-menu-trigger"
                                                onClick={(e) => handleUserMenuClick(user.id, e)}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                            
                                            {showActions === user.id && (
                                                <div className="action-menu">
                                                    <ul>
                                                        <li onClick={() => handleViewProfile(user.id)}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            View Profile
                                                        </li>
                                                        <li onClick={() => handleSendEmail(user.email)}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M4 4H20C20.5304 4 21.0391 4.21071 21.4142 4.58579C21.7893 4.96086 22 5.46957 22 6V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4Z" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M22 6L12 13L2 6" stroke="#052C58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            Send Email
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showProfileModal && selectedUserId && (
                <UserProfileModal
                    userId={selectedUserId}
                    isOpen={showProfileModal}
                    onClose={() => {
                        setShowProfileModal(false);
                        setSelectedUserId(null);
                    }}
                    onDataUpdate={() => {
                        onDataUpdate?.();
                        fetchAllUserRiskGroups(); // Refresh risk groups when profile is updated
                    }}
                />
            )}
        </>
    );
};

export default UsersTable;