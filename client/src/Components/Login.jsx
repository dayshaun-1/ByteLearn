import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AddContext';
import axios from 'axios'

const Login = () => {

  const { backend_url, setToken, setShowLogin, setIsEducator } = useContext(AppContext)

  const [state, setState] = useState('Login')
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    isEducator: false,
  })

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData(data => ({ ...data, [name]: value }));
  }

  const onLogin = async (e) => {
    e.preventDefault();
    let newUrl = backend_url;
    if (state === 'Login') {
      newUrl += '/api/user/login'
    } else {
      newUrl += '/api/user/signup'
    }

    const response = await axios.post(newUrl, data);
    if (response.data.success) {
      setToken(response.data.token);
      setIsEducator(response.data.isEducator);
      localStorage.setItem('token', response.data.token);
      setShowLogin(false);
    } else {
      alert(response.data.message);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <form onSubmit={onLogin} className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">{state}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt="Close"
            className="w-5 h-5 cursor-pointer hover:scale-110 transition"
          />
        </div>

        <div className="flex flex-col gap-4">
          {state === 'Sign Up' && (
            <input
              onChange={onChangeHandler}
              name='name'
              value={data.name}
              type="text"
              placeholder="Enter Your Name"
              required
              className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-blue-600"
            />
          )}
          <input
            onChange={onChangeHandler}
            name='email'
            value={data.email}
            type="email"
            placeholder="Enter Email"
            required
            className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-blue-600"
          />
          <input
            onChange={onChangeHandler}
            name='password'
            value={data.password}
            type="password"
            placeholder="Enter Password"
            required
            className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-blue-600"
          />
          {state === 'Sign Up' && (
            <div className="flex items-start gap-2 mt-4 text-sm text-gray-600">
              <input
                name='isEducator'
                value={data.isEducator}
                onChange={(e) => setData(data => ({ ...data, [e.target.name]: e.target.checked }))}
                type="checkbox"
                className="mt-1" />
              <p>Become Educator</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          {state === 'Sign Up' ? 'Create an Account' : 'Login'}
        </button>

        {state === 'Login' ? <></> :
          <div className="flex items-start gap-2 mt-4 text-sm text-gray-600">
            <input type="checkbox" required className="mt-1" />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
        }

        <div className="mt-4 text-sm text-center text-gray-700">
          {state === 'Login' ? (
            <p>
              Create new Account?{' '}
              <span
                onClick={() => setState('Sign Up')}
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Click here
              </span>
            </p>
          ) : (
            <p>
              Already have an Account?{' '}
              <span
                onClick={() => setState('Login')}
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default Login