import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AddContext'
import toast from 'react-hot-toast';
import axios from 'axios'

const Navbar = () => {
  const {
    backend_url,
    token,
    setToken,
    setShowLogin,
    navigate,
    isEducator,
    setIsEducator
  } = useContext(AppContext)

  const [isOpen, setIsOpen] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setIsEducator(false);
    navigate('/');
  }

  const handleToEducator = async () => {
    try {
      setLoading(true);
      const newUrl = backend_url + '/api/user/toeducator'
      const response = await axios.patch(newUrl, {}, { headers: { token } });

      if (response.data.success) {
        setIsEducator(true);
        setToken(response.data.token);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  }

  return (
    <>
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="flex items-center justify-between">
          <p onClick={() => navigate('/')} className="text-2xl cursor-pointer font-bold text-blue-600">ByteLearn</p>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-4">
            {token && (
              <>
                {isEducator ? (
                  <button
                    onClick={() => navigate('/educator')}
                    className="text-sm px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                  >
                    Educator Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="text-sm px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                  >
                    Become Educator
                  </button>
                )}
                <Link
                  to="/my-enrollments"
                  className="text-sm text-gray-700 hover:text-blue-600 transition"
                >
                  My Enrollments
                </Link>
              </>
            )}
            <button
              onClick={() => navigate('/')}
              className="text-sm px-4 py-2 rounded-lg hover:text-blue-700 transition"
            >
              Home
            </button>
            {!token
              ? <button onClick={() => setShowLogin(true)} className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Sign In
              </button>
              : <button onClick={logout} className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Log Out
              </button>
            }
          </div>

          {/* Mobile Toggle */}
          <button
            className="sm:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            <img className='w-8' src={assets.hamburger_icon} alt='Open' />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="sm:hidden mt-4 flex flex-col space-y-2">
            <button
              onClick={() => navigate('/')}
              className="text-sm px-4 py-2 rounded-lg hover:text-blue-700 transition"
            >
              Home
            </button>
            {token && (
              <>
                <button
                  onClick={isEducator ? () => navigate('/educator') : () => setShowConfirmModal(true)}
                  className="text-sm px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                >
                  {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                </button>
                <Link
                  to="/my-enrollments"
                  className="text-sm text-center text-gray-700 hover:text-blue-600 transition"
                >
                  My Enrollments
                </Link>
              </>
            )}
            <button
              onClick={() => navigate('/')}
              className="text-sm px-4 py-2 rounded-lg hover:text-blue-700 transition"
            >
              Home
            </button>
            {!token
              ? <button onClick={() => setShowLogin(true)} className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Sign In
              </button>
              : <button onClick={logout} className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Log Out
              </button>
            }
          </div>
        )}
      </nav>

      {/* Educator Confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Become an Educator</h2>
            <p className="text-sm text-gray-600">
              By clicking "I Agree", you accept our{' '}
              <a href="/company-policy" target="_blank" className="text-blue-600 underline">
                Educator Policy
              </a>. You are responsible for the quality, originality, and compliance of your content.
            </p>

            <div className="flex justify-end gap-4 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleToEducator}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'I Agree'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
