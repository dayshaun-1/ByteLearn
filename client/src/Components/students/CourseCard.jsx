import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AddContext'
import { Link } from 'react-router-dom'

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext)
  const discountedPrice = (course.coursePrice * (1 - 0.01 * course.discount)).toFixed(2)

  return (
    <Link
      to={`/course/${course._id}`}
      onClick={() => scrollTo(0, 0)}
      className="block bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
    >
      {/* Thumbnail */}
      <img
        src={course.courseThumbnail}
        alt={course.courseTitle}
        className="w-full h-48 object-cover"
      />

      {/* Course Info */}
      <div className="p-4 space-y-2 text-left">
        <h3 className="text-lg font-semibold text-gray-800">{course.courseTitle}</h3>
        {<p className="text-sm text-gray-500">By {course.educator.name}</p>}

        {/* Rating */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <p className="font-medium">{calculateRating(course)}</p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img key={i} src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank} alt="star" className="w-4 h-4" />
            ))}
          </div>
          <p>{course.courseRatings.length} students</p>
        </div>

        {/* Price */}
        <p className="text-blue-600 font-semibold text-md">
          Price: {currency}{discountedPrice}
        </p>
      </div>
    </Link>
  )
}

export default CourseCard