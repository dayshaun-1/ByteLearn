import React from 'react'
import SearchBar from './SearchBar'

const Hero = () => {
  return (
    <section className="bg-blue-50 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
          Welcome to ByteLearn
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Discover courses, learn new skills, and level up your education journey.
        </p>

        <SearchBar />
      </div>
    </section>
  )
}

export default Hero