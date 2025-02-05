import React from 'react';

const ConfirmationModal = ({ showConfirm, setShowConfirm, handleDelete, selectedQuestion, setSelectedQuestion, navigate }) => {
  return (
    <div
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 " style={{zIndex: 5000}}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md" >
        <p className="text-lg font-semibold">Are you sure you want to delete this question?</p>
        <p className="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => {
              handleDelete(selectedQuestion.question_id);
              setShowConfirm(false);
              window.location.reload();
              setSelectedQuestion(null);
              setTimeout(() => {
                navigate("/library/mcq");
              }, 100);
            }}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex-1"
          >
            Confirm
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
