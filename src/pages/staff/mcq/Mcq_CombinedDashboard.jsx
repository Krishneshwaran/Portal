import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Mcq_sectionDetails from "./Mcq_sectionDetails";
import LibraryModal from "../../../components/staff/mcq/McqLibraryModal"; // Import the LibraryModal component

const Mcq_CombinedDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData } = location.state;
  const [sections, setSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    if (formData.assessmentOverview.sectionDetails === "Yes" && sections.length === 0) {
      const defaultSection = {
        id: 1,
        sectionName: "Section 1",
        numQuestions: 10,
        sectionDuration: 10,
      };
      setSections([defaultSection]);
    }

    // Retrieve selected questions from sessionStorage
    const storedQuestions = sessionStorage.getItem('selectedQuestions');
    if (storedQuestions) {
      const selectedQuestions = JSON.parse(storedQuestions);
      const updatedSections = sections.map((section, index) =>
        index === 0
          ? { ...section, selectedQuestions: selectedQuestions }
          : section
      );
      setSections(updatedSections);
    }

    // Set up the beforeunload event listener
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // This is required for some browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Clean up the event listener on component unmount
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData.assessmentOverview.sectionDetails, sections.length]);

  const handleAddSection = () => {
    const newSection = {
      id: sections.length + 1,
      sectionName: `Section ${sections.length + 1}`,
      numQuestions: 10,
      sectionDuration: 10,
    };
    setSections([...sections, newSection]);
  };

  const handleAddQuestion = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const updateSection = (id, updatedSection) => {
    const updatedSections = sections.map((section) => (section.id === id ? updatedSection : section));
    setSections(updatedSections);
  };

  const handleLibraryButtonClick = () => {
    setIsLibraryModalOpen(true);
  };

  const handleLibraryModalClose = () => {
    setIsLibraryModalOpen(false);
  };

  const steps = ["Assessment Overview", "Test Configuration", "Structure Setup"];

  return (
    <div className="bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto flex">
        {/* Stepper - moved to the left side */}
        <div className="w-16 mr-8 flex flex-col items-center relative">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="my-12">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-medium
                    ${index === 2 ? "bg-amber-400 text-black" : "bg-amber-400 text-black"}`}
                >
                  {index + 1}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="h-20 w-0.5 bg-gray-200 relative">
                  <div
                    className="absolute top-0 left-0 w-0.5 bg-amber-400 transition-all duration-300"
                    style={{ height: "100%" }}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md p-8">
            {formData.assessmentOverview.sectionDetails === "Yes" ? (
              <div>
                {sections.map((section) => (
                  <Mcq_sectionDetails
                    key={section.id}
                    section={section}
                    onUpdate={(updatedSection) => updateSection(section.id, updatedSection)}
                  />
                ))}
              </div>
            ) : (
              <div>
                <h3 className="text-xl text-[#000975] font-semibold mb-2 text-center">Add & Manage Your Questions</h3>
                <p className="text-sm text-[#000975] mb-6 text-center">
                  Choose how you'd like to add questions to your assessment. Select the method that works best for you
                  to quickly build your test.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => navigate("/mcq/CreateQuestion")}
                    className="p-10 bg-white border-2 border-amber-400 rounded-lg hover:bg-amber-50 transition-all duration-300"
                  >
                    <div className="text-4xl text-amber-400 mb-4">+</div>
                    <h3 className="text-xl font-semibold text-[#000975] mb-2">Create Manually</h3>
                    <p className="text-sm text-[#000975]">Enter each question and its options directly.</p>
                  </button>

                  <button
                    onClick={() => navigate("/mcq/bulkUpload")}
                    className="p-10 bg-white border-2 border-amber-400 rounded-lg hover:bg-amber-50 transition-all duration-300"
                  >
                    <div className="text-4xl text-amber-400 mb-4">📁</div>
                    <h3 className="text-xl font-semibold text-[#000975] mb-2">Bulk Upload</h3>
                    <p className="text-sm text-[#000975]">Upload questions via CSV or Excel file.</p>
                  </button>

                  <button
                    onClick={handleLibraryButtonClick}
                    className="p-10 bg-white border-2 border-amber-400 rounded-lg hover:bg-amber-50 transition-all duration-300"
                  >
                    <div className="text-4xl text-amber-400 mb-4">🔖</div>
                    <h3 className="text-xl font-semibold text-[#000975] mb-2">Question Library</h3>
                    <p className="text-sm text-[#000975]">Choose from your saved question library.</p>
                  </button>

                  <button
                    onClick={() => navigate("/mcq/aigenerator")}
                    className="p-10 bg-white border-2 border-amber-400 rounded-lg hover:bg-amber-50 transition-all duration-300"
                  >
                    <div className="text-4xl text-amber-400 mb-4">🤖</div>
                    <h3 className="text-xl font-semibold text-[#000975] mb-2">AI Generator</h3>
                    <p className="text-sm text-[#000975]">Generate questions using AI.</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLibraryModalOpen && (
        <LibraryModal onClose={handleLibraryModalClose} />
      )}
    </div>
  );
};

export default Mcq_CombinedDashboard;
