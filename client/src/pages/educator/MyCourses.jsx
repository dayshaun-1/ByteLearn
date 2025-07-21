import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AddContext';
import Loading from '../../Components/educator/Loading'; // Assuming Loading component exists
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const MyCourses = () => {
  const { currency, backend_url, isEducator, token } = useContext(AppContext);
  const [courses, setCourses] = useState(null);
  const navigate = useNavigate(); // Initialize navigate hook

  const fetchEducatorCourses = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/educator/courses`, { headers: { token } });

      if (response.data.success) {
        setCourses(response.data.courses);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isEducator) {
      fetchEducatorCourses();
    }
  }, [isEducator, backend_url, token]); // Add backend_url and token to dependencies

  // Function to handle navigation to the update course page
  const handleUpdateClick = (courseId) => {
    navigate(`/educator/update-course/${courseId}`);
  };

  return courses ? (
    <div className="p-6 pl-24 pt-8"> {/* Added pl-24 and pt-8 for consistent padding with AddCourse */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Courses</h2>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">Earnings</th>
              <th className="py-3 px-4">Students</th>
              <th className="py-3 px-4">Published On</th>
              <th className="py-3 px-4">Actions</th> {/* New column for actions */}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {courses.map((course) => (
              <tr key={course._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 flex items-center gap-3">
                  <img
                    src={course.courseThumbnail}
                    alt="Course Thumbnail"
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <span className="font-medium">{course.courseTitle}</span>
                </td>
                <td className="py-3 px-4">
                  {currency}{' '}
                  {Math.floor(
                    course.enrolledStudents.length *
                      (course.coursePrice - (course.discount * course.coursePrice) / 100)
                  )}
                </td>
                <td className="py-3 px-4">{course.enrolledStudents.length}</td>
                <td className="py-3 px-4">{new Date(course.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleUpdateClick(course._id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 text-sm"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MyCourses;
