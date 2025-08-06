import React, { useState } from 'react';
import { useGetPendingPayoutsQuery, useCompletePayoutMutation, useDeclinePayoutMutation, useGetAllPayoutHistoryQuery } from '@/features/api/payoutApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Loader2, Eye, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const PayoutDetailsDialog = ({ instructor }) => (
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Payout Details for {instructor.name}</DialogTitle>
            <DialogDescription>Use this information to process the payment.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4 text-sm">
            <p><strong>Account Name:</strong> {instructor.payoutDetails?.bankAccountName || 'N/A'}</p>
            <p><strong>Account Number:</strong> {instructor.payoutDetails?.bankAccountNumber || 'N/A'}</p>
            <p><strong>Bank Name:</strong> {instructor.payoutDetails?.bankName || 'N/A'}</p>
            <p><strong>Bank Branch:</strong> {instructor.payoutDetails?.bankBranchName || 'N/A'}</p>
            <p><strong>Routing Number:</strong> {instructor.payoutDetails?.routingNumber || 'N/A'}</p>
        </div>
    </DialogContent>
);

const DeclinePayoutDialog = ({ payoutId, onDecline }) => {
    const [reason, setReason] = useState('');
    return (
        <DialogContent>
            <DialogHeader><DialogTitle>Decline Payout</DialogTitle></DialogHeader>
            <div className="space-y-2">
                <Label htmlFor="reason">Reason for declining</Label>
                <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Invalid account details" />
            </div>
            <DialogFooter>
                <Button variant="destructive" onClick={() => onDecline(payoutId, reason)} disabled={!reason}>Decline</Button>
            </DialogFooter>
        </DialogContent>
    );
};

const PendingPayouts = () => {
    const { data, isLoading, isError, error } = useGetPendingPayoutsQuery();
    const [completePayout, { isLoading: isCompleting }] = useCompletePayoutMutation();
    const [declinePayout, { isLoading: isDeclining }] = useDeclinePayoutMutation();

    const handleComplete = (payoutId) => {
        toast.promise(completePayout(payoutId).unwrap(), {
            loading: 'Processing payout...',
            success: 'Payout marked as completed!',
            error: 'Failed to complete payout.'
        });
    };

    const handleDecline = (payoutId, reason) => {
        toast.promise(declinePayout({ payoutId, reason }).unwrap(), {
            loading: 'Declining payout...',
            success: 'Payout declined successfully!',
            error: (err) => err.data?.message || 'Failed to decline payout.'
        });
    };

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <p className="text-red-500">Error: {error.data?.message || "Failed to load payouts."}</p>;

    return (
        <Table>
            <TableHeader><TableRow><TableHead>Instructor</TableHead><TableHead>Amount</TableHead><TableHead>Requested At</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
                {data?.payouts.length > 0 ? data.payouts.map(payout => (
                    <TableRow key={payout._id}>
                        <TableCell>{payout.instructor.name}</TableCell>
                        <TableCell>৳{payout.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(payout.requestedAt).toLocaleString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                            <Dialog><DialogTrigger asChild><Button variant="ghost" size="icon" title="View Payout Details"><Eye className="h-4 w-4"/></Button></DialogTrigger><PayoutDetailsDialog instructor={payout.instructor} /></Dialog>
                            <Dialog><DialogTrigger asChild><Button variant="ghost" size="icon" title="Decline Payout"><XCircle className="h-4 w-4 text-red-500"/></Button></DialogTrigger><DeclinePayoutDialog payoutId={payout._id} onDecline={handleDecline} /></Dialog>
                            <Button onClick={() => handleComplete(payout._id)} disabled={isCompleting || isDeclining}>
                                {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Mark as Paid
                            </Button>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow><TableCell colSpan="4" className="text-center h-24">No pending payouts.</TableCell></TableRow>
                )}
            </TableBody>
        </Table>
    );
};

const PayoutHistory = () => {
    const { data, isLoading, isError } = useGetAllPayoutHistoryQuery();

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <p className="text-red-500">Failed to load payout history.</p>;

    return (
        <Table>
            <TableHeader><TableRow><TableHead>Instructor</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date Processed</TableHead><TableHead className="text-right">Reason</TableHead></TableRow></TableHeader>
            <TableBody>
                {data?.payouts.length > 0 ? data.payouts.map(payout => (
                    <TableRow key={payout._id}>
                        <TableCell>{payout.instructor.name}</TableCell>
                        <TableCell>৳{payout.amount.toLocaleString()}</TableCell>
                        <TableCell><Badge variant={payout.status === 'completed' ? 'default' : 'destructive'} className="capitalize">{payout.status}</Badge></TableCell>
                        <TableCell>{new Date(payout.completedAt || payout.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{payout.declineReason || 'N/A'}</TableCell>
                    </TableRow>
                )) : (
                    <TableRow><TableCell colSpan="5" className="text-center h-24">No payout history found.</TableCell></TableRow>
                )}
            </TableBody>
        </Table>
    );
};


const PayoutManagement = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Payout Management</CardTitle>
                <CardDescription>Review pending requests and view historical payout data.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="pending">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                        <TabsTrigger value="history">Payout History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending">
                        <PendingPayouts />
                    </TabsContent>
                    <TabsContent value="history">
                        <PayoutHistory />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default PayoutManagement;