import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import AllApplicantsTable from './AllApplicantsTable';
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useDispatch } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';

const AllApplicants = () => {
    const dispatch = useDispatch();
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const fetchAllRecruiterApplicants = async () => {
            try {
                // Use the new endpoint
                const res = await axios.get(`${APPLICATION_API_END_POINT}/recruiter/all`, { withCredentials: true });
                console.log('API Response:', res.data);
                if (res.data.success) {
                    setApplications(res.data.applications);
                    // Also dispatch to redux if needed by table, but better to pass as prop to avoid confusion with single job applicants
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchAllRecruiterApplicants();
    }, []);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
                <h1 className='font-bold text-2xl md:text-3xl mb-4 text-gray-800 dark:text-white'>
                    All Applications ({applications.length})
                </h1>
                <AllApplicantsTable applications={applications} />
            </div>
        </div>
    );
};

export default AllApplicants;
