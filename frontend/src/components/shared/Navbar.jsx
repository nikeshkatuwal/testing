import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Bell } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { LogOut, User2 } from 'lucide-react';
import axios from 'axios';
import { USER_API_END_POINT, NOTIFICATION_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import './Navbar.css';
import DarkModeToggle from '../ui/DarkModeToggle';
import Logo from '../ui/Logo';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(0);
  const stickyRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const path = useLocation();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const BACKEND_BASE_URL = "http://localhost:8000";
  const BASE_URL = "http://localhost:8000";

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${NOTIFICATION_API_END_POINT}/get`, { withCredentials: true });
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const markNotificationRead = async (id) => {
    try {
      const res = await axios.put(`${NOTIFICATION_API_END_POINT}/mark-read/${id}`, {}, { withCredentials: true });
      if (res.data.success) {
        if (id === 'all') {
          setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } else {
          setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const requestNotificationPermission = async () => {
    // request permission
  };


  const unreadCount = notifications.filter(n => !n.isRead).length;

  const logoutHandler = async () => {
    console.log("log out")
    try {
      console.log(USER_API_END_POINT); // Should display the correct API URL
      // const res = await axios.get($,{USER_API_END_POINT}/logout, { withCredentials: true });
      const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });



      if (res.data.success) {
        dispatch({ type: 'USER_LOGOUT' });
        // dispatch(setUser(null)); // Redundant now as USER_LOGOUT clears auth slice too

        navigate('/');
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Logout failed');
    }
  };

  useEffect(() => {
    const pathName = path.pathname;
    if (pathName === '/') setSelectedItem(0);
    else if (pathName === '/collab') setSelectedItem(1);
    else if (pathName === '/profile') setSelectedItem(2);
    else if (pathName === '/discussion') setSelectedItem(3);
  }, [path]);

  useEffect(() => {
    const handleScroll = () => {
      if (stickyRef.current) {
        const rect = stickyRef.current.getBoundingClientRect();
        setIsSticky(rect.top === 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div ref={stickyRef} className={`sticky top-0 z-10 ${isSticky ? 'bg-background shadow' : 'bg-background'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <Logo />
        <div className="hidden lg:flex items-center gap-12">
          <ul className="flex font-medium items-center gap-5">
            {user && user.role === 'recruiter' ? (
              <>
                <li className="">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/admin/dashboard">Dashboard</NavLink>
                </li>
                <li className="">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/admin/jobs">Post Job </NavLink>
                </li>
                <li className="">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/admin/applications">Application</NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/">Home</NavLink>
                </li>
                <li className="">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/jobs">Jobs</NavLink>
                </li>
                <li className="">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/browse">Browse</NavLink>
                </li>
              </>
            )}
          </ul>
          <div className="flex items-center gap-2">
            {user && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative mr-2">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 h-auto p-0 hover:bg-transparent"
                        onClick={() => markNotificationRead('all')}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`flex flex-col gap-1 border-b px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                          onClick={() => {
                            if (!notification.isRead) markNotificationRead(notification._id);
                            // navigate based on type
                            if (notification.type === 'application_received' && user?.role === 'recruiter') {
                              navigate(`/admin/jobs/${notification.jobId}/applicants`);
                            }
                            // for updating status, maybe link to applications page?
                            if (notification.type === 'application_status' && user?.role === 'student') {
                              navigate(`/browse`); // Or profile/applications page if it exists
                            }
                          }}
                        >
                          <p className="font-medium text-gray-900">{notification.message}</p>
                          <p className="text-gray-500 text-xs">{notification.details}</p>
                          <span className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <DarkModeToggle />
            {!user ? (
              <>

                <Link to="/login">
                  <Button variant="outline" className="hover:bg-[#F83002] hover:text-white transition-colors">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] transition-colors">
                    Signup
                  </Button>
                </Link>
              </>
            ) : (

              <Popover>

                <PopoverTrigger asChild>
                  <Avatar className="cursor-pointer transition-transform hover:scale-105 ">

                    <AvatarImage src={user?.profile?.profilePhoto?.url || user?.profile?.profilePhoto} alt="User Avatar" className="rounded-full" />
                    <AvatarFallback>{user?.fullname?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <Link className="flex gap-3 space-y-2 ">
                    <Avatar>

                      <AvatarImage src={user?.profile?.profilePhoto?.url || user?.profile?.profilePhoto} alt="User Avatar" />
                      <AvatarFallback>{user?.fullname?.charAt(0).toUpperCase()}</AvatarFallback>

                    </Avatar>

                    <div>
                      <h4 className="font-medium">{user?.fullname}</h4>
                      <p className="text-sm text-gray-500">{user?.profile?.bio}</p>
                    </div>
                  </Link>
                  <div className="flex flex-col my-2 text-gray-600">
                    {user && user.role === 'student' && (
                      <div className="flex items-center gap-2 cursor-pointer hover:text-[#F83002] transition-colors">
                        <User2 />
                        <Link to="/profile">
                          <Button variant="link">View Profile</Button>
                        </Link>
                      </div>
                    )}
                    {user && user.role === 'recruiter' && (
                      <div className="flex items-center gap-2 cursor-pointer hover:text-[#F83002] transition-colors">
                        <User2 />
                        <Link to="/recruiter/profile">
                          <Button variant="link">View Profile</Button>
                        </Link>
                      </div>
                    )}
                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#F83002] transition-colors">
                      <LogOut />
                      <Button onClick={logoutHandler} variant="link">
                        Logout
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        <div className="lg:hidden">
          <div className="flex items-center gap-2">
            {user && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative mr-2">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 h-auto p-0 hover:bg-transparent"
                        onClick={() => markNotificationRead('all')}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`flex flex-col gap-1 border-b px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                          onClick={() => {
                            if (!notification.isRead) markNotificationRead(notification._id);
                            // navigate based on type
                            if (notification.type === 'application_received' && user?.role === 'recruiter') {
                              navigate(`/admin/jobs/${notification.jobId}/applicants`);
                            }
                            // for updating status, maybe link to applications page?
                            if (notification.type === 'application_status' && user?.role === 'student') {
                              navigate(`/browse`); // Or profile/applications page if it exists
                            }
                          }}
                        >
                          <p className="font-medium text-gray-900">{notification.message}</p>
                          <p className="text-gray-500 text-xs">{notification.details}</p>
                          <span className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <DarkModeToggle />
            <button onClick={toggleMenu} className="focus:outline-none">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="flex flex-col items-start p-4 bg-white shadow-md lg:hidden">
          <ul className="flex flex-col gap-4 font-medium">
            {user && user.role === 'recruiter' ? (
              <>
                <li className="">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/admin/dashboard">Dashboard</NavLink>
                </li>
                <li className="">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/admin/jobs">Jobs</NavLink>
                </li>
                <li className="">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/admin/applications">Application</NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/">Home</NavLink>
                </li>
                <li className="">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/jobs">Jobs</NavLink>
                </li>
                <li className="hover:text-[#F83002] transition-colors">
                  <NavLink className={({ isActive }) =>
                    isActive ? "text-blue-400 font-bold" : "hover:text-blue-900 transition-colors"} to="/browse">Browse</NavLink>
                </li>
              </>
            )}
          </ul>
          {!user ? (
            <div className="mt-4">
              <Link to="/login">
                <Button variant="outline" className="hover:bg-[#F83002] hover:text-white transition-colors">
                  Login
                </Button>
              </Link>
              <Link to="/signup" className="ml-2">
                <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] transition-colors">
                  Signup
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>

              <PopoverTrigger asChild>
                <Avatar className="mt-4 cursor-pointer transition-transform hover:scale-105">
                  <AvatarImage src={user?.profile?.profilePhoto?.url || user?.profile?.profilePhoto} alt="User Avatar" />
                  <AvatarFallback>{user?.fullname?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>


              </PopoverTrigger>
              <PopoverContent className="w-full mt-2">
                <Link to='/profile' className="flex gap-2 space-y-2">
                  <Avatar>
                    <AvatarImage src={user?.profile?.profilePhoto?.url || user?.profile?.profilePhoto} alt="User Avatar" />
                    <AvatarFallback>{user?.fullname?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div>
                    <h4 className="font-medium">{user?.fullname}</h4>
                    <p className="text-sm text-gray-500">{user?.profile?.bio}</p>
                  </div>
                </Link>
                <div className="flex flex-col my-2 text-gray-600">
                  {user && user.role === 'student' && (
                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#F83002] transition-colors">
                      <User2 />
                      <Link to="/profile">
                        <Button variant="link">View Profile</Button>
                      </Link>
                    </div>
                  )}
                  {user && user.role === 'recruiter' && (
                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#F83002] transition-colors">
                      <User2 />
                      <Link to="/recruiter/profile">
                        <Button variant="link">View Profile</Button>
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center gap-2 cursor-pointer hover:text-[#F83002] transition-colors">
                    <LogOut />
                    <Button onClick={logoutHandler} variant="link">
                      Logout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar