import express from 'express'
import { getAllCourses, getCourseById, updateUserCourseProgress, getUserCourseProgress, addUserRating } from '../controllers/course.js';
import authentication from '../middlewares/auth.js';

const courseRouter = express.Router();

courseRouter.get('/all', getAllCourses);
courseRouter.get('/:id', getCourseById);
courseRouter.patch('/update-course-progress', authentication, updateUserCourseProgress);
courseRouter.get('/get-course-progress/:id', authentication, getUserCourseProgress);
courseRouter.post('/add-rating', authentication, addUserRating);


export default courseRouter;