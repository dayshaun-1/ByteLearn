import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from 'humanize-duration'
import toast from 'react-hot-toast';
import axios from 'axios'

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    const backend_url = import.meta.env.VITE_BACKEND_URL

    const [token, setToken] = useState("");
    const [showlogin, setShowLogin] = useState(false);

    const currency = import.meta.env.CURRENCY || '$'
    const navigate = useNavigate();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userData, setUserData] = useState(null);

    useEffect(()=>{
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'));
            if (localStorage.getItem('isEducator')) {
                setIsEducator(localStorage.getItem('isEducator'));
            }
        }
    }, [token])

    // Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {
        try {
            if (!token) {
                setEnrolledCourses([])
                return;
            }

            const response = await axios.get(backend_url + '/api/user/enrolled-courses', { headers: { token } });
            if (response.data.success) {
                setEnrolledCourses(response.data.enrolledCourses.reverse());
            }
            else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Fetch All Courses
    const fetchAllCourses = async () => {
        try {
            const response = await axios.get(backend_url + '/api/course/all');
            if (response.data.success) {
                setAllCourses(response.data.courses);
            }
            else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Fetch User Data
    const fetchUserData = async () => {
        try {
            if (!token) {
                setUserData(null);
                return;
            }

            const response = await axios.get(backend_url + '/api/user/data', { headers: { token } });
            if (response.data.success) {
                setUserData(response.data.user);
            }
            else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Function To calculate average rating of the course
    const calculateRating = (course) => {
        if (course.courseRatings.length === 0) {
            return 0;
        }
        let totalRating = 0;
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return Math.floor(totalRating / course.courseRatings.length);
    }

    // Function to calculate course chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    }

    // Function to calculate course duration
    const calculateCourseDuration = (course) => {
        let time = 0;

        course.courseContent.map((chapter) => chapter.chapterContent.map((lecture) => time += lecture.lectureDuration))

        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    }

    // Function to calculate No. of lectures in the course
    const calculateNoOfLectures = (course) => {
        let total = 0;
        course.courseContent.forEach((chapter) => {
            if (Array.isArray(chapter.chapterContent)) {
                total += chapter.chapterContent.length;
            }
        });
        return total;
    }

    useEffect(() => {
        fetchUserData();
    }, [token])

    useEffect(() => {
        fetchAllCourses();
    }, [])

    const value = {
        backend_url,
        token,
        setToken,
        showlogin,
        setShowLogin,
        currency,
        allCourses,
        navigate,
        calculateRating,
        isEducator,
        setIsEducator,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoOfLectures,
        enrolledCourses,
        fetchUserEnrolledCourses,
        userData,
        setUserData,
        fetchAllCourses
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}