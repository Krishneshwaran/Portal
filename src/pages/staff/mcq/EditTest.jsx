import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronRight } from "lucide-react";

// --- AssessmentOverviewForm Component ---
const AssessmentOverviewForm = ({ formData, handleChange, errors }) => (
  <div>
    <h3 className="text-xl font-semibold mb-2 text-[#111933]">Assessment Overview</h3>
    <div className="grid grid-cols-2 gap-8">
      {/* Assessment Name */}
      <div>
        <label className="text-md font-medium text-[#111933]">Assessment Name *</label>
        <input
          type="text"
          name="name"
          value={formData.assessmentOverview.name || ""}
          onChange={(e) => handleChange(e, "assessmentOverview")}
          className="w-full h-12 px-4 border rounded-lg"
        />
        {errors.name && <p className="text-red-500">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="text-md font-medium text-[#111933]">Description *</label>
        <textarea
          name="description"
          value={formData.assessmentOverview.description || ""}
          onChange={(e) => handleChange(e, "assessmentOverview")}
          className="w-full h-20 px-4 border rounded-lg"
        />
        {errors.description && <p className="text-red-500">{errors.description}</p>}
      </div>

    {/* Registration Dates */}
    <div>
      <label className="text-md font-medium text-[#111933]">Registration Start *</label>
      <input
        type="datetime-local"
        name="registrationStart"
        value={formData.assessmentOverview.registrationStart || ""}
        className="w-full h-12 px-4 border rounded-lg bg-gray-100 cursor-not-allowed"
        disabled
      />
    </div>

      <div>
        <label className="text-md font-medium text-[#111933]">Registration End *</label>
        <input
          type="datetime-local"
          name="registrationEnd"
          value={formData.assessmentOverview.registrationEnd || ""}
          onChange={(e) => handleChange(e, "assessmentOverview")} 
          className="w-full h-12 px-4 border rounded-lg"
        />
      </div>

      <div>
        <label className="text-md font-medium text-[#111933]">Guidelines</label>
        <textarea
          name="guidelines"
          value={formData.assessmentOverview.guidelines || ""}
          onChange={(e) => handleChange(e, "assessmentOverview")}
          className="w-full h-20 px-4 border rounded-lg"
        />
      </div>
    </div>
  </div>
);

// --- TestConfigurationForm Component ---
const TestConfigurationForm = ({ formData, handleChange, errors, handleInputChange }) => (
  <div>
    <h3 className="text-xl font-semibold mt-8 mb-2 text-[#111933]">Test Configuration</h3>

    {/* Conditionally render fields based on sectionDetails */}
    {formData.assessmentOverview.sectionDetails === "No" && (
      <div className="grid grid-cols-2 gap-8">
        {/* Number of Questions */}
        <div>
          <label className="text-md font-medium text-[#111933]">Number of Questions *</label>
          <input
            type="text"
            name="questions"
            value={formData.testConfiguration.questions || ""}
            className="w-full h-12 px-4 border rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
          {errors.questions && <p className="text-red-500">{errors.questions}</p>}
        </div>

        {/* Total Marks */}
        <div>
          <label className="text-md font-medium text-[#111933]">Total Marks *</label>
          <input
            type="text"
            name="totalMarks"
            value={formData.testConfiguration.totalMarks || ""}
            className="w-full h-12 px-4 border rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
          />
          {errors.totalMarks && <p className="text-red-500">{errors.totalMarks}</p>}
        </div>
 

        {/* Duration */}
        <div className="flex items-center">
          <label className="text-md font-medium text-[#111933] flex-1">Duration *</label>
          <div className="w-1/2 flex items-center space-x-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="hours"
              value={formData.testConfiguration.duration.hours || ""}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                handleChange(
                  {
                    target: {
                      name: "duration",
                      value: { hours: onlyNums, minutes: formData.testConfiguration.duration.minutes },
                    },
                  },
                  "testConfiguration"
                );
              }}
              className={`w-1/2 p-2 border rounded-[10px] text-sm text-center ${errors.duration ? "border-red-500" : ""}`}
              placeholder="HH"
            />
            <span>:</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="minutes"
              value={formData.testConfiguration.duration.minutes || ""}
              onChange={(e) => {
                let onlyNums = e.target.value.replace(/[^0-9]/g, "");
                if (Number.parseInt(onlyNums) > 59) {
                  onlyNums = "59";
                }
                handleChange(
                  {
                    target: {
                      name: "duration",
                      value: { hours: formData.testConfiguration.duration.hours, minutes: onlyNums },
                    },
                  },
                  "testConfiguration"
                );
              }}
              className={`w-1/2 p-2 border rounded-[10px] text-sm text-center ${errors.duration ? "border-red-500" : ""}`}
              placeholder="MM"
            />
          </div>
        </div>
      </div>
    )}

    <div className="grid grid-cols-2 gap-8">
      {/* Pass Percentage - Always Shown */}
      <div>
        <label className="text-md font-medium text-[#111933]">Pass Percentage *</label>
        <input
          type="text"
          name="passPercentage"
          value={formData.testConfiguration.passPercentage || ""}
          onChange={(e) => handleChange(e, "testConfiguration")}
          className="w-full h-12 px-4 border rounded-lg"
        />
        {errors.passPercentage && <p className="text-red-500">{errors.passPercentage}</p>}
      </div>

      {/* Result Visibility - Always Shown */}
      <div>
        <label className="text-md font-medium text-[#111933]">Result Visibility *</label>
        <select
          name="resultVisibility"
          value={formData.testConfiguration.resultVisibility || ""}
          onChange={(e) => handleChange(e, "testConfiguration")}
          className="w-full h-12 px-4 border rounded-lg"
        >
          <option value="">Select</option>
          <option value="Immediate release">Immediate release</option>
          <option value="Host Control">Host Control</option>
        </select>
        {errors.resultVisibility && <p className="text-red-500">{errors.resultVisibility}</p>}
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-[#111933] mb-4">Proctoring Enablement</h3>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Full Screen Mode", name: "fullScreenMode" },
          { label: "Face Detection", name: "faceDetection" },
          { label: "Noise Detection", name: "noiseDetection" },
          { label: "Device Restriction", name: "deviceRestriction" },
        ].map((item) => (
          <div key={item.name} className="flex flex-col space-y-5">
            <div className="flex items-center justify-between p-2 border rounded-[10px]">
              <span className="text-sm font-medium text-[#111933]">{item.label}</span>
              <label
                className="relative inline-flex items-center cursor-pointer"
                style={{
                  cursor: item.name === "faceDetection" || item.name === "noiseDetection" ? "not-allowed" : "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name={item.name}
                  checked={formData.testConfiguration[item.name] || false}
                  onChange={(e) => handleInputChange(e, "testConfiguration")}
                  className="sr-only peer"
                  disabled={item.name === "faceDetection" || item.name === "noiseDetection"}
                />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#111933]"></div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EditTest = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  const [formData, setFormData] = useState({
    assessmentOverview: {
      name: "",
      description: "",
      registrationStart: "",
      registrationEnd: "",
      guidelines: "",
      sectionDetails: "No", // Default value
    },
    testConfiguration: {
      totalMarks: "",
      questions: "",
      duration: { hours: "", minutes: "" },
      passPercentage: "",
      resultVisibility: "",
      fullScreenMode: false,
      faceDetection: false,
      deviceRestriction: false,
      noiseDetection: false,
      shuffleQuestions: false,
      shuffleOptions: false,
    },
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/contests/${contestId}/`);
        setFormData(response.data); // Populate form with fetched data
      } catch (error) {
        toast.error("Failed to fetch test details.");
        console.error("Error fetching test details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [contestId]);

  const handleChange = (e, section) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => {
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [name]: name === "duration" ? { ...prev[section].duration, ...newValue } : newValue,
        },
      };
    });

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
  };

    const handleInputChange = (e, step) => {
      const { name, type, checked } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [step]: {
          ...prevData[step],
          [name]: type === "checkbox" ? checked : e.target.value,
        },
      }));
    };

  const validateForm = (step) => {
    const newErrors = {};

    if (step === 1) {
      const { name, description, registrationStart, registrationEnd, guidelines } = formData.assessmentOverview;
      if (!name) newErrors.name = "Assessment name is required.";
      if (!description) newErrors.description = "Description is required.";
      if (!registrationStart) newErrors.registrationStart = "Start date is required.";
      if (!registrationEnd) newErrors.registrationEnd = "End date is required.";
      if (!guidelines) newErrors.guidelines = "Guidelines are required.";
    } else if (step === 2) {
      const { passPercentage, resultVisibility } = formData.testConfiguration;
      if (!passPercentage) newErrors.passPercentage = "Pass percentage is required.";
      if (!resultVisibility) newErrors.resultVisibility = "Result visibility is required.";

      // Add validation for section-specific fields
      if (formData.assessmentOverview.sectionDetails === "No") {
        const { totalMarks, questions, duration } = formData.testConfiguration;
        if (!totalMarks) newErrors.totalMarks = "Total marks are required.";
        if (!questions) newErrors.questions = "Number of questions is required.";
        if (!duration.hours && !duration.minutes) newErrors.duration = "Duration is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateForm(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.warning("Please fill all required fields in this step.");
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(currentStep)) {
        toast.warning("Please fill all required fields.");
        return;
    }

    try {
        // Send the PUT request to update the test
        const response = await axios.put(
            `${API_BASE_URL}/api/mcq/update-assessment/${contestId}/`, 
            formData,
            { withCredentials: true } // Ensure authentication cookies are sent
        );

        if (response.status === 200) {
            toast.success("Test updated successfully! Redirecting...", {
                autoClose: 2000, // Keep message for 2 seconds before redirection
            });

            // Redirect after 2 seconds to allow the message to be seen
            setTimeout(() => {
                navigate(`/viewtest/${contestId}`); 
                
            }, 2000);
        } else if (response.data.message === "No changes were applied") {
            toast.info("No changes were made.");
        }
    } catch (error) {
        console.error("Error updating test:", error);
        if (error.response?.status === 401) {
            toast.error("Session expired. Please login again.");
            navigate('/staff-login'); // Redirect to login page
        } else {
            toast.error(error.response?.data?.message || "Failed to update test.");
        }
    }
};


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-[calc(100vh-95px)] overflow-hidden bg-[#f4f6ff86] ">
      <div className="w-full px-24 h-full">
        <div className="h-14 py-4">
          <div className="flex items-center gap-2 text-[#111933]">
            <span className="opacity-60">Home</span>
            <span>{">"}</span>
            <span className="opacity-60">Edit Test</span>
          </div>
        </div>
        <div className="flex-1 ">
          <div className="bg-white rounded-lg p-7 lg:px-20 h-[calc(100%-3.5rem)] overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-[#111933]">Edit Test</h2>
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <AssessmentOverviewForm formData={formData} handleChange={handleChange} errors={errors} />
              )}

              {currentStep === 2 && (
                <TestConfigurationForm formData={formData} handleChange={handleChange} errors={errors} handleInputChange={handleInputChange} />
              )}

              <div className="mt-6 flex justify-between">
                {currentStep > 1 && (
                  <button type="button" onClick={prevStep} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                    Previous
                  </button>
                )}

                {currentStep < 2 && (
                  
                  <button type="button" onClick={nextStep} className="bg-[#111933] text-white px-4 py-2 rounded-lg">
                    Next
                  </button>
                )}

                {currentStep === 2 && (
                  <button type="submit" className="bg-[#111933] text-white px-4 py-2 rounded-lg"
                  onClick={handleSubmit}>
                    Update Test 
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditTest;