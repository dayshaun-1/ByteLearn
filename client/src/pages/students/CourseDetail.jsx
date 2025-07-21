import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AddContext'
import Loading from '../../Components/students/Loading'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Footer from '../../Components/students/Footer'
import axios from 'axios'
import toast from 'react-hot-toast'

const CourseDetail = () => {
  const { id } = useParams()
  const {
    backend_url,
    token,
    userData,
    allCourses,
    currency,
    calculateRating,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
  } = useContext(AppContext)

  const [courseData, setCourseData] = useState(null)
  const [openSection, setOpenSection] = useState({})
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [playerData, setPlayerData] = useState(null);

  const fetchCourseData = async ()=>{
    try {
      const response = await axios.get(backend_url + '/api/course/' + id);
      if (response.data.success) {
        setCourseData(response.data.courseData)
      }
      else {
        toast.error(response.data.error);
      }
    } catch (error) {
        toast.error(error.message);
    }
  }

  const enrollCourse = async ()=>{
    try {
      if (!token) {
        toast('Login to Enroll');
        return ;
      }
      if (isEnrolled) {
        toast('Already Enrolled');
        return ;
      }

      const response = await axios.post(backend_url + '/api/user/purchase', {
        courseId: courseData._id
      }, {headers: {token}});

      if (response.data.success) {
        toast.success(response.data.message);
        setIsEnrolled(true);
      }
      else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchCourseData();
  }, [allCourses, id])

  useEffect(() => {
    if (userData && courseData) {
      setIsEnrolled(userData.enrolledCourses.includes(courseData._id));
    }
  }, [userData, courseData])

  const toggleSection = (index) => {
    setOpenSection((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return courseData ? (
    <>
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Course Content */}
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{courseData.courseTitle}</h1>

        <div
          className="rich-text"
          dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
        />

        {/* Ratings & Meta */}
        <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{calculateRating(courseData)}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank}
                  alt="star"
                  className="w-4 h-4"
                />
              ))}
            </div>
          </div>
          <p>{calculateRating(courseData)} ratings</p>
          <p>{courseData.enrolledStudents.length} students</p>
        </div>

        <p className="text-gray-700 text-sm mb-6">
          Course By: <span className="font-medium">{courseData.educator.name || 'ByteLearn'}</span>
        </p>

        {/* Course Structure */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Structure</h2>
          <div className="space-y-4">
            {courseData.courseContent.map((chapter, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div
                  onClick={() => toggleSection(index)}
                  className="flex items-center justify-between cursor-pointer px-4 py-3 bg-gray-100 hover:bg-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={assets.down_arrow_icon}
                      alt="toggle"
                      className={`w-4 h-4 transform transition-transform ${openSection[index] ? 'rotate-180' : ''
                        }`}
                    />
                    <p className="font-medium text-gray-800">{chapter.chapterTitle}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}
                  </p>
                </div>

                <div className={`${!openSection[index] ? 'hidden' : ''} px-4 py-2 bg-white`}>
                  <ul className="space-y-3">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <img src={assets.play_icon} alt="play" className="w-5 h-5 mt-1" />
                        <div className="flex flex-col">
                          <p className="font-medium">{lecture.lectureTitle}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            {lecture.isPreviewFree && <span
                            onClick={()=>setPlayerData({
                              videoId: lecture.lectureUrl //.split('/').pop()
                            })}
                            className="text-green-600 cursor-pointer">Preview</span>}
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
      </div>

      {/* Right: Sidebar */}
      <div>
        <div className="bg-gray-50 p-6 rounded-xl shadow-md">
          {
            playerData 
            ? <video
                src={playerData.videoId}
                controls
                className="w-full aspect-video"
                title="Lecture Video"
              />
            : <img
                src={courseData.courseThumbnail}
                alt={courseData.courseTitle}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />  
          }

          <div className="mb-4 text-sm text-gray-700">
            <p className="mb-1">Discount: <span className="text-green-600 font-medium">{courseData.discount}%</span></p>
            <p>
              Price:{' '}
              <span className="text-lg font-bold">
                {currency} {(courseData.coursePrice * (1 - 0.01 * courseData.discount)).toFixed(2)}
              </span>
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {/* <div className="flex items-center gap-2 text-sm">
              <img src={assets.star} alt="star" className="w-4 h-4" />
              <p>{calculateRating(courseData)}</p>
            </div> */}
            <div className="flex items-center gap-2 text-sm">
              <img src={assets.time_clock_icon} alt="clock" className="w-4 h-4" />
              <p>{calculateCourseDuration(courseData)}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <img src={assets.lesson_icon} alt="lessons" className="w-4 h-4" />
              <p>{calculateNoOfLectures(courseData)} lessons</p>
            </div>
          </div>

          <button
            onClick={enrollCourse}
            className={`w-full py-3 rounded-lg font-semibold transition ${isEnrolled
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {isEnrolled ? 'Enrolled' : 'Enroll Now'}
          </button>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-2">What's in the course?</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Lifetime access with free updates</li>
              <li>Step-by-step, hands-on project guidance</li>
              <li>Downloadable resources and source code</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default CourseDetail
