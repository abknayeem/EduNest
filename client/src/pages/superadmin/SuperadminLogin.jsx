import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginUserMutation } from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const SuperadminLogin = () => {
    const [loginInput, setLoginInput] = useState({ email: "", password: "" });
    const [loginUser, { data, error, isLoading, isSuccess }] = useLoginUserMutation();
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();

    const changeInputHandler = (e) => {
        const { name, value } = e.target;
        setLoginInput({ ...loginInput, [name]: value });
    };

    const handleLogin = async () => {
        await loginUser(loginInput);
    };

    useEffect(() => {
        if (isSuccess && data) {
            if (data.user?.role === 'superadmin') {
                toast.success(data.message || "Login Successful.");
                navigate("/sadmin/dashboard");
            } else {
                toast.error("Access Denied. Not a superadmin account.");
                navigate("/");
            }
        }
        if (error) {
            toast.error(error.data?.message || "Login Failed.");
        }
    }, [isSuccess, data, error, navigate]);

   useEffect(() => {
        if (user?.role === 'superadmin') {
            navigate('/sadmin/dashboard');
        }
    }, [user, navigate]);


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <h1 className="text-3xl font-bold mb-4">EduNest Superadmin</h1>
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Admin Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the admin dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={loginInput.email}
                            placeholder="admin@mail.com"
                            onChange={changeInputHandler}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={loginInput.password}
                            placeholder="••••••••••"
                            onChange={changeInputHandler}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button disabled={isLoading} onClick={handleLogin} className="w-full">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                            </>
                        ) : (
                            "Login"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SuperadminLogin;