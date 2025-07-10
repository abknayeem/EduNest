import React, { useState, useEffect } from 'react';
import { useForgotPasswordMutation } from '@/features/api/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [forgotPassword, { isLoading, isSuccess, data, isError, error }] = useForgotPasswordMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address.');
            return;
        }
        await forgotPassword({ email });
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data.message);
        }
        if (isError) {
            toast.error(error.data?.message || 'Failed to send reset link.');
        }
    }, [isSuccess, isError, data, error]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>Enter your email address and we'll send you a link to reset your password.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={isLoading || isSuccess}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading || isSuccess}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                        </Button>
                        <Link to="/login" className="w-full">
                            <Button variant="outline" className="w-full flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Button>
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default ForgotPassword;
