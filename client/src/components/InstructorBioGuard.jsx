import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const InstructorBioGuard = ({ children }) => {
    const { user, isAuthenticated } = useSelector(store => store.auth);
    const { isLoading } = useSelector(state => state.authApi.queries['loadUser(undefined)']) || {};
    const location = useLocation();
    
    if (isLoading) {
        return <LoadingSpinner />;
    }
    const isInstructorWithNoBio = isAuthenticated && user?.role === 'instructor' && !user.bio;
    const isAllowedPath = location.pathname === '/profile';
    if (isInstructorWithNoBio && !isAllowedPath) {
        return <Navigate to="/profile" state={{ from: location, reason: 'bio_required' }} replace />;
    }
    return children;
};

export default InstructorBioGuard;
