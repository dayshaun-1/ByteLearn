import React, { useContext } from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/students/Home'
import CourseList from './pages/students/CourseList'
import CourseDetail from './pages/students/CourseDetail'
import MyEnrollment from './pages/students/MyEnrollment'
import Player from './pages/students/Player'
import Loading from './Components/students/Loading'
import Educator from './pages/educator/Educator'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import StudentEnrolled from './pages/educator/StudentEnrolled'
import Navbar from './Components/students/Navbar'
import Login from './Components/Login'
import { AppContext } from './context/AddContext'
import 'quill/dist/quill.snow.css'
import UpdateCourse from './pages/educator/UpdateCourse'

const App = () => {

  const { showlogin } = useContext(AppContext)
  const isEducatorRoute = useMatch('/educator/*')

  return (
    <>
      <Toaster />
      <div className='text-default min-h-screen bg-white'>
        {showlogin ? <Login /> : <></>}
        {!isEducatorRoute && <Navbar />}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/course-list' element={<CourseList />} />
          <Route path='/course-list/:input' element={<CourseList />} />
          <Route path='/course/:id' element={<CourseDetail />} />
          <Route path='/my-enrollments' element={<MyEnrollment />} />
          <Route path='/player/:courseId' element={<Player />} />
          <Route path='/loading/:path' element={<Loading />} />

          <Route path='/educator' element={<Educator />}>
            <Route path='' element={<Dashboard />} />
            <Route path='add-course' element={<AddCourse />} />
            <Route path='my-courses' element={<MyCourses />} />
            <Route path='update-course/:courseId' element={<UpdateCourse />} />
            <Route path='student-enrolled' element={<StudentEnrolled />} />
          </Route>
        </Routes>
      </div>
    </>
  )
}

export default App
