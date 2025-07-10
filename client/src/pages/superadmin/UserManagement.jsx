import React, { useState, useMemo } from 'react';
import { 
    useGetAllUsersQuery, 
    useUpdateUserRoleMutation, 
    useCreateUserByAdminMutation, 
    useDeleteUserMutation,
    useRefuseInstructorRequestMutation,
    useUpdateUserStatusMutation
} from '@/features/api/adminApi';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Loader2, Trash2, Eye, Info, XCircle } from "lucide-react";

const checkEligibility = (user) => {
    const missingFields = [];
    if (!user.isVerified) missingFields.push("Email not verified");
    if (!user.photoUrl) missingFields.push("Profile Photo");
    if (!user.alternativeNumber) missingFields.push("Phone Number");
    if (!user.education) missingFields.push("Education");
    if (!user.occupation) missingFields.push("Occupation");
    return {
        isEligible: missingFields.length === 0,
        missingFields: missingFields,
    };
};

const RoleSelector = ({ user, onUpdateRole, isEligible }) => {
    const handleRoleChange = (newRole) => {
        if (newRole !== user.role) {
            if (!isEligible && newRole === 'instructor') {
                toast.error("User is not eligible due to an incomplete profile.");
                return;
            }
            onUpdateRole({ userId: user._id, role: newRole });
        }
    };

    return (
        <Select defaultValue={user.role} onValueChange={handleRoleChange}>
             <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor" disabled={!isEligible}>
                    Instructor
                </SelectItem>
            </SelectContent>
        </Select>
    );
};

const UserManagement = () => {
    const { data, isLoading, isError, error } = useGetAllUsersQuery();
    const [updateUserRole] = useUpdateUserRoleMutation();
    const [createUser, { isLoading: isCreating }] = useCreateUserByAdminMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
    const [refuseRequest, { isLoading: isRefusing }] = useRefuseInstructorRequestMutation();
    const [updateUserStatus] = useUpdateUserStatusMutation();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter');

    const handleUpdateRole = async ({ userId, role }) => {
        const promise = updateUserRole({ userId, role }).unwrap();
        toast.promise(promise, {
            loading: 'Updating user role...',
            success: (data) => data.message,
            error: (err) => err.data?.message || 'Failed to update role.',
        });
    };

    const handleStatusChange = (user, newStatus) => {
        const promise = updateUserStatus({ userId: user._id, isDisabled: newStatus }).unwrap();
        toast.promise(promise, {
            loading: `Updating status for ${user.name}...`,
            success: (data) => data.message,
            error: (err) => err.data?.message || 'Failed to update status.',
        });
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            toast.error("Please fill all fields.");
            return;
        }
        const promise = createUser(newUser).unwrap();
        toast.promise(promise, {
            loading: 'Creating user...',
            success: (data) => {
                setIsDialogOpen(false);
                setNewUser({ name: '', email: '', password: '', role: 'student' });
                return data.message;
            },
            error: (err) => err.data?.message || 'Failed to create user.',
        });
    };

    const handleDeleteUser = (user) => {
        const promise = deleteUser(user._id).unwrap();
        toast.promise(promise, {
            loading: `Deleting ${user.name}...`,
            success: (data) => data.message,
            error: (err) => err.data?.message || 'Failed to delete user.',
        });
    };

    const handleRefuseRequest = (user) => {
        const promise = refuseRequest(user._id).unwrap();
        toast.promise(promise, {
            loading: `Refusing application for ${user.name}...`,
            success: (data) => data.message,
            error: (err) => err.data?.message || 'Failed to refuse application.',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };
    
    const handleRoleSelect = (value) => {
        setNewUser(prev => ({ ...prev, role: value }));
    };

    const filteredUsers = useMemo(() => {
        if (!data?.users) return [];
        // Filter out superadmin so they don't appear in the list
        return (data.users || [])
            .filter(user => user.role !== 'superadmin')
            .filter(user =>
                (filter === 'pending' ? user.instructorApplicationStatus === 'pending' : true) &&
                (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [data, searchTerm, filter]);

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <div className="text-red-500 p-4">Error: {error.data?.message || "Failed to load users."}</div>;

    return (
         <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                            {filter === 'pending' ? "Showing all pending instructor requests." : "View all students and instructors and manage their status."}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <Input
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64"
                        />
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4"/> Create User
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-1"><Label htmlFor="name">Name</Label><Input id="name" name="name" value={newUser.name} onChange={handleInputChange} /></div>
                                    <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={newUser.email} onChange={handleInputChange} /></div>
                                    <div className="space-y-1"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" value={newUser.password} onChange={handleInputChange} /></div>
                                    <div className="space-y-1">
                                        <Label htmlFor="role">Role</Label>
                                        <Select value={newUser.role} onValueChange={handleRoleSelect}>
                                            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="student">Student</SelectItem>
                                                <SelectItem value="instructor">Instructor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateUser} disabled={isCreating}>{isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Create'}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
             <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Eligibility</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                            const eligibility = checkEligibility(user);
                            return (
                                <TableRow key={user._id} className={user.isDisabled ? 'bg-red-900/20' : ''}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.photoUrl} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                {user.instructorApplicationStatus === 'pending' && (
                                                    <Badge variant="outline" className="w-fit text-amber-600 border-amber-500">Instructor Request</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary" className="capitalize">{user.role}</Badge></TableCell>
                                    <TableCell>
                                        {user.role === 'student' ? (
                                            eligibility.isEligible ? (
                                                <Badge className="bg-green-600 hover:bg-green-700">Eligible</Badge>
                                            ) : (
                                                <div className="flex items-center gap-1" title={`Missing: ${eligibility.missingFields.join(', ')}`}>
                                                    <Badge variant="destructive">Incomplete</Badge>
                                                    <Info className="h-4 w-4 text-gray-500" />
                                                </div>
                                            )
                                        ) : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={!user.isDisabled}
                                                onCheckedChange={(checked) => handleStatusChange(user, !checked)}
                                                id={`status-switch-${user._id}`}
                                            />
                                            <Label htmlFor={`status-switch-${user._id}`}>{user.isDisabled ? 'Disabled' : 'Enabled'}</Label>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center space-x-2">
                                        {user.role === 'student' && <RoleSelector user={user} onUpdateRole={handleUpdateRole} isEligible={eligibility.isEligible} />}
                                        
                                        {user.instructorApplicationStatus === 'pending' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={isRefusing} title="Refuse Request">
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Refuse Instructor Application?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will reject the application from "{user.name}" and reset their status. They will be able to apply again later. Are you sure?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleRefuseRequest(user)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Yes, Refuse
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                        
                                        <Link to={`/sadmin/users/${user._id}/details`}>
                                            <Button variant="outline" size="icon" title="View Details"><Eye className="h-4 w-4" /></Button>
                                        </Link>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" disabled={isDeleting} title="Delete User"><Trash2 className="h-4 w-4 text-red-500" /></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the user "{user.name}". This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan="5" className="text-center h-24">No users found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
             </CardContent>
        </Card>
    );
};

export default UserManagement;