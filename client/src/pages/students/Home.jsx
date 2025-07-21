import React from 'react'
import Hero from '../../Components/students/Hero'
import CourseSection from '../../Components/students/CourseSection'
import Review from '../../Components/students/Review'
import CallToAction from '../../Components/students/CallToAction'
import Footer from '../../Components/students/Footer'

const Home = () => {
  return (
    <div>
      <Hero />
      <CourseSection />
      <Review />
      <CallToAction />
      <Footer />
    </div>
  )
}

export default Home
