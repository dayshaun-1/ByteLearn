import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className="bg-gray-200 text-gray-800 mt-12 mb-4" id='contact'>
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">ByteLearn</h2>
          <p className="text-sm text-gray-600">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem dolore odio qui, cupiditate vitae in a, expedita distinctio ullam incidunt alias id, harum eum. Distinctio tempora libero facilis molestiae enim?
          </p>
          <div className="flex space-x-4 mt-2">
            <img src={assets.facebook_icon} alt="Facebook" className="w-6 h-6 hover:opacity-75 transition" />
            <img src={assets.twitter_icon} alt="Twitter" className="w-6 h-6 hover:opacity-75 transition" />
            <img src={assets.instagram_icon} alt="LinkedIn" className="w-6 h-6 hover:opacity-75 transition" />
          </div>
        </div>

        {/* Center Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">COMPANY</h2>
          <ul className="space-y-2 text-sm">
            <li><a href='#' className="hover:text-blue-600 cursor-pointer">Home</a></li>
            <li><a href='#' className="hover:text-blue-600 cursor-pointer">About Us</a></li>
            <li><a href='#' className="hover:text-blue-600 cursor-pointer">Contact Us</a></li>
            <li><a href='#' className="hover:text-blue-600 cursor-pointer">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Right Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">GET IN TOUCH</h2>
          <ul className="space-y-2 text-sm">
            <li className="text-gray-700">+1-643-648-2352</li>
            <li className="text-gray-700">bytelearn@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <hr className="border-gray-300" />
      <p className="text-center text-sm text-gray-500 py-4">
        &copy; 2025 ByteLearn.com - All Rights Reserved
      </p>
    </div>
  )
}

export default Footer