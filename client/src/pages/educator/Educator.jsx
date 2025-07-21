import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../Components/educator/Navbar'
import Footer from '../../Components/educator/Footer'

const Educator = () => {
  return (
    <div>
      <Navbar />
      <div>
        {<Outlet />}
      </div>
      <Footer />
    </div>
  )
}

export default Educator
