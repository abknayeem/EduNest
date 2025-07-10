import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, AlertCircle } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useGetTransactionHistoryQuery,
} from "@/features/api/authApi";
import { toast } from "sonner";

const Profile = () => {
  const { data: userData, isLoading: isUserLoading, refetch } = useLoadUserQuery();
  const user = userData?.user;
  const location = useLocation();
  const bioRequired = location.state?.reason === 'bio_required';

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-10">
        <h1>User not found. Please try logging in again.</h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <Avatar className="h-28 w-28 border-4 border-white dark:border-gray-800 shadow-lg">
          <AvatarImage src={user?.photoUrl} alt={user.name} />
          <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <Badge variant="outline" className="mt-2 text-sm capitalize">
            {user.role}
          </Badge>
        </div>
      </div>

      {bioRequired && (
        <div className="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 p-4 mb-6 rounded-md" role="alert">
            <div className="flex">
                <div className="py-1"><AlertCircle className="h-5 w-5 text-blue-500 mr-3"/></div>
                <div>
                    <p className="font-bold">Welcome, Instructor!</p>
                    <p className="text-sm">Please complete your profile by adding a bio before you can access the rest of the platform.</p>
                </div>
            </div>
        </div>
      )}

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account Details</TabsTrigger>
          <TabsTrigger value="transactions">Transactions History</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountDetails user={user} onUpdate={refetch} />
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionsHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AccountDetails = ({ user, onUpdate }) => {
  const [updateUser, { isLoading: isUpdatingProfile }] = useUpdateUserMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [info, setInfo] = useState({});
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setInfo({
      name: user.name || "",
      alternativeNumber: user.alternativeNumber || "",
      gender: user.gender || "",
      age: user.age || "",
      occupation: user.occupation || "",
      education: user.education || "",
      institute: user.institute || "",
      address: user.address || "",
      bio: user.bio || "",
    });
  }, [user]);

  const handleInfoChange = (e) => setInfo({ ...info, [e.target.name]: e.target.value });
  const handleSelectChange = (name, value) => setInfo({ ...info, [name]: value });
  const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });
  
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
    }
  };

  const handleUpdateInformation = async () => {
    const formData = new FormData();
    for(const key in info) {
        formData.append(key, info[key]);
    }
    if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
    }

    toast.promise(updateUser(formData).unwrap(), {
        loading: "Updating information...",
        success: (data) => {
            onUpdate();
            setProfilePhoto(null);
            return data.message;
        },
        error: (err) => err.data?.message || "Failed to update."
    });
  };

  const handleChangePassword = async () => {
    if(passwords.newPassword !== passwords.confirmPassword) {
        toast.error("New passwords do not match.");
        return;
    }
    toast.promise(changePassword({oldPassword: passwords.oldPassword, newPassword: passwords.newPassword}).unwrap(), {
        loading: "Changing password...",
        success: (data) => {
            setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
            return data.message;
        },
        error: (err) => err.data?.message || "Failed to change password."
    });
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Update your personal and educational details here.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
                <AvatarImage src={profilePhoto ? URL.createObjectURL(profilePhoto) : user.photoUrl} />
                <AvatarFallback>{info.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden"/>
            <Button variant="outline" onClick={() => fileInputRef.current.click()}>
                 <Camera className="mr-2 h-4 w-4"/>
                Change Photo
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1"><Label htmlFor="name">Full Name</Label><Input id="name" name="name" value={info.name} onChange={handleInfoChange} /></div>
          <div className="space-y-1"><Label htmlFor="alternativeNumber">Phone Number</Label><Input id="alternativeNumber" name="alternativeNumber" value={info.alternativeNumber} onChange={handleInfoChange} /></div>
          <div className="space-y-1"><Label htmlFor="gender">Gender</Label><Select name="gender" value={info.gender} onValueChange={(value) => handleSelectChange('gender', value)}><SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
          <div className="space-y-1"><Label htmlFor="age">Age</Label><Input id="age" name="age" type="number" value={info.age} onChange={handleInfoChange} /></div>
           <div className="space-y-1"><Label htmlFor="occupation">Current Occupation</Label><Input id="occupation" name="occupation" value={info.occupation} onChange={handleInfoChange} /></div>
           <div className="space-y-1 md:col-span-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" value={info.address} onChange={handleInfoChange} /></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-1"><Label htmlFor="education">Educational Background</Label><Select name="education" value={info.education} onValueChange={(value) => handleSelectChange('education', value)}><SelectTrigger><SelectValue placeholder="Select Education" /></SelectTrigger><SelectContent><SelectItem value="SSC">SSC</SelectItem><SelectItem value="HSC">HSC</SelectItem><SelectItem value="Diploma">Diploma</SelectItem><SelectItem value="BSc">BSc</SelectItem><SelectItem value="MSc">MSc</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
           <div className="space-y-1"><Label htmlFor="institute">Educational Institute</Label><Input id="institute" name="institute" value={info.institute} onChange={handleInfoChange} /></div>
        </div>

        <div className="space-y-1 md:col-span-2">
            <Label htmlFor="bio">Your Bio</Label>
            <p className="text-sm text-muted-foreground">Tell us a little about yourself, your experience, and your teaching style.</p>
            <textarea
                id="bio"
                name="bio"
                value={info.bio}
                onChange={handleInfoChange}
                placeholder="I am a passionate developer with 5 years of experience in..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleUpdateInformation} disabled={isUpdatingProfile}>
            {isUpdatingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Updating...</> : 'Update Information'}
        </Button>
      </CardFooter>
      
      <CardHeader className="border-t pt-6">
          <CardTitle>Change Password</CardTitle>
      </CardHeader>
       <CardContent className="space-y-4">
           <div className="space-y-1"><Label htmlFor="oldPassword">Old Password</Label><Input id="oldPassword" name="oldPassword" type="password" value={passwords.oldPassword} onChange={handlePasswordChange} /></div>
          <div className="space-y-1"><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} /></div>
          <div className="space-y-1"><Label htmlFor="confirmPassword">Confirm New Password</Label><Input id="confirmPassword" name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handlePasswordChange} /></div>
       </CardContent>
       <CardFooter className="flex justify-end">
        <Button onClick={handleChangePassword} disabled={isChangingPassword}>
            {isChangingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Change Password'}
        </Button>
      </CardFooter>
    </Card>
  );
};


const TransactionsHistory = () => {
    const {data, isLoading, isError, error} = useGetTransactionHistoryQuery();

    if(isLoading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin"/></div>
    if(isError) return <div className="text-red-500 p-4">Error: {error.data?.message || "Failed to load transactions."}</div>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Your history of all course purchases.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                         <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="text-right">Invoice</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.transactions.length === 0 ? (
                            <TableRow><TableCell colSpan="4" className="text-center h-24">No transactions found.</TableCell></TableRow>
                        ) : (
                           data?.transactions.map(tx => (
                            <TableRow key={tx._id}>
                                <TableCell className="font-medium">{tx.courseId?.courseTitle || 'N/A'}</TableCell>
                                <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                                <TableCell>৳{tx.amount}</TableCell>
                                <TableCell className="text-right">
                                    {tx.invoiceUrl ? (
                                        <a href={tx.invoiceUrl} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm">Download</Button>
                                        </a>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                            </TableRow>
                           )) 
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default Profile;