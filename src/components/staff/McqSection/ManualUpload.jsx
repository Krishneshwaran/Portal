import React, { useState } from 'react';

const ManualUpload = ({ onClose, onQuestionAdded }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [level, setLevel] = useState('easy');
  const [tags, setTags] = useState('');

  const handleAddQuestion = () => {
    const newQuestion = {
      question,
      options: options.filter(option => option.trim() !== ''),
      correctAnswer,
      level,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
    };

    onQuestionAdded(newQuestion);
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setLevel('easy');
    setTags('');
    onClose();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
        &times;
      </button>
      <h2 className="text-lg font-bold mb-4">Add New Question</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Question</label>
        <textarea
          className="w-full p-2 border rounded-lg"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Options</label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
            />
            <button
              type="button"
              onClick={() => {
                const newOptions = options.filter((_, i) => i !== index);
                setOptions(newOptions);
              }}
              className="ml-2 text-red-500"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOptions([...options, ''])}
          className="text-blue-500"
        >
          Add Option
        </button>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Correct Answer</label>
        <select
          className="w-full p-2 border rounded-lg"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
        >
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Difficulty Level</label>
        <select
          className="w-full p-2 border rounded-lg"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Tags (comma-separated)</label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <button
        onClick={handleAddQuestion}
        className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg"
      >
        Submit
      </button>
    </div>
  );
};

export default ManualUpload;
