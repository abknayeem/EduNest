import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVerifyEmailQuery } from '@/features/api/authApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const { data, isLoading, isSuccess, isError, error } = useVerifyEmailQuery(token);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    {isSuccess && <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />}
                    {isError && <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />}
                    <CardTitle className="text-2xl">
                        {isSuccess ? 'Email Verified!' : 'Verification Failed'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="mb-6">
                        {isSuccess && (data?.message || 'Your email has been successfully verified.')}
                        {isError && (error?.data?.message || 'An unexpected error occurred. Please try again.')}
                    </CardDescription>
                    {isSuccess ? (
                        <Link to="/login">
                            <Button>Proceed to Login</Button>
                        </Link>
                    ) : (
                        <Link to="/">
                            <Button variant="outline">Back to Home</Button>
                        </Link>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyEmail;
