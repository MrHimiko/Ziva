const API_BASE_URL = 'https://ziva-health.netlify.app';

export interface BiometricResponse {
    mean: number;
    min: number;
    max: number;
    count: number;
    stdDev?: number; // Make it optional since it might not be in all responses
}

export interface BiometricParams {
    startDate: string;
    endDate: string;
    limit?: number;
    offset?: number;
}

export const biometricService = {
    async getHRV(params: BiometricParams): Promise<BiometricResponse> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_BASE_URL}/api/v1/biometric/hrv?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch HRV data');
        }

        return response.json();
    },

    async getBPM(params: BiometricParams): Promise<BiometricResponse> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_BASE_URL}/api/v1/biometric/bpm?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch BPM data');
        }

        return response.json();
    },

    async getSPO2(params: BiometricParams): Promise<BiometricResponse> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_BASE_URL}/api/v1/biometric/spo2?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch SPO2 data');
        }

        return response.json();
    },

    async getBatteryLevel(params: BiometricParams): Promise<BiometricResponse> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_BASE_URL}/api/v1/biometric/battery-level?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch battery level data');
        }

        return response.json();
    },

    async hasRecentActivity(profileId: number, hours: number = 24): Promise<boolean> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        try {
            const endDate = new Date().toISOString();
            const startDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
            
            const params = { startDate, endDate, limit: 1 };
            
            // Check if any biometric data exists in the timeframe
            const [hrvResult] = await Promise.allSettled([
                this.getHRV(params)
            ]);
            
            return hrvResult.status === 'fulfilled' && hrvResult.value.count > 0;
        } catch {
            return false;
        }
    }
};