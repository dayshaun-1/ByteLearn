import express from "express";
import upload from "../middlewares/multer.js";
import { addCourse, getEducatorCourses, educatorDashboardData, getEnrolledStudentsData, updateCourse, getCourseById } from "../controllers/educator.js";

const educatorRouter = express.Router();

educatorRouter.post('/add-course', upload.single('image'), addCourse);
educatorRouter.get('/get-course/:id', getCourseById);
educatorRouter.put('/update-course/:courseId', upload.single('image'), updateCourse);
educatorRouter.get('/courses', getEducatorCourses);
educatorRouter.get('/dashboard', educatorDashboardData);
educatorRouter.get('/enrolled-students', getEnrolledStudentsData);

export default educatorRouter;