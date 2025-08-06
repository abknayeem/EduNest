import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

export const SuperadminRoute = () => {
    const { isAuthenticated, user } = useSelector(store => store.auth);

    const { isLoading } = useSelector(state => state.authApi.queries['loadUser(undefined)']) || {};

    console.log("SuperadminRoute: isLoading (from RTK Query)", isLoading);
    console.log("SuperadminRoute: isAuthenticated (from Redux auth slice)", isAuthenticated);
    console.log("SuperadminRoute: user role (from Redux auth slice)", user?.role);
    console.log("SuperadminRoute: full user object", user);

    if (isLoading) {
        return <LoadingSpinner />;
    }
    if (!isAuthenticated) {
        console.log("SuperadminRoute: Redirecting to /sadmin-login - User Not Authenticated");
        return <Navigate to="/sadmin-login" />;
    }

    if (user?.role !== "superadmin") {
        console.log(`SuperadminRoute: Redirecting to / - User role is '${user?.role}', not 'superadmin'`);
        return <Navigate to="/" />;
    }
    console.log("SuperadminRoute: Access Granted - User is Superadmin");
    return <Outlet />;
};
