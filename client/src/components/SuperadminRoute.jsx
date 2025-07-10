import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

export const SuperadminRoute = () => {
    const { isAuthenticated, user } = useSelector(store => store.auth);
    const { isLoading } = useSelector(state => state.authApi.queries['loadUser(undefined)']) || {};

    if (isLoading) {
        return <LoadingSpinner />;
    }

   if (!isAuthenticated) {
        return <Navigate to="/sadmin" />;
    }

    if (user?.role !== "superadmin") {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};