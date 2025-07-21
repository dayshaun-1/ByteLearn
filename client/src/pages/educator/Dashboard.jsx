import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AddContext'
import { assets } from '../../assets/assets'
import Loading from '../../Components/educator/Loading'
import axios from 'axios'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { currency, backend_url, isEducator, token } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(null)

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/educator/dashboard`, { headers: { token } });

      if (response.data.success) {
        setDashboardData(response.data.dashboardData);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return dashboardData ? (
    <div className="p-6 space-y-10">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Enrollments */}
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <img src={assets.patients_icon} alt="enrollments" className="w-12 h-12" />
          <div>
            <p className="text-2xl font-semibold">{dashboardData.enrolledStudentsData.length}</p>
            <p className="text-gray-500 text-sm">Total Enrollments</p>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <img src={assets.appointments_icon} alt="courses" className="w-12 h-12" />
          <div>
            <p className="text-2xl font-semibold">{dashboardData.totalCourses}</p>
            <p className="text-gray-500 text-sm">Total Courses</p>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <img src={assets.earning_icon} alt="earnings" className="w-12 h-12" />
          <div>
            <p className="text-2xl font-semibold">{currency} {dashboardData.totalEarnings}</p>
            <p className="text-gray-500 text-sm">Total Earnings</p>
          </div>
        </div>
      </div>

      {/* Latest Enrollments Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Latest Enrollments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm text-gray-600 border-b">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Student Name</th>
                <th className="py-2 px-3">Course Title</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.enrolledStudentsData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-700">{index + 1}</td>
                  <td className="py-2 px-3 flex items-center gap-2">
                    <span className="text-gray-800">{item.student.name}</span>
                  </td>
                  <td className="py-2 px-3 text-gray-700">{item.courseTitle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Dashboard
