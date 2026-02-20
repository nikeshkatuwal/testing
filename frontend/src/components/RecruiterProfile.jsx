import React, { useState } from 'react';
import Navbar from './shared/Navbar';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Mail, Phone, Pen, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import UpdateRecruiterProfileDialog from './UpdateRecruiterProfileDialog';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { setUser } from '@/redux/authSlice';
import { Input } from './ui/input';

const RecruiterProfile = () => {
    const [open, setOpen] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const handleSendOTP = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/send-otp`, {}, { withCredentials: true });
            if (res.data.success) {
                setOtpSent(true);
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/verify-otp`, { otp }, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setOtpSent(false);
                setOtp('');
                // Update local user state
                dispatch(setUser({ ...user, isVerified: true }));
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className='max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8'>
                <div className='flex justify-between'>
                    <div className='flex items-center gap-4'>
                        <Avatar className="h-24 w-24">
                            <AvatarImage
                                src={user?.profile?.profilePhoto?.url || user?.profile?.profilePhoto || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"}
                                alt="profile"
                            />
                            <AvatarFallback>{user?.fullname?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className='flex items-center gap-2'>
                                <h1 className='font-medium text-xl'>{user?.fullname}</h1>
                                {user?.isVerified ? (
                                    <ShieldCheck className='text-green-600 h-5 w-5' title='Verified Profile' />
                                ) : (
                                    <span className='text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full'>Unverified</span>
                                )}
                            </div>
                            <p className='text-gray-600'>{user?.role === 'recruiter' ? 'Recruiter' : ''}</p>
                        </div>
                    </div>
                    <Button onClick={() => setOpen(true)}>
                        <Pen className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                </div>

                {/* Contact Information */}
                <div className='my-5 p-4 bg-gray-50 rounded-lg'>
                    <div className='flex justify-between items-center mb-3'>
                        <h2 className='font-semibold text-lg'>Contact Information</h2>
                        {!user?.isVerified && !otpSent && (
                            <Button variant="outline" size="sm" onClick={handleSendOTP} disabled={loading}>
                                {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Mail className='mr-2 h-4 w-4' />}
                                Verify Email
                            </Button>
                        )}
                    </div>
                    <div className='flex items-center gap-3 my-2'>
                        <Mail className="text-gray-600" />
                        <span className='flex items-center gap-2'>
                            {user?.email}
                            {user?.isVerified && <CheckCircle className='text-green-600 h-4 w-4' />}
                        </span>
                    </div>

                    {otpSent && !user?.isVerified && (
                        <div className='mt-4 p-4 border border-blue-200 bg-blue-50 rounded-lg'>
                            <p className='text-sm text-blue-800 mb-2'>Enter the 6-digit OTP sent to your email:</p>
                            <div className='flex gap-2'>
                                <Input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="max-w-[150px]"
                                />
                                <Button onClick={handleVerifyOTP} disabled={loading}>
                                    {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Verify'}
                                </Button>
                                <Button variant="ghost" onClick={() => setOtpSent(false)}>Cancel</Button>
                            </div>
                        </div>
                    )}

                    <div className='flex items-center gap-3 my-2'>
                        <Phone className="text-gray-600" />
                        <span>{user?.phoneNumber || 'Not provided'}</span>
                    </div>
                </div>

                {/* Company & Registration Information */}
                <div className='my-5 p-4 bg-gray-50 rounded-lg'>
                    <h2 className='font-semibold text-lg mb-3'>Company Details</h2>
                    <div className='flex items-center gap-3 my-2'>
                        <span className='font-bold text-gray-700'>Location:</span>
                        <span>{user?.companyLocation || 'Not provided'}</span>
                    </div>
                    <div className='flex items-center gap-3 my-2'>
                        <span className='font-bold text-gray-700'>Registration Doc:</span>
                        {user?.registrationDocument?.url ? (
                            <a
                                href={user.registrationDocument.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className='text-blue-600 hover:underline cursor-pointer flex items-center gap-1'
                            >
                                <CheckCircle className='h-4 w-4' /> View/Download Document
                            </a>
                        ) : (
                            <span className='text-gray-500'>No document uploaded</span>
                        )}
                    </div>
                </div>

                {/* Bio Section */}
                {user?.profile?.bio && (
                    <div className='my-5 p-4 bg-gray-50 rounded-lg'>
                        <h2 className='font-semibold text-lg mb-3'>About</h2>
                        <p className='text-gray-700'>{user.profile.bio}</p>
                    </div>
                )}
            </div>
            <UpdateRecruiterProfileDialog open={open} setOpen={setOpen} />
        </div>
    );
};

export default RecruiterProfile;
