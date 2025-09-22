import React, { useState, useEffect } from 'react';
import { userService, CombinedUserProfile } from '../services/userService';
import { riskGroupService } from '../services/riskGroupService';
import { useNotification } from '../contexts/NotificationContext';

interface AddUserToGroupModalProps {
    groupId: number;
    groupName: string;
    isOpen: boolean;
    onClose: () => void;
    onUserAdded: () => void;
}

const AddUserToGroupModal: React.FC<AddUserToGroupModalProps> = ({ 
    groupId, 
    groupName, 
    isOpen, 
    onClose, 
    onUserAdded 
}) => {
    const [users, setUsers] = useState<CombinedUserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        if (isOpen) {
            fetchAvailableUsers();
            setSearchTerm('');
        }
    }, [isOpen, groupId]);

    const fetchAvailableUsers = async () => {
        try {
            setIsLoading(true);
            // Get all users
            const allUsers = await userService.getCombinedUserProfiles();
            
            // Get current group members
            const groupMembers = await riskGroupService.getRiskGroupMembers(groupId, { limit: 1000 });
            const memberIds = new Set(groupMembers.data.map(member => member.id));
            
            // Filter out users already in the group
            const availableUsers = allUsers.filter(user => !memberIds.has(user.id));
            setUsers(availableUsers);
        } catch (error) {
            showNotification('error', 'Failed to load users', error instanceof Error ? error.message : 'Please try again');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async (userId: number, userName: string) => {
        try {
            setIsAdding(true);
            await riskGroupService.addUserToGroup(groupId, userId);
            showNotification('success', 'User added', `${userName} has been added to ${groupName}`);
            
            // Remove user from available list
            setUsers(prev => prev.filter(user => user.id !== userId));
            onUserAdded();
        } catch (error) {
            showNotification('error', 'Failed to add user', error instanceof Error ? error.message : 'Please try again');
        } finally {
            setIsAdding(false);
        }
    };

    const getDisplayName = (user: CombinedUserProfile): string => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        if (user.firstName) return user.firstName;
        if (user.lastName) return user.lastName;
        return user.email.split('@')[0];
    };

    const filteredUsers = users.filter(user =>
        getDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content add-user-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Add User to {groupName}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                <div className="modal-content-body">
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

                    {isLoading ? (
                        <div className="loading-section">
                            <div className="loading-spinner"></div>
                            <p>Loading available users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="no-users">
                            <p>{searchTerm ? 'No users found matching your search' : 'No users available to add'}</p>
                        </div>
                    ) : (
                        <div className="users-list">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="user-item">
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {getDisplayName(user).charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-details">
                                            <span className="user-name">{getDisplayName(user)}</span>
                                            <span className="user-email">{user.email}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="add-user-btn"
                                        onClick={() => handleAddUser(user.id, getDisplayName(user))}
                                        disabled={isAdding}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default AddUserToGroupModal;