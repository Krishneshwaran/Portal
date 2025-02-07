import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Codingvector from "../../src/assets/codingsvg.svg"; // Adjust the path as necessary
import SkillQuestionvector from "../../src/assets/SkillQuestionvectorsvg.svg"; // Adjust the path as necessary
import QuestionLibrary from "../../src/assets/questionlibrary.svg";
import TetsLibrary from "../../src/assets/TestLibraryIcon.svg";

const Library = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#ECF2FE] pt-24">
      <div className="w-full max-w-4xl mx-auto bg-white p-12 rounded-lg shadow-lg">
        <h4 className="text-2xl font-bold text-[#111933] text-center mb-4">Library</h4>
        <h6 className="text-md font text-[#111933] opacity-50 text-center mb-8">
          Select from skill-based questions or coding challenges to tailor your assessment effortlessly.
        </h6>
        <div className="flex justify-center items-center space-x-6 mb-6">
          {/* MCQ Library Card */}
          <div
            className="bg-[#ECF2FE] h-40 w-80 flex flex-col justify-center items-center rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-102 cursor-pointer"
            onClick={handleCardClick}
          >
            <div className="flex items-center justify-center pl-4">
              <img src={SkillQuestionvector} alt="Quiz" className="w-24 h-24 mr-4" />
              <h6 className="font text-black text-left mr-4">
                Skill Based<br /> Assessment Library
              </h6>
            </div>
          </div>
          {/* "or" Text */}
          <div className="flex justify-center items-center">
            <h4 className="text-sm font text-[#111933] opacity-50">or</h4>
          </div>
          {/* Coding Library Card */}
          <div
            className="bg-[#ECF2FE] h-40 w-80 flex flex-col justify-center items-center rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-102 cursor-pointer"
            onClick={() => navigate("/library/coding")}
          >
            <div className="flex items-center justify-center pl-4">
              <img src={Codingvector} alt="Coding" className="w-24 h-24 mr-4" />
              <h6 className="font text-black text-left mr-4">
                Coding<br /> Assessment Library
              </h6>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl relative mb-12">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleCloseModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h4 className="text-2xl font-bold text-[#111933] text-center mb-4">Choose a Library</h4>
            <h6 className="text-xs font text-[#111933] opacity-50 text-center mb-8">
              Select from skill-based questions or coding challenges to tailor your assessment effortlessly.
            </h6>
            <div className="flex justify-center space-x-4 mb-4">
              <div
                className="bg-[#ECF2FE] h-28 w-64 flex flex-col justify-center items-center rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-102 cursor-pointer"
                onClick={() => handleNavigate("/library/mcq")}
                    >
                <div className="flex items-center justify-center ">
                  <img src={QuestionLibrary} alt="Coding" className="w-18 h-16 mr-4 ml-6" />
                  <div>
                  <h6 className="font text-black text-left ">
                    Question Library
                  </h6>
                  <h6 className="text-xs text-[#111933] opacity-50 text-left pr-4 pt-2 ">
                  Access your saved question library.
                  </h6>
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
            <h4 className="text-sm font text-[#111933] opacity-50">or</h4>
          </div>
              <div
                className="bg-[#ECF2FE] h-28 w-64 flex flex-col justify-center items-center rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-102 cursor-pointer"
                onClick={() => handleNavigate("/library/mcq/test")}
              >
                <div className="flex items-center justify-center">
                  <img src={TetsLibrary} alt="Coding" className="w-18 h-16 mr-4 ml-6" />
                  <div>
                  <h6 className="font text-black text-left ">
                    Test Library
                  </h6>
                  <h6 className="text-xs text-[#111933] opacity-50 text-left pr-4 pt-2  ">
                  Access your saved test library.
                  </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
