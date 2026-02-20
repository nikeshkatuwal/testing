import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal, FileText, Phone, Percent, CheckCircle2, XCircle, AlertCircle, MessageSquare, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT, BASE_API_URL } from '@/utils/constant';
import axios from 'axios';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';

const shortlistingStatus = ["Accepted", "Rejected"];

const AllApplicantsTable = ({ applications }) => {
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [screeningDialogOpen, setScreeningDialogOpen] = useState(false);

    const statusHandler = async (status, id) => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.put(`${APPLICATION_API_END_POINT}/update/${id}`, { status });
            if (res.data.success) {
                toast.success(res.data.message);
                // Simple reload or state update would be better but reload is easiest here matching original pattern
                window.location.reload();
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return dateString.split("T")[0];
    }

    const formatMatchScore = (score) => {
        if (!score && score !== 0) return "N/A";
        const percentage = score * 100;
        return `${Math.round(percentage)}%`;
    }

    const getResumeUrl = (resumeData) => {
        if (typeof resumeData === 'string') {
            if (!resumeData.startsWith('http')) {
                const filename = resumeData.includes('/')
                    ? resumeData.split('/').pop()
                    : resumeData;
                return `${BASE_API_URL}/uploads/resumes/${filename}`;
            }
            return resumeData;
        }
        if (resumeData && typeof resumeData === 'object') {
            if (resumeData.secure_url) return resumeData.secure_url;
            if (resumeData.url) return resumeData.url;
            let filename = null;
            if (resumeData.filename) filename = resumeData.filename;
            else if (resumeData.originalname) filename = resumeData.originalname;
            else if (resumeData.name) filename = resumeData.name;
            else if (resumeData.path) filename = resumeData.path.split('/').pop();
            if (filename) return `${BASE_API_URL}/uploads/resumes/${filename}`;
        }
        return '';
    }

    const getSkillMatchStatus = (applicantSkills, jobRequirements) => {
        if (!applicantSkills || !jobRequirements) return { matched: [], partial: [], missing: [] };

        const allApplicantSkills = [...new Set([
            ...(Array.isArray(applicantSkills) ? applicantSkills : []),
            ...(applicantSkills?.parsedResume?.skills || [])
        ])].map(skill => skill.toLowerCase());

        const matched = [];
        const partial = [];
        const missing = [];

        jobRequirements.forEach(requirement => {
            const requirementSkill = (typeof requirement === 'object' && requirement !== null)
                ? requirement.skill?.toLowerCase()
                : (typeof requirement === 'string' ? requirement.toLowerCase() : '');

            if (!requirementSkill) return;

            const exactMatch = allApplicantSkills.some(skill => skill === requirementSkill);
            const partialMatch = !exactMatch && allApplicantSkills.some(skill => skill.includes(requirementSkill) || requirementSkill.includes(skill));

            if (exactMatch) matched.push(requirement.skill || requirement);
            else if (partialMatch) partial.push(requirement.skill || requirement);
            else missing.push(requirement.skill || requirement);
        });

        return { matched, partial, missing };
    };

    const formatScreeningScore = (score) => {
        if (score === undefined || score === null) return "N/A";
        return `${score}%`;
    };

    const calculateScreeningScore = (responses, jobQuestions) => {
        // Simple fallback calculation logic if needed, ideally use backend score
        // Only implemented here because original code had it for fallback
        return 0; // Simplified for now as backend provides score
    };

    const viewScreeningResponses = (application) => {
        const applicant = application; // application object contains screeningResponses directly
        const jobQuestions = application.job.screening_questions;

        if (applicant && applicant.screeningResponses) {
            const updatedResponses = applicant.screeningResponses.map(response => {
                const originalQuestion = jobQuestions?.find(q =>
                    q._id === response.question ||
                    (q.question && response.question && q.question === response.question)
                );

                if (originalQuestion) {
                    const score = response.score || 0;
                    return { ...response, score };
                }
                return response;
            });

            setSelectedApplicant({
                ...applicant,
                screeningResponses: updatedResponses,
                screeningScore: applicant.screeningScore
            });
        } else {
            setSelectedApplicant(applicant);
        }
        setScreeningDialogOpen(true);
    };

    return (
        <div>
            <Table>
                <TableCaption>A list of all applications received across your jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>FullName</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Match Score</TableHead>
                        <TableHead>Screening Score</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applications && applications.length > 0 ? applications.map((item) => {
                            const resumeUrl = getResumeUrl(item?.applicant?.profile?.resume);
                            const normalizedSimilarity = parseFloat(item.similarity);
                            const hasScreeningResponses = item.screeningResponses && item.screeningResponses.length > 0;

                            const applicantSkills = [...new Set([
                                ...(item?.applicant?.profile?.skills || []),
                                ...(item?.applicant?.profile?.parsedResume?.skills || [])
                            ])];

                            const jobRequirements = item.job?.requirements || [];
                            const skillsAnalysis = getSkillMatchStatus(applicantSkills, jobRequirements);

                            return (
                                <TableRow key={item._id}>
                                    <TableCell>{item?.applicant?.fullname || "Applicant"}</TableCell>
                                    <TableCell><Badge variant="outline">{item?.job?.title || "Unknown Job"}</Badge></TableCell>
                                    <TableCell>{item?.applicant?.email || "N/A"}</TableCell>
                                    <TableCell>
                                        {item?.applicant?.phoneNumber ||
                                            (item?.applicant?.profile?.phoneNumber ?
                                                item.applicant.profile.phoneNumber : "N/A")}
                                    </TableCell>
                                    <TableCell>
                                        {
                                            resumeUrl ?
                                                <a
                                                    className="text-blue-600 cursor-pointer flex items-center gap-1"
                                                    href={resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    View Resume
                                                </a> :
                                                <span className="text-gray-400">No Resume</span>
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <Popover>
                                            <PopoverTrigger>
                                                <div className="flex items-center gap-1 cursor-pointer">
                                                    <Percent className="h-4 w-4" />
                                                    <span className={`font-medium ${normalizedSimilarity >= 0.7 ? 'text-green-600' :
                                                            normalizedSimilarity >= 0.5 ? 'text-yellow-600' :
                                                                'text-red-600'
                                                        }`}>
                                                        {formatMatchScore(normalizedSimilarity)}
                                                    </span>
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-medium text-sm mb-1">Skills Match Analysis</h3>
                                                        <Progress value={normalizedSimilarity * 100} className="h-2 w-full" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        {skillsAnalysis.matched.length > 0 && (
                                                            <div>
                                                                <h4 className="text-xs font-medium flex items-center text-green-600">
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                    Matched Skills ({skillsAnalysis.matched.length})
                                                                </h4>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {skillsAnalysis.matched.map((skill, i) => (
                                                                        <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">{skill}</Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {skillsAnalysis.partial.length > 0 && (
                                                            <div>
                                                                <h4 className="text-xs font-medium flex items-center text-yellow-600">
                                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                                    Partial Matches ({skillsAnalysis.partial.length})
                                                                </h4>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {skillsAnalysis.partial.map((skill, i) => (
                                                                        <Badge key={i} variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">{skill}</Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {skillsAnalysis.missing.length > 0 && (
                                                            <div>
                                                                <h4 className="text-xs font-medium flex items-center text-red-600">
                                                                    <XCircle className="h-3 w-3 mr-1" />
                                                                    Missing Skills ({skillsAnalysis.missing.length})
                                                                </h4>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {skillsAnalysis.missing.map((skill, i) => (
                                                                        <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">{skill}</Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                    <TableCell>
                                        {hasScreeningResponses ? (
                                            <Button
                                                variant="ghost"
                                                className="flex items-center gap-1 cursor-pointer p-0 h-auto"
                                                onClick={() => viewScreeningResponses(item)}
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                <Badge className={`px-2 py-0.5 ${item.screeningScore >= 80 ? 'bg-green-100 text-green-700' :
                                                    item.screeningScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'}`}>
                                                    {formatScreeningScore(item.screeningScore)}
                                                </Badge>
                                            </Button>
                                        ) : (
                                            <span className="text-gray-400 flex items-center gap-1">
                                                <HelpCircle className="h-4 w-4" />
                                                No responses
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{formatDate(item?.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <Popover>
                                            <PopoverTrigger>
                                                <MoreHorizontal className="cursor-pointer" />
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0" side="left">
                                                <div className="flex flex-col">
                                                    {shortlistingStatus.map((status) => (
                                                        <Button
                                                            key={status}
                                                            className="justify-start rounded-none text-black"
                                                            variant="ghost"
                                                            onClick={() => statusHandler(status, item._id)}>
                                                            {status}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            )
                        }) : <TableRow><TableCell colSpan={9} className="text-center">No applications found.</TableCell></TableRow>
                    }
                </TableBody>
            </Table>

            <Dialog open={screeningDialogOpen} onOpenChange={setScreeningDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Screening Responses</DialogTitle>
                        <DialogDescription>Applicant's responses to screening questions</DialogDescription>
                    </DialogHeader>
                    {/* Simplified Dialog content for brevity - can be expanded similar to ApplicantsTable if needed */}
                    <div className="space-y-4 my-4">
                        <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                            <span className="font-medium">Overall Score</span>
                            <Badge className={`text-lg px-3 py-1 ${selectedApplicant?.screeningScore >= 80 ? 'bg-green-100 text-green-700' :
                                    selectedApplicant?.screeningScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {selectedApplicant?.screeningScore || 0}%
                            </Badge>
                        </div>
                        <div className="divide-y">
                            {selectedApplicant?.screeningResponses?.map((response, index) => (
                                <div key={index} className="py-4">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="font-medium">Question {index + 1}</h3>
                                        <Badge>Score: {response.score}%</Badge>
                                    </div>
                                    <p className="text-gray-700 mb-2">{response.questionText || "Question text not available"}</p>
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <p className="text-sm text-gray-500 mb-1">Answer:</p>
                                        <p>{response.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AllApplicantsTable
