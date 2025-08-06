import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const sidebarLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: 'https://global.divhunt.com/89e2a09a484e311f49d14896e2b4508c_970.svg' },
    { to: '/users', label: 'Users', icon: 'https://global.divhunt.com/c3d20b10622fe2b295cbe3086f70c4dc_2919.svg' },
    { to: '/events', label: 'Events', icon: 'https://global.divhunt.com/b95711458073b64bb1517c6c9270b592_711.svg' },
    { to: '/group-management', label: 'Group Management', icon: 'https://global.divhunt.com/029ae6c69a8ea749dc77752c52376da4_2844.svg' },
    { to: '/devices', label: 'Devices', icon: 'https://global.divhunt.com/4e4370d880c20f32b4539afd25d51526_755.svg' },
    { to: '/finance', label: 'Finance', icon: 'https://global.divhunt.com/40fd43526f922ef6aed2e509821d63d3_1563.svg' },
    { to: '/analytics', label: 'Analytics', icon: 'https://global.divhunt.com/b95711458073b64bb1517c6c9270b592_711.svg' },
    { to: '/diary-analysis', label: 'Diary Analysis', icon: 'https://global.divhunt.com/4baefdb43ce86c4ae225742edfb8eaab_2025.svg' },
];

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showDropdown && !(event.target as Element).closest('.user-dropdown-container')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleLogout = () => {
        showNotification('info', 'Logging out...', 'You are being logged out');
        setTimeout(() => {
            logout();
        }, 1000);
    };

    const getUserInitials = (name: string, email: string) => {
        if (name && name.trim()) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return email ? email[0].toUpperCase() : 'U';
    };

    return (
        <div className="sidebar hamburger">
            <div className="sidebar-inside">
                <div className="sticky">
                    <div className="user-dropdown-container">
                        <div 
                            className="user-info-top compact clickable"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            {user ? (
                                <>
                                    <div className="user-avatar">
                                        {getUserInitials(user.name || '', user.email || '')}
                                    </div>
                                    <div className="user-info-text">
                                        <span className="user-title">
                                            {user.name || 'User'}
                                        </span>
                                        <span className="user-mail">
                                            {user.email || 'No email'}
                                        </span>
                                    </div>
                                    <svg className={`dropdown-arrow ${showDropdown ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </>
                            ) : (
                                <>
                                    <div className="user-avatar">G</div>
                                    <div className="user-info-text">
                                        <span className="user-title">Guest User</span>
                                        <span className="user-mail">Not logged in</span>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {showDropdown && (
                            <div className="user-dropdown animate-fade-in">
                                <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C10.7909 3 8 4.79086 8 7C8 9.20914 10.7909 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Profile Settings
                                </button>
                                <button className="dropdown-item" onClick={() => navigate('/settings')}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M19.4 15C19.2669 15.3016 19.2245 15.6362 19.2779 15.9606C19.3313 16.2851 19.4784 16.5862 19.7 16.83L19.76 16.89C19.9373 17.0657 20.0786 17.2739 20.1763 17.5023C20.2741 17.7308 20.3267 17.9752 20.3314 18.2227C20.3362 18.4703 20.293 18.7165 20.2041 18.9486C20.1151 19.1807 19.9819 19.3942 19.811 19.577C19.6401 19.7598 19.4345 19.9089 19.2057 20.0165C18.9768 20.124 18.7287 20.1877 18.4755 20.2044C18.2223 20.2211 17.9684 20.1906 17.7273 20.1144C17.4863 20.0382 17.2626 19.9179 17.068 19.76L17.008 19.7C16.7643 19.4784 16.4632 19.3313 16.1388 19.2779C15.8143 19.2245 15.4797 19.2669 15.178 19.4C14.8821 19.5268 14.6254 19.7287 14.4343 19.9842C14.2432 20.2397 14.1244 20.5398 14.09 20.855V21C14.09 21.5304 13.8793 22.0391 13.5042 22.4142C13.1291 22.7893 12.6204 23 12.09 23C11.5596 23 11.0509 22.7893 10.6758 22.4142C10.3007 22.0391 10.09 21.5304 10.09 21V20.93C10.0701 20.6016 9.95696 20.2848 9.76331 20.0157C9.56966 19.7466 9.30268 19.5358 9 19.41C8.69825 19.2769 8.36368 19.2345 8.03922 19.2879C7.71477 19.3413 7.41373 19.4884 7.17 19.71L7.11 19.77C6.91581 19.9273 6.68903 20.0476 6.44247 20.1238C6.19591 20.2 5.93436 20.2305 5.67117 20.2138C5.40798 20.1971 5.14826 20.1334 4.90643 20.0259C4.6646 19.9183 4.445 19.7692 4.25939 19.5866C4.07378 19.404 3.92532 19.1915 3.82099 18.9607C3.71667 18.7299 3.65805 18.4852 3.64744 18.2377C3.63684 17.9901 3.67434 17.7441 3.75807 17.5125C3.84179 17.2808 3.97018 17.0681 4.136 16.886L4.196 16.826C4.41765 16.5823 4.56476 16.2812 4.61806 15.9568C4.67136 15.6323 4.62893 15.2977 4.496 14.996C4.36918 14.7002 4.16726 14.4434 3.91169 14.2523C3.65612 14.0612 3.35598 13.9424 3.041 13.908H2.9C2.36957 13.908 1.86086 13.6973 1.48579 13.3222C1.11071 12.9471 0.9 12.4384 0.9 11.908C0.9 11.3776 1.11071 10.8689 1.48579 10.4938C1.86086 10.1187 2.36957 9.908 2.9 9.908H2.97C3.29846 9.88812 3.61525 9.77488 3.88487 9.58126C4.15449 9.38764 4.36582 9.12068 4.495 8.81C4.62807 8.50825 4.6705 8.17368 4.61706 7.84922C4.56363 7.52477 4.41652 7.22373 4.195 6.98L4.135 6.92C3.95736 6.74581 3.81596 6.53903 3.71884 6.31247C3.62172 6.08591 3.57054 5.84436 3.56783 5.60117C3.56513 5.35798 3.61094 5.11826 3.70301 4.89643C3.79508 4.6746 3.93139 4.475 4.10361 4.30939C4.27584 4.14378 4.48028 4.01532 4.70487 3.93099C4.92945 3.84667 5.16969 3.80805 5.41223 3.81744C5.65477 3.82684 5.89443 3.88434 6.11752 3.98668C6.34061 4.08901 6.54263 4.23436 6.712 4.416L6.772 4.476C7.01573 4.69765 7.31677 4.84476 7.64123 4.89806C7.96568 4.95136 8.30025 4.90893 8.602 4.776C8.89783 4.64918 9.15446 4.44726 9.34557 4.19169C9.53668 3.93612 9.65557 3.63598 9.69 3.321V3.18C9.69 2.64957 9.90071 2.14086 10.2758 1.76579C10.6509 1.39071 11.1596 1.18 11.69 1.18C12.2204 1.18 12.7291 1.39071 13.1042 1.76579C13.4793 2.14086 13.69 2.64957 13.69 3.18V3.25C13.7244 3.56502 13.8433 3.86516 14.0344 4.12073C14.2255 4.3763 14.4821 4.57822 14.778 4.705C15.0797 4.83807 15.4143 4.8805 15.7388 4.82706C16.0632 4.77363 16.3643 4.62652 16.608 4.405L16.668 4.345C16.8422 4.16736 17.049 4.02596 17.2756 3.92884C17.5021 3.83172 17.7437 3.78054 17.9868 3.77784C18.23 3.77513 18.4697 3.82094 18.6936 3.91301C18.9174 4.00508 19.121 4.14139 19.2966 4.31361C19.4723 4.48584 19.6207 4.69028 19.735 4.91487C19.8493 5.13945 19.9279 5.38019 19.9384 5.62273C19.949 5.86527 19.8915 6.10443 19.7693 6.32099C19.6472 6.53755 19.4636 6.72613 19.23 6.87L19.17 6.93C18.9484 7.17373 18.8013 7.47477 18.7479 7.79922C18.6945 8.12368 18.7369 8.45825 18.87 8.76C18.9968 9.05582 19.1987 9.31246 19.4542 9.50357C19.7097 9.69468 20.0098 9.81357 20.325 9.848H20.47C21.0004 9.848 21.5091 10.0587 21.8842 10.4338C22.2593 10.8089 22.47 11.3176 22.47 11.848C22.47 12.3784 22.2593 12.8871 21.8842 13.2622C21.5091 13.6373 21.0004 13.848 20.47 13.848H20.4C20.0849 13.8824 19.7848 14.0013 19.5292 14.1924C19.2737 14.3835 19.0718 14.6401 18.945 14.936V14.936Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Settings
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout-item" onClick={handleLogout}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                
                </div>
                
                <div className="sidebar-links-wrapper">
                    {sidebarLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`sidebar-link${location.pathname.startsWith(link.to) ? ' sidebar-link-active' : ''}`}
                        >
                            <img src={link.icon} loading="lazy" alt="" />
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
            <img src="https://global.divhunt.com/8ca0135b676e12de7e510e50caeee915_79012.avif" loading="lazy" alt="" className="sidebar-image" />
        </div>
    </div>
    );
};

export default Sidebar;