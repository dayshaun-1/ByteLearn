import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AddContext'
import CourseCard from './CourseCard'

const CourseSection = () => {
  const { allCourses } = useContext(AppContext)

  return (
    <section className="bg-gray-50 py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto text-center">

        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Learn From the Best
        </h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
          Explore our top-rated courses in coding, design, business, and wellness. Each course is designed to deliver real results.
        </p>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {allCourses.slice(0, 4).map((course, index) => (
            <CourseCard key={index} course={course} />
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/course-list"
            onClick={() => scrollTo(0, 0)}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Show All Courses
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CourseSection