import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AddContext'
import { Line } from 'rc-progress'
import axios from 'axios'
import toast from 'react-hot-toast'

const MyEnrollment = () => {
  const { enrolledCourses,
    calculateCourseDuration,
    navigate,
    backend_url,
    token,
    userData,
    fetchUserEnrolledCourses,
    calculateNoOfLectures } = useContext(AppContext)

  const [progressArray, setProgressArray] = useState([])
  // new Array(enrolledCourses.length).fill({ lectureCompleted: 2, totalLectures: 4 })

  const getCourseProgress = async () => {
    try {
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          const { data } = await axios.get(`${backend_url}/api/course/get-course-progress/${course._id}`, { headers: { token } });

          let totalLectures = 0;
          let validLectureIds = new Set();
          course.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
              validLectureIds.add(lecture.lectureId);
              totalLectures++;
            });
          });

          const filteredLectureCompleted = data.progressData ? data.progressData.lectureCompleted.filter(
            lectureId => validLectureIds.has(lectureId)
          ) : [];

          const lectureCompleted = filteredLectureCompleted.length;
          return { totalLectures, lectureCompleted }
        })
      )
      setProgressArray(tempProgressArray);
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
    }
  }, [userData])

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrolledCourses])

  return (
    <div className="px-4 sm:px-8 py-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">My Enrollments</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Course</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Duration</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Completed</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {enrolledCourses.map((course, index) => {
              const progress = progressArray[index] || { lectureCompleted: 0, totalLectures: 1 }
              const percentage = (progress.lectureCompleted * 100) / progress.totalLectures
              const status = percentage === 100 ? 'Completed' : 'On Going'

              return (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 flex items-center space-x-4">
                    <img
                      src={course.courseThumbnail}
                      alt={course.courseTitle}
                      className="w-14 h-14 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{course.courseTitle}</p>
                      <Line
                        strokeWidth={4}
                        percent={percentage}
                        strokeColor="#3b82f6"
                        trailColor="#e5e7eb"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}% completed</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{calculateCourseDuration(course)}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {progress.lectureCompleted} / {progress.totalLectures} <span className="text-sm text-gray-500">Lectures</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate('/player/' + course._id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium ${status === 'Completed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                        }`}
                    >
                      {status}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MyEnrollment
