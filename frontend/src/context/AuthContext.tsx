import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserPersona {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar: string;
}

export const PRESET_PERSONAS: UserPersona[] = [
  {
    id: 'user-emp-1',
    employee_id: 'EMP-000001',
    name: 'Alex Smith',
    email: 'alex.smith.000001@techcorp.synthetic',
    role: 'EMPLOYEE',
    title: 'Senior Backend Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-mgr-2',
    employee_id: 'EMP-000002',
    name: 'Jordan Johnson',
    email: 'jordan.johnson.000002@techcorp.synthetic',
    role: 'MANAGER',
    title: 'Engineering Manager (Squad Lead)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-hr-3',
    employee_id: 'EMP-000003',
    name: 'Sarah Connor',
    email: 'sarah.connor.000003@techcorp.synthetic',
    role: 'HR_PARTNER',
    title: 'HR People & Compliance Partner',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-ops-4',
    employee_id: 'EMP-000004',
    name: 'Marcus Vance',
    email: 'marcus.vance.000004@techcorp.synthetic',
    role: 'IT_OPS_PARTNER',
    title: 'IT & Cloud Operations Partner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-admin-5',
    employee_id: 'EMP-000005',
    name: 'Devon Lee',
    email: 'devon.lee.000005@techcorp.synthetic',
    role: 'ADMIN',
    title: 'Workforce System Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
  }
];

interface AuthContextType {
  currentUser: UserPersona;
  setCurrentUser: (user: UserPersona) => void;
  switchRole: (role: UserRole) => void;
  hasRole: (allowed: UserRole[]) => boolean;
  logout: () => void;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserPersona>(() => {
    const saved = localStorage.getItem('wf_active_persona');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return PRESET_PERSONAS[4]; // Default to Administrator for rich demo experience
  });

  useEffect(() => {
    localStorage.setItem('wf_active_persona', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    const persona = PRESET_PERSONAS.find(p => p.role === role) || PRESET_PERSONAS[0];
    setCurrentUser(persona);
  };

  const hasRole = (allowed: UserRole[]) => {
    return allowed.includes(currentUser.role) || currentUser.role === 'ADMIN';
  };

  const logout = () => {
    setCurrentUser(PRESET_PERSONAS[0]);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      switchRole,
      hasRole,
      logout,
      isConfigured: isSupabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

