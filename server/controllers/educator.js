import Course from "../models/course.js";
import { v2 as cloudinary } from 'cloudinary'
import Purchase from "../models/purchase.js";
import User from "../models/user.js";

export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const { userId } = req.user;
        const imageFile = req.file;

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' });
        }

        let parsedCourseData = await JSON.parse(courseData);
        parsedCourseData.educator = userId;

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            folder: 'bytelearn_image'
        });
        parsedCourseData.courseThumbnail = imageUpload.secure_url;

        const newCourse = await Course.create(parsedCourseData);

        res.json({ success: true, message: 'Course Added' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const updateCourse = async (req, res) => {
    try {
        const { userId } = req.user;
        const { courseId } = req.params;
        const { courseData } = req.body;
        const imageFile = req.file;

        if (!courseData) {
            return res.json({ success: false, message: 'Course data is missing.' });
        }

        let parsedCourseData = JSON.parse(courseData);

        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found.' });
        }

        if (course.educator.toString() !== userId) {
            return res.json({ success: false, message: 'You are not authorized to update this course.' });
        }

        course.courseTitle = parsedCourseData.courseTitle || course.courseTitle;
        course.courseDescription = parsedCourseData.courseDescription || course.courseDescription;
        course.coursePrice = parsedCourseData.coursePrice !== undefined ? parsedCourseData.coursePrice : course.coursePrice;
        course.discount = parsedCourseData.discount !== undefined ? parsedCourseData.discount : course.discount;
        course.courseContent = parsedCourseData.courseContent || course.courseContent; // Update entire content array

        if (imageFile) {
            const oldPublicId = course.courseThumbnail.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(oldPublicId);

            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                folder: 'bytelearn_image'
            });
            course.courseThumbnail = imageUpload.secure_url;
        }

        await course.save();

        res.json({ success: true, message: 'Course updated successfully!' });

    } catch (error) {
        console.error('Error updating course:', error);
        res.json({ success: false, message: error.message || 'An error occurred while updating the course.' });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);
        if (course) {
            res.json({ success: true, course });
        }
        else {
            res.json({ success: false, message: "Course Not Found!" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.user.userId;
        const courses = await Course.find({ educator });
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const educatorDashboardData = async (req, res) => {
    try {
        const educatorId = req.user.userId;

        const courses = await Course.find({ educator: educatorId }).lean();
        const totalCourses = courses.length;
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed',
        }).lean();

        const totalEarnings = purchases.reduce((sum, p) => sum + p.amount, 0);

        const studentIdSet = new Set();
        courses.forEach(course => {
            course.enrolledStudents?.forEach(id => studentIdSet.add(id.toString()));
        });
        const allStudentIds = Array.from(studentIdSet);

        const students = await User.find({ _id: { $in: allStudentIds } }, 'name').lean();
        const studentMap = new Map(students.map(s => [s._id.toString(), s]));

        const enrolledStudentsData = [];
        courses.forEach(course => {
            course.enrolledStudents?.forEach(studentId => {
                const student = studentMap.get(studentId.toString());
                if (student) {
                    enrolledStudentsData.push({
                        courseTitle: course.courseTitle,
                        student
                    });
                }
            });
        });

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educatorId = req.user?.userId;
        if (!educatorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const courses = await Course.find({ educator: educatorId }).select('_id').lean();
        if (!courses.length) {
            return res.json({ success: true, enrolledStudents: [] });
        }

        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed',
        })
            .populate('userId', 'name')
            .populate('courseId', 'courseTitle')
            .lean();

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId?.courseTitle || 'Unknown Course',
            purchaseDate: purchase.createdAt
        }));

        res.json({ success: true, enrolledStudents });

    } catch (error) {
        console.error('Error in getEnrolledStudentsData:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};