import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AddContext'
import { useParams } from 'react-router-dom'
import SearchBar from '../../Components/students/SearchBar'
import CourseCard from '../../Components/students/CourseCard'
import Footer from '../../Components/students/Footer'

const CourseList = () => {
  const { navigate, allCourses } = useContext(AppContext)
  const { input } = useParams()

  const [filteredCourse, setFilteredCourse] = useState([]);

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const temp = allCourses.slice()
      input ? 
      setFilteredCourse(temp.filter(item => 
        item.courseTitle.toLowerCase().includes(input.toLowerCase())
      ))
      : setFilteredCourse(temp);
    }
  }, [allCourses, input])

  return (
    <>
    <div className="bg-white min-h-screen px-4 md:px-10 py-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Course List</h1>
            <p className="text-sm text-gray-500">
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => navigate('/')}
              >
                Home
              </span>{' '}
              / <span className="text-gray-700">Course List</span>
            </p>
          </div>
          <div className='flex-row text-center sm:flex gap-4'>
          <SearchBar />
          <button
            onClick={() => navigate('/course-list')}
            className="my-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Clear Search
          </button>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCourse.map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
      </div>
    </div>
    
    <Footer />
    </>
  )
}

export default CourseList