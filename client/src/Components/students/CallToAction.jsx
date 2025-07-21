import React from 'react'
import { assets } from '../../assets/assets'

const CallToAction = () => {
  return (
    <section className="bg-blue-500 text-white py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">

        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          Unlock Your Potential: Education Without Limits
        </h1>

        <p className="text-lg text-blue-100 mb-8">
          Discover a world of knowledge at your fingertips. Our platform empowers you to learn at your own pace, on your own schedule, from any location. No matter your goals, we provide the resources you need to succeed.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-100 transition">
            Get Started
          </button>
          <button className="flex items-center justify-center gap-2 border border-white px-6 py-3 rounded-lg bg-white text-blue-600 hover:bg-blue-100 font-semibold transition">
            Learn More
            <img src={assets.arrow_icon} alt="arrow icon" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default CallToAction