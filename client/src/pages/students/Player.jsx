import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AddContext'
import { useParams } from 'react-router-dom'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Footer from '../../Components/students/Footer'
import Rating from '../../Components/students/Rating'
import axios from 'axios'
import toast from 'react-hot-toast'
import Loading from '../../Components/students/Loading'

const Player = () => {
  const { enrolledCourses,
    calculateChapterTime,
    backend_url,
    token,
    userData,
    fetchUserEnrolledCourses } = useContext(AppContext)

  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [openSection, setOpenSection] = useState({})
  const [playerData, setPlayerData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [initialRating, setInitialRating] = useState(0)

  const getCourseData = () => {
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course);
        course.courseRatings.map((item) => {
          if (item.userId === userData._id) {
            setInitialRating(item.rating);
          }
        })
      }
    })
  }

  const toggleSection = (index) => {
    setOpenSection(prev => ({ ...prev, [index]: !prev[index] }))
  }

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData();
    }
  }, [enrolledCourses])

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const response = await axios.patch(backend_url + '/api/course/update-course-progress', { courseId, lectureId }, { headers: { token } });

      if (response.data.success) {
        toast.success(response.data.message);
        getCourseProgress();
      }
      else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const getCourseProgress = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/course/get-course-progress/${courseId}`, { headers: { token } });

      if (response.data.success) {
        setProgressData(response.data.progressData);
      }
      else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const handleRate = async (rating) => {
    try {
      const response = await axios.post(`${backend_url}/api/course/add-rating`, { courseId, rating }, { headers: { token } });

      if (response.data.success) {
        setProgressData(response.data.progressData);
        fetchUserEnrolledCourses();
      }
      else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  return courseData ? (
    <>
      <div className="min-h-screen px-4 md:px-10 py-8 bg-gray-50 flex flex-col lg:flex-row gap-8">

        {/* Left Column: Course Structure */}
        <div className="lg:w-1/2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Structure</h2>
            <div className="space-y-4">
              {courseData?.courseContent.map((chapter, index) => (
                <div key={index} className="border rounded-lg overflow-hidden shadow-sm bg-white">
                  <div
                    onClick={() => toggleSection(index)}
                    className="flex items-center justify-between cursor-pointer px-4 py-3 bg-gray-100 hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={assets.down_arrow_icon}
                        alt="toggle"
                        className={`w-4 h-4 transition-transform ${openSection[index] ? 'rotate-180' : ''}`}
                      />
                      <p className="font-medium text-gray-800">{chapter.chapterTitle}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  <div className={`${!openSection[index] ? 'hidden' : ''} px-4 py-2`}>
                    <ul className="space-y-3">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <img
                            src={progressData && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
                            alt="play"
                            className="w-5 h-5 mt-1"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{lecture.lectureTitle}</p>
                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                              {lecture.lectureUrl && (
                                <button
                                  onClick={() =>
                                    setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })
                                  }
                                  className="text-blue-600 hover:underline cursor-pointer"
                                >
                                  Watch
                                </button>
                              )}
                              <span>
                                {humanizeDuration(lecture.lectureDuration * 60 * 1000, {
                                  units: ['h', 'm'],
                                })}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Rate this Course:</h2>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        {/* Right Column: Video Player */}
        <div className="lg:w-1/2">
          {playerData ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <video
                src={playerData.lectureUrl}
                controls
                className="w-full aspect-video"
                title="Lecture Video"
              />
              <div className="p-4">
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  {playerData.chapter}.{playerData.lecture} - {playerData.lectureTitle}
                </p>
                <button onClick={() => markLectureAsCompleted(playerData.lectureId)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
                >
                  {progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-video bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
              {courseData && (
                <img
                  src={courseData.courseThumbnail}
                  alt="Course Thumbnail"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  ) : <Loading />
}

export default Player
