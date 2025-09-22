const API_BASE_URL = 'https://ziva-health.netlify.app';

export interface RiskGroup {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    memberCount?: number;
}

export interface RiskGroupMember {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    age: number;
    addedAt: string;
    addedBy: number;
    isActive: boolean;
}

export interface RiskGroupMembersResponse {
    data: RiskGroupMember[];
    total: number;
    offset: number;
    limit: number;
    totalPages: number;
}

export interface UserRiskGroups {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    groups: {
        groupId: number;
        groupName: string;
        createdAt: string;
        addedBy: number;
    }[];
}

export interface CreateRiskGroupRequest {
    name: string;
    description: string;
}

export interface UpdateRiskGroupRequest {
    name?: string;
    description?: string;
}

export interface RiskGroupMembersParams {
    sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    search?: string;
}

export const riskGroupService = {
    async createRiskGroup(data: CreateRiskGroupRequest): Promise<{ message: string }> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/risk-group/risk-groups`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to create risk group');
        }

        return response.json();
    },

    async getAllRiskGroups(): Promise<RiskGroup[]> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/risk-group/risk-groups`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch risk groups');
            }

            const data = await response.json();
            
            // Ensure we always return an array
            if (Array.isArray(data)) {
                return data;
            } else if (data && Array.isArray(data.data)) {
                return data.data;
            } else {
                console.warn('Risk groups API returned unexpected format:', data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching risk groups:', error);
            return []; // Return empty array on error
        }
    },

    async getRiskGroup(id: number): Promise<RiskGroup> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/risk-group/risk-groups/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch risk group');
        }

        return response.json();
    },

    async updateRiskGroup(id: number, data: UpdateRiskGroupRequest): Promise<{ message: string }> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/risk-group/risk-groups/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to update risk group');
        }

        return response.json();
    },

    async deleteRiskGroup(id: number): Promise<{ message: string }> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/risk-group/risk-groups/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete risk group');
        }

        return response.json();
    },

    async addUserToGroup(groupId: number, userId: number): Promise<{ message: string }> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/risk-group/risk-groups/${groupId}/members/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to add user to group');
        }

        return response.json();
    },

    async removeUserFromGroup(groupId: number, userId: number): Promise<{ message: string }> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/risk-group/risk-groups/${groupId}/members/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to remove user from group');
        }

        return response.json();
    },

    async getRiskGroupMembers(groupId: number, params?: RiskGroupMembersParams): Promise<RiskGroupMembersResponse> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const url = `${API_BASE_URL}/api/v1/risk-group/risk-groups/${groupId}/members${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch risk group members');
            }

            const data = await response.json();
            
            // Ensure proper response format
            if (data && Array.isArray(data.data)) {
                return data;
            } else {
                return {
                    data: [],
                    total: 0,
                    offset: 0,
                    limit: params?.limit || 100,
                    totalPages: 0
                };
            }
        } catch (error) {
            console.error('Error fetching group members:', error);
            return {
                data: [],
                total: 0,
                offset: 0,
                limit: params?.limit || 100,
                totalPages: 0
            };
        }
    },

    async getUserRiskGroups(userId: number): Promise<UserRiskGroups> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/risk-group/users/${userId}/risk-groups`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user risk groups');
        }

        return response.json();
    }
};