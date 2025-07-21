import React from 'react'
import { dummyTestimonial, assets } from '../../assets/assets'

const Review = () => {
  return (
    <section className="bg-white py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto text-center">

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Our Learner's Journeys
        </h1>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Read testimonials from our learners and see how our platform has supported their journeys of transformation and success.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dummyTestimonial.map((review, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition"
            >

              <img
                src={review.image}
                alt={review.name}
                className="w-20 h-20 rounded-full object-cover mb-4"
              />

              <div className="mb-3">
                <h2 className="text-lg font-semibold text-gray-800">{review.name}</h2>
                <p className="text-sm text-gray-500">{review.role}</p>
              </div>

              <div className="flex justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={i < Math.floor(review.rating) ? assets.star : assets.star_blank}
                    alt="star"
                    className="w-4 h-4"
                  />
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed">
                "{review.feedback}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Review