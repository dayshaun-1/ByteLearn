import React, { useContext, useEffect, useState } from 'react'
import Loading from '../../Components/educator/Loading'
import { AppContext } from '../../context/AddContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentEnrolled = () => {

  const {backend_url, token, isEducator} = useContext(AppContext);

  const [enrolledStudents, setEnrolledStudents] = useState(null)

  const fetchEnrolledStudents = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/educator/enrolled-students`, {headers: {token}});

      if (response.data.success) {
        setEnrolledStudents(response.data.enrolledStudents.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (isEducator) {
      fetchEnrolledStudents()
    }
  }, [isEducator])

  return enrolledStudents ? (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Student Enrollments</h2>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Course Title</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {enrolledStudents.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4 flex items-center gap-3">
                  <span className="font-medium">{item.student.name}</span>
                </td>
                <td className="py-3 px-4">{item.courseTitle}</td>
                <td className="py-3 px-4">
                  {new Date(item.purchaseDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default StudentEnrolled
