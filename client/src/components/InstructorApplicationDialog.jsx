import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRequestInstructorRoleMutation, useVerifyPasswordMutation } from '@/features/api/authApi';
import { closeDialog } from '@/features/instructorApplicationSlice';

const InstructorApplicationDialog = () => {
    const dispatch = useDispatch();
    const { isDialogOpen } = useSelector(state => state.instructorApplication);
    const [password, setPassword] = useState('');
    
    const [requestRole, { isLoading: isRequestingRole }] = useRequestInstructorRoleMutation();
    const [verifyPassword, { isLoading: isVerifyingPassword }] = useVerifyPasswordMutation();
    const isLoading = isRequestingRole || isVerifyingPassword;

    const handleConfirmApplication = async () => {
        if (!password) {
            toast.error("Please enter your password.");
            return;
        }
        
        try {
            await verifyPassword({ password }).unwrap();
            const requestResult = await requestRole().unwrap();
            
            toast.success(requestResult.message || "Your request has been submitted!");
            handleClose();
        } catch (err) {
            toast.error(err.data?.message || "An error occurred. Please try again.");
        }
    };

    const handleClose = () => {
        setPassword('');
        dispatch(closeDialog());
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm Your Identity</DialogTitle>
                    <DialogDescription>
                    To proceed with your instructor application, please enter your password.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password-confirm" className="text-right">
                        Password
                    </Label>
                    <Input
                        id="password-confirm"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="col-span-3"
                        placeholder="••••••••"
                    />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleConfirmApplication} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm & Apply
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InstructorApplicationDialog;