const API_BASE_URL = 'https://ziva-health.netlify.app';

export interface Device {
    id: string;
    name: string;
    localName: string;
    manufacturerData: string;
    rssi: number;
    mtu: number;
    isConnectable: boolean;
    serviceUUIDs: string[] | null;
    overflowServiceUUIDs: string[] | null;
    solicitedServiceUUIDs: string[] | null;
    rawScanRecord: string;
    createdAt: string;
    updatedAt: string;
    lastSyncAt: string;
}

export const deviceService = {
    async getAllDevices(): Promise<Device[]> {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/biometric/devices`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch devices');
        }

        return response.json();
    }
};