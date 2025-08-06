import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const useAuthCheck = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await authService.getCurrentProfile();
            } catch (error) {
                // If auth fails, clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            }
        };

        checkAuth();
    }, [navigate]);
};