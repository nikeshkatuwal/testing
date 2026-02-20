import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { useSelector } from 'react-redux';
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    GraduationCap,
    ChevronRight,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { NavLink } from 'react-router-dom';

// Custom SVG Donut Chart component matching the image layout
const ApplicationResponseChart = () => {
    return (
        <div className="relative w-full h-[300px] flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-64 h-64">
                {/* Main Donut Rings */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1E293B" strokeWidth="10" strokeDasharray="60 200" strokeDashoffset="0" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#A5F3FC" strokeWidth="10" strokeDasharray="100 200" strokeDashoffset="-70" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#FB923C" strokeWidth="10" strokeDasharray="30 200" strokeDashoffset="-180" strokeLinecap="round" />

                {/* Little dot marker */}
                <circle cx="85" cy="70" r="3" fill="white" stroke="#1E293B" strokeWidth="2" />
            </svg>

            {/* Labels matching the image */}
            <div className="absolute top-10 left-10 text-xs font-bold text-gray-400">
                <p className="text-[#10b981] flex items-center gap-0.5"><TrendingUp size={10} /> +2,5%</p>
                <div className="w-8 h-[1px] bg-gray-200 mt-1"></div>
            </div>
            <div className="absolute bottom-10 left-10 text-xs font-bold text-gray-400">
                <p className="text-[#10b981] flex items-center gap-0.5"><TrendingUp size={10} /> +0,4%</p>
                <div className="w-8 h-[1px] bg-gray-200 mt-1"></div>
            </div>
            <div className="absolute top-1/2 -right-2 text-xs font-bold text-gray-400 text-right">
                <p className="text-gray-600">-0,5 %</p>
                <div className="w-8 h-[1px] bg-gray-200 mt-1 ml-auto"></div>
            </div>
        </div>
    );
};

// Sparkline component for the small charts in stats
const Sparkline = ({ color, trend }) => {
    const points = trend === 'up'
        ? "0,20 10,10 20,25 30,5 40,15"
        : "0,5 10,25 20,10 30,20 40,30";
    return (
        <svg viewBox="0 0 40 40" className="w-16 h-10">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
};

const Dashboard = () => {
    const { user } = useSelector(store => store.auth);

    const stats = [
        { label: 'Job Posts', value: '2,456', change: '+2.5%', color: '#10b981', trend: 'up' },
        { label: 'Total Application', value: '4,561', change: '-4.4%', color: '#ef4444', trend: 'down' },
        { label: 'No of Meetings', value: '125', change: '+1.5%', color: '#f59e0b', trend: 'up' },
        { label: 'No of Hirings', value: '2,456', change: '+4.5%', color: '#10b981', trend: 'up' },
    ];

    const recentJobs = [
        { title: 'UI UX Designer', category: 'Full Time', openings: '12', applications: '135', status: 'Active' },
        { title: 'Full Stack Dev', category: 'Full Time', openings: '08', applications: '100', status: 'Inactive' },
        { title: 'DevOps', category: 'Internship', openings: '12', applications: '05', status: 'Active' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
            <Navbar />
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Welcome Banner - Exact Match to Image */}
                    <div className="bg-[#2D3748] rounded-xl p-12 text-white flex justify-between items-center relative overflow-hidden shadow-lg">
                        <div className="z-10">
                            <h1 className="text-4xl tracking-tight text-white mb-6">Welcome To Job Mitra</h1>
                            <h1 className="text-5xl font-bold tracking-tight text-white ">{user?.fullname}</h1>
                        </div>
                        {/* <div className="hidden md:block z-10">
                            <img
                                src="https://share.google/PPsa0CLV0Zw1YRKU6"
                                alt="Illustration"
                                className="h-48"
                            />
                        </div> */}
                        {/* Decorative circles from image */}
                        <div className="absolute right-20 top-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full"></div>
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full"></div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <Card key={i} className="border-none shadow-sm bg-white dark:bg-slate-900">
                                <CardContent className="p-5 flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-2">{stat.label}</p>
                                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</h3>
                                        <p className={`text-[10px] font-bold mt-2 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                            {stat.change}
                                        </p>
                                    </div>
                                    <Sparkline color={stat.color} trend={stat.trend} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Responsive & Recent Posts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-11 gap-6">

                        {/* Application Response */}
                        <Card className="lg:col-span-4 border-none shadow-sm bg-white dark:bg-slate-900 p-6 rounded-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-gray-700 dark:text-gray-200">Application Responce</h4>
                                <button className="text-[10px] font-bold text-orange-400 uppercase tracking-tighter hover:underline">Download Report</button>
                            </div>
                            <ApplicationResponseChart />
                        </Card>

                        {/* Recent Job Posts */}
                        <Card className="lg:col-span-7 border-none shadow-sm bg-white dark:bg-slate-900 p-6 rounded-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-gray-700 dark:text-gray-200">Recent Job Posts</h4>
                                <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-full text-[10px] font-bold text-gray-400">
                                    <button className="px-3 py-1 hover:text-gray-600">Monthly</button>
                                    <button className="px-3 py-1 hover:text-gray-600">Weekly</button>
                                    <button className="px-3 py-1 bg-[#2D3748] text-white rounded-full">Today</button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-blue-50/50 dark:bg-slate-800/50">
                                        <TableRow className="border-none">
                                            <TableHead className="text-[10px] font-bold text-blue-900/40 uppercase">Job Title</TableHead>
                                            <TableHead className="text-[10px] font-bold text-blue-900/40 uppercase text-center">Category</TableHead>
                                            <TableHead className="text-[10px] font-bold text-blue-900/40 uppercase text-center">Openings</TableHead>
                                            <TableHead className="text-[10px] font-bold text-blue-900/40 uppercase text-center">Applications</TableHead>
                                            <TableHead className="text-[10px] font-bold text-blue-900/40 uppercase text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentJobs.map((job, i) => (
                                            <TableRow key={i} className="border-b border-gray-50 dark:border-slate-800">
                                                <TableCell className="text-sm font-medium text-gray-600 dark:text-gray-300 py-4">{job.title}</TableCell>
                                                <TableCell className="text-center text-xs text-gray-500">{job.category}</TableCell>
                                                <TableCell className="text-center text-xs text-gray-500">{job.openings}</TableCell>
                                                <TableCell className="text-center text-xs text-gray-500">{job.applications}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge className={`rounded px-3 py-1 font-bold text-[10px] border-none shadow-none ${job.status === 'Active' ? 'bg-green-400/80 text-white' : 'bg-orange-400/80 text-white'}`}>
                                                        {job.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
