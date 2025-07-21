import Course from "../models/course.js"
import CourseProgress from "../models/courseProgress.js";
import User from "../models/user.js";

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).select(['-courseContent', '-enrolledStudents']).populate({ path: 'educator' });

    return res.json({ success: true, courses });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseData = await Course.findById(id).populate({ path: 'educator' });

    courseData.courseContent.forEach(chapter => {
      chapter.chapterContent.forEach(lecture => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });

    return res.json({ success: true, courseData });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export const updateUserCourseProgress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { courseId, lectureId } = req.body;

    const progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({ success: true, message: 'Lecture Completed' });
      }
      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    }
    else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId]
      })
    }
    return res.json({ success: true, message: "Progress Updated" });
  } catch (error) {
    return res.json({ success: false, message: message.error })
  }
}

export const getUserCourseProgress = async (req, res) => {
  try {
    const { userId } = req.user;
    const courseId = req.params.id;

    const progressData = await CourseProgress.findOne({ userId, courseId });
    return res.json({ success: true, progressData });
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export const addUserRating = async (req, res) => {
  const { userId } = req.user;
  const { courseId, rating } = req.body;

  if (!courseId || !rating || rating < 1 || rating > 5) {
    return res.json({ success: false, message: 'Invalid Data' });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: 'Course Not Found' });
    }
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.json({ success: false, message: 'User Not Enrolled!' });
    }

    const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

    if (existingRatingIndex > -1) {
      course.courseRatings[existingRatingIndex].rating = rating;
    }
    else {
      course.courseRatings.push({ userId, rating });
    }
    await course.save();

    return res.json({ success: true, message: 'Rating added' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}