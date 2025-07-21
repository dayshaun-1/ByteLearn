import React, { useEffect, useState } from 'react'

const Rating = ({ initialRating = 0, onRate }) => {
  const [rating, setRating] = useState(initialRating)

  const handleRating = (value) => {
    setRating(value)
    if (onRate) onRate(value)
  }

  useEffect(() => {
    setRating(initialRating)
  }, [initialRating])

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1
        return (
          <span
            key={index}
            onClick={() => handleRating(starValue)}
            className={`text-2xl sm:text-3xl cursor-pointer transition-colors duration-150 hover:scale-110 ${
              starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            title={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            ★
          </span>
        )
      })}
    </div>
  )
}

export default Rating
