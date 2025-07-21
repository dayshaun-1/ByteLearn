import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SearchBar = ({data}) => {

  const navigate = useNavigate();
  const [input, setInput] = useState(data ? data : '');

  const onSearchHandler = (e)=>{
    e.preventDefault();
    navigate('/course-list/' + input);
  }

  return (
    <form onSubmit={onSearchHandler} className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <input
        onChange={e => setInput(e.target.value)}
        value={input}
        type="text"
        placeholder="Search for courses..."
        className="w-full sm:w-96 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        type='submit'
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Search
      </button>
    </form>
  )
}

export default SearchBar
