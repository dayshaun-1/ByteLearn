import React, { useContext, useEffect, useRef, useState } from 'react'
import uniqid from 'uniqid'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AddContext'
import toast from 'react-hot-toast'
import axios from 'axios'

const AddCourse = () => {

  const { backend_url, token } = useContext(AppContext);

  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [chapters, setChapters] = useState([])

  const [showPopUp, setShowPopUp] = useState(false)
  const [currChapterId, setCurrChapterId] = useState(null)

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  })

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      })
    }
  }, [])

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:')
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        }
        setChapters([...chapters, newChapter])
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId))
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      )
    }
  }

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrChapterId(chapterId)
      setShowPopUp(true)
    } else if (action === 'remove') {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1)
          }
          return chapter
        })
      )
    }
  }

  const addLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder:
              chapter.chapterContent.length > 0
                ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
                : 1,
            lectureId: uniqid(),
          }
          chapter.chapterContent.push(newLecture)
        }
        return chapter
      })
    )
    setShowPopUp(false)
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (!image) {
        toast.error('Thumbnail Not Selected!');
      }

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters
      }

      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      formData.append('image', image);

      const response = await axios.post(`${backend_url}/api/educator/add-course`, formData, { headers: { token } });

      if (response.data.success) {
        toast.success(response.data.message);
        setCourseTitle('');
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([])
        quillRef.current.root.innerHTML = "";
      }
      else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="p-6 pl-24 pt-8 max-w-[700px]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="font-medium block mb-1">Course Title</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type="text"
            placeholder="Course Title"
            required
          />
        </div>

        <div>
          <label className="font-medium block mb-1">Course Description</label>
          <div ref={editorRef} className="bg-white rounded-lg border min-h-[120px]" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="font-medium block mb-1">Course Price</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type="number"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="font-medium block mb-1">Discount (%)</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setDiscount(e.target.value)}
              value={discount}
              type="number"
              min={0}
              max={100}
              placeholder="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="font-medium block mb-1">Course Thumbnail</label>
          <label className="block border-dashed border-2 border-gray-300 p-4 rounded-lg cursor-pointer hover:border-blue-500">
            <input
              type="file"
              id="thumbnailImage"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
              hidden
            />
            <div className="flex items-center gap-4">
              <img src={assets.file_upload_icon} alt="" className="w-6 h-6" />
              <span>Click to upload</span>
            </div>
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Thumbnail Preview"
                className="mt-4 w-48 rounded-md shadow"
              />
            )}
          </label>
        </div>

        <div className="space-y-4">
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapter.chapterId} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-medium">
                  <img
                    onClick={() => handleChapter('toggle', chapter.chapterId)}
                    src={assets.dropdown_icon}
                    className={`w-4 h-4 cursor-pointer transition-transform ${chapter.collapsed && '-rotate-180'
                      }`}
                    alt="Toggle"
                  />
                  <span>
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{chapter.chapterContent.length} Lectures</span>
                  <img
                    onClick={() => handleChapter('remove', chapter.chapterId)}
                    src={assets.cross_icon}
                    alt="Remove"
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
              {!chapter.collapsed && (
                <div className="mt-3 space-y-2">
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className="flex justify-between items-center text-sm">
                      <span>
                        {lectureIndex + 1}. {lecture.lectureTitle} - {lecture.lectureDuration} mins -{' '}
                        <a className="text-blue-500 underline" href={lecture.lectureUrl} target="_blank">
                          Link
                        </a>{' '}
                        - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                      </span>
                      <img
                        onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                        src={assets.cross_icon}
                        alt=""
                        className="w-4 h-4 cursor-pointer"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleLecture('add', chapter.chapterId)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    + Add Lecture
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleChapter('add')}
            className="text-blue-700 hover:underline font-medium"
          >
            + Add Chapter
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Course
        </button>
      </form>

      {showPopUp && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4">Add Lecture</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Lecture Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lectureDetails.lectureTitle}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Duration (minutes)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lectureDetails.lectureDuration}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Lecture URL</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lectureDetails.lectureUrl}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={lectureDetails.isPreviewFree}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })
                  }
                />
                <label className="text-sm font-medium">Is Preview Free?</label>
              </div>
              <button
                onClick={addLecture}
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add Lecture
              </button>
            </div>

            <img
              onClick={() => setShowPopUp(false)}
              src={assets.cross_icon}
              alt=""
              className="w-5 h-5 absolute top-4 right-4 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AddCourse
