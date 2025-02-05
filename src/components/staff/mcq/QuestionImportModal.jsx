import { X } from 'lucide-react';

const QuestionImportModal = ({ isOpen, onClose, onUpload, uploadStatus }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ color: '#000975' }} className="text-xl font-semibold">Import Question</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p style={{ color: '#000975' }} className="text-sm mb-4">
          Upload a CSV file containing multiple questions. Maximum file size: 5MB
        </p>
        <input
          type="file"
          onChange={onUpload}
          accept=".csv"
          style={{
            color: '#000975',
            backgroundColor: 'rgba(253, 197, 0, 0.2)', // #FDC500 with 20% opacity
          }}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
        />
        {uploadStatus && (
          <div
            className={`mt-4 p-3 rounded-md ${
              uploadStatus.startsWith("Success")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionImportModal;
