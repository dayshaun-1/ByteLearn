import express from "express";
import { becomeEducator, getUserData, loginUser, purchaseCourse, signupUser, userEnrolledCourses } from "../controllers/user.js";
import authentication from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post('/signup', signupUser);
userRouter.post('/login', loginUser);
userRouter.patch('/toeducator', authentication, becomeEducator);
userRouter.get('/data', authentication, getUserData);
userRouter.get('/enrolled-courses', authentication, userEnrolledCourses);
userRouter.post('/purchase', authentication, purchaseCourse);

export default userRouter;