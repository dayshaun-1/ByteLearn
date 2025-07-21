import React, { useContext } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AddContext'

const Navbar = () => {
  const { isEducator } = useContext(AppContext)

  const menuItems = [
    { name: 'Dashboard', path: '/educator', icon: assets.home_icon },
    { name: 'Add Course', path: '/educator/add-course', icon: assets.add_icon },
    { name: 'My Courses', path: '/educator/my-courses', icon: assets.my_course_icon },
    { name: 'Student Enrolled', path: '/educator/student-enrolled', icon: assets.person_tick_icon },
    { name: 'Home', path: '/', icon: assets.home_icon },
  ]

  return isEducator ? (
    <nav className="w-full bg-white shadow-lg px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold text-blue-600">
        ByteLearn
      </Link>

      <div className="flex gap-6">
        {menuItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.name}
            end={item.path === '/educator'}
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <img src={item.icon} alt={item.name} className="w-5 h-5" />
            <span className='hidden md:inline-block'>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  ) : null
}

export default Navbar
