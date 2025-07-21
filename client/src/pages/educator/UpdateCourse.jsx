import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../../context/AddContext'
import uniqid from 'uniqid';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// Mock assets and AppContext for standalone demonstration
const assets = {
  file_upload_icon: 'https://placehold.co/24x24/cccccc/white?text=Upload',
  dropdown_icon: 'https://placehold.co/16x16/cccccc/white?text=V',
  cross_icon: 'https://placehold.co/16x16/cccccc/white?text=X'
};

const UpdateCourse = () => { // courseId prop to fetch specific course
  const { backend_url, token } = useContext(AppContext);

  const { courseId } = useParams()

  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null); // For new image upload
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState(''); // To display existing thumbnail
  const [chapters, setChapters] = useState([]);

  const [showPopUp, setShowPopUp] = useState(false);
  const [currChapterId, setCurrChapterId] = useState(null);
  const [isEditingLecture, setIsEditingLecture] = useState(false); // To differentiate add/edit lecture
  const [currentLectureIndex, setCurrentLectureIndex] = useState(null); // To store index of lecture being edited

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });

  // Simulate fetching course data based on courseId
  const fetchCourseData = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/educator/get-course/${courseId}`, { headers: { token } });

      if (!response.data.success) {
        toast.error(response.data.error);
        return;
      }

      const courseData = response.data.course;

      setCourseTitle(courseData.courseTitle);
      setCoursePrice(courseData.coursePrice);
      setDiscount(courseData.discount);
      setCurrentThumbnailUrl(courseData.courseThumbnail);
      setChapters(courseData.courseContent.map(chapter => ({ ...chapter, collapsed: false }))); // Add collapsed state

      if (quillRef.current) {
        quillRef.current.root.innerHTML = courseData.courseDescription;
      }
    } catch (error) {
      toast.error('Failed to load course data.');
    }
  };

  // Effect to initialize Quill and load course data
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }

    fetchCourseData();
  }, [courseId, backend_url, token]); // Depend on courseId, backend_url, token

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:');
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? Math.max(...chapters.map(c => c.chapterOrder)) + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex = null) => {
    setCurrChapterId(chapterId);
    if (action === 'add') {
      setIsEditingLecture(false);
      setLectureDetails({
        lectureTitle: '',
        lectureDuration: '',
        lectureUrl: '',
        isPreviewFree: false,
      });
      setShowPopUp(true);
    } else if (action === 'edit' && lectureIndex !== null) {
      setIsEditingLecture(true);
      setCurrentLectureIndex(lectureIndex);
      const chapter = chapters.find(c => c.chapterId === chapterId);
      if (chapter) {
        const lectureToEdit = chapter.chapterContent[lectureIndex];
        setLectureDetails({
          lectureTitle: lectureToEdit.lectureTitle,
          lectureDuration: lectureToEdit.lectureDuration,
          lectureUrl: lectureToEdit.lectureUrl,
          isPreviewFree: lectureToEdit.isPreviewFree,
        });
      }
      setShowPopUp(true);
    } else if (action === 'remove') {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            const updatedContent = chapter.chapterContent.filter((_, idx) => idx !== lectureIndex);
            // Re-order lectures after removal
            const reorderedContent = updatedContent.map((lecture, idx) => ({
              ...lecture,
              lectureOrder: idx + 1
            }));
            return { ...chapter, chapterContent: reorderedContent };
          }
          return chapter;
        })
      );
    }
  };

  const saveLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currChapterId) {
          if (isEditingLecture) {
            // Update existing lecture
            const updatedContent = chapter.chapterContent.map((lecture, idx) =>
              idx === currentLectureIndex ? { ...lecture, ...lectureDetails } : lecture
            );
            return { ...chapter, chapterContent: updatedContent };
          } else {
            // Add new lecture
            const newLecture = {
              ...lectureDetails,
              lectureOrder:
                chapter.chapterContent.length > 0
                  ? Math.max(...chapter.chapterContent.map(l => l.lectureOrder)) + 1
                  : 1,
              lectureId: uniqid(),
            };
            return { ...chapter, chapterContent: [...chapter.chapterContent, newLecture] };
          }
        }
        return chapter;
      })
    );
    setShowPopUp(false);
    setIsEditingLecture(false);
    setCurrentLectureIndex(null);
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const courseData = {
        courseId: courseId, // Pass the course ID for update
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters.map(chapter => ({
          ...chapter,
          chapterContent: chapter.chapterContent.map(lecture => ({
            ...lecture,
            lectureDuration: Number(lecture.lectureDuration) // Ensure duration is number
          }))
        }))
      };

      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      if (image) { // Only append new image if selected
        formData.append('image', image);
      }

      console.log(courseData);
      const response = await axios.put(`${backend_url}/api/educator/update-course/${courseId}`, formData, { headers: { token }});

      if (response.data.success) {
        toast.success(response.data.message);
        // Optionally, reset form or redirect
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred during update.');
      console.error('Error updating course:', error);
    }
  };

  return (
    <div className="p-6 pl-24 pt-8 max-w-[700px] mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Update Course</h1>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label htmlFor="courseTitle" className="font-medium block mb-1 text-gray-700">Course Title</label>
          <input
            id="courseTitle"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type="text"
            placeholder="Course Title"
            required
          />
        </div>

        <div>
          <label htmlFor="courseDescription" className="font-medium block mb-1 text-gray-700">Course Description</label>
          <div ref={editorRef} id="courseDescription" className="bg-white rounded-lg border min-h-[120px] shadow-sm" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="coursePrice" className="font-medium block mb-1 text-gray-700">Course Price</label>
            <input
              id="coursePrice"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type="number"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label htmlFor="discount" className="font-medium block mb-1 text-gray-700">Discount (%)</label>
            <input
              id="discount"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
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
          <label className="font-medium block mb-1 text-gray-700">Course Thumbnail</label>
          <label htmlFor="thumbnailImage" className="block border-dashed border-2 border-gray-300 p-4 rounded-lg cursor-pointer hover:border-blue-500 transition duration-200">
            <input
              type="file"
              id="thumbnailImage"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
              hidden
            />
            <div className="flex items-center gap-4">
              <img src={assets.file_upload_icon} alt="Upload Icon" className="w-6 h-6" />
              <span className="text-gray-600">Click to upload new thumbnail (optional)</span>
            </div>
            {(image || currentThumbnailUrl) && (
              <img
                src={image ? URL.createObjectURL(image) : currentThumbnailUrl}
                alt="Thumbnail Preview"
                className="mt-4 w-48 h-auto object-cover rounded-md shadow-md"
              />
            )}
          </label>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Course Content</h2>
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapter.chapterId} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  <img
                    onClick={() => handleChapter('toggle', chapter.chapterId)}
                    src={assets.dropdown_icon}
                    className={`w-4 h-4 cursor-pointer transition-transform duration-200 ${chapter.collapsed ? '-rotate-90' : 'rotate-0'
                      }`}
                    alt="Toggle"
                  />
                  <span>
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{chapter.chapterContent.length} Lectures</span>
                  <button
                    type="button"
                    onClick={() => handleChapter('remove', chapter.chapterId)}
                    className="p-1 rounded-full hover:bg-gray-200 transition duration-200"
                    title="Remove Chapter"
                  >
                    <img src={assets.cross_icon} alt="Remove" className="w-4 h-4 cursor-pointer" />
                  </button>
                </div>
              </div>
              {!chapter.collapsed && (
                <div className="mt-3 space-y-2">
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div key={lecture.lectureId || lectureIndex} className="flex justify-between items-center text-sm bg-white p-2 rounded-md border border-gray-100 shadow-xs">
                      <span className="text-gray-700">
                        {lectureIndex + 1}. {lecture.lectureTitle} - {lecture.lectureDuration} mins -{' '}
                        <a className="text-blue-500 underline hover:text-blue-700" href={lecture.lectureUrl} target="_blank" rel="noopener noreferrer">
                          Link
                        </a>{' '}
                        - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLecture('edit', chapter.chapterId, lectureIndex)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                          className="p-1 rounded-full hover:bg-gray-200 transition duration-200"
                          title="Remove Lecture"
                        >
                          <img src={assets.cross_icon} alt="Remove" className="w-4 h-4 cursor-pointer" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleLecture('add', chapter.chapterId)}
                    className="text-blue-600 text-sm hover:underline mt-2"
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
            className="text-blue-700 hover:underline font-medium text-base mt-4"
          >
            + Add Chapter
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 text-lg font-semibold shadow-md"
        >
          Update Course
        </button>
      </form>

      {showPopUp && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{isEditingLecture ? 'Edit Lecture' : 'Add Lecture'}</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="lectureTitle" className="block mb-1 text-sm font-medium text-gray-700">Lecture Title</label>
                <input
                  id="lectureTitle"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  value={lectureDetails.lectureTitle}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="lectureDuration" className="block mb-1 text-sm font-medium text-gray-700">Duration (minutes)</label>
                <input
                  id="lectureDuration"
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  value={lectureDetails.lectureDuration}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })
                  }
                  min={0}
                  required
                />
              </div>
              <div>
                <label htmlFor="lectureUrl" className="block mb-1 text-sm font-medium text-gray-700">Lecture URL</label>
                <input
                  id="lectureUrl"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  value={lectureDetails.lectureUrl}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPreviewFree"
                  checked={lectureDetails.isPreviewFree}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })
                  }
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="isPreviewFree" className="text-sm font-medium text-gray-700">Is Preview Free?</label>
              </div>
              <button
                onClick={saveLecture}
                type="button"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                {isEditingLecture ? 'Update Lecture' : 'Add Lecture'}
              </button>
            </div>

            <button
              onClick={() => setShowPopUp(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 transition duration-200"
              title="Close"
            >
              <img src={assets.cross_icon} alt="Close" className="w-5 h-5 cursor-pointer" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateCourse;
