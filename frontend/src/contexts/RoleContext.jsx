import React, { createContext, useContext, useState } from 'react';

export const ROLES = {
    DONOR: 'donor',
    CORPORATE: 'corporate',
    RIDER: 'rider',
    NGO: 'ngo',
    ADMIN: 'admin',
    COMMUNITY: 'community',
    SPONSOR: 'sponsor',
};

export const DEMO_USERS = {
    donor: {
        name: 'Priya Sharma',
        role: 'donor',
        avatar: '🍱',
        email: 'priya@greatindiankitchen.in',
        karma: 480,
        badge: 'Food Champion',
        org: 'Great Indian Kitchen',
    },
    corporate: {
        name: 'Rohit Mehta',
        role: 'corporate',
        avatar: '🏢',
        email: 'rohit@infosys.com',
        karma: 2200,
        badge: 'CSR Champion',
        org: 'Infosys Canteen',
    },
    rider: {
        name: 'Arjun Verma',
        role: 'rider',
        avatar: '🛵',
        email: 'arjun@rider.resqai.in',
        karma: 1340,
        badge: 'Food Hero',
        org: null,
    },
    ngo: {
        name: 'Meera Nair',
        role: 'ngo',
        avatar: '🤝',
        email: 'meera@aksharapatra.org',
        karma: 890,
        badge: 'Community Angel',
        org: 'Akshara Patra Foundation',
    },
    admin: {
        name: 'Admin',
        role: 'admin',
        avatar: '⚡',
        email: 'admin@resqai.in',
        karma: 9999,
        badge: 'System Admin',
        org: 'ResQ-AI HQ',
    },
    community: {
        name: 'Dev Kapoor',
        role: 'community',
        avatar: '🌟',
        email: 'dev@community.resqai.in',
        karma: 320,
        badge: 'Community Member',
        org: null,
    },
    sponsor: {
        name: 'Ananya Iyer',
        role: 'sponsor',
        avatar: '💎',
        email: 'ananya@tata.com',
        karma: 5500,
        badge: 'Platinum Sponsor',
        org: 'Tata Group CSR',
    },
};

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
    const [currentRole, setCurrentRole] = useState(() => {
        const stored = localStorage.getItem('resq_user');
        if (stored) {
            try { return JSON.parse(stored).role; } catch (e) { }
        }
        return 'donor';
    });

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('resq_user');
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { }
        }
        return DEMO_USERS['donor']; // Fallback
    });

    const switchRole = (role) => {
        setCurrentRole(role);
        if (!localStorage.getItem('resq_token') && DEMO_USERS[role]) {
            setUser(DEMO_USERS[role]);
        }
    };

    const loginUser = (userData) => {
        setUser(userData);
        setCurrentRole(userData.role || 'donor');
    };

    const logoutUser = () => {
        setUser(DEMO_USERS['donor']); // Fallback to demo
        setCurrentRole('donor');
        localStorage.removeItem('resq_user');
        localStorage.removeItem('resq_token');
    };

    const getDashboardPath = (role = currentRole) => {
        const paths = {
            donor: '/dashboard/donor',
            corporate: '/dashboard/corporate',
            rider: '/dashboard/rider',
            ngo: '/dashboard/ngo',
            admin: '/dashboard/admin',
            community: '/community',
            sponsor: '/dashboard/corporate',
        };
        return paths[role] || '/';
    };

    return (
        <RoleContext.Provider value={{ currentRole, user, switchRole, loginUser, logoutUser, getDashboardPath, ROLES }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const ctx = useContext(RoleContext);
    if (!ctx) throw new Error('useRole must be used within RoleProvider');
    return ctx;
}
