import React from 'react';
import { Search } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery, setIsModalOpen, setIsSingleQuestionModalOpen }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center  p-3" style={{ backgroundColor: 'rgba(0, 9, 117, 0.05)' }}>
      <h1 className='font-medium pl-6 text-lg'>Question Preview</h1>
      <div className="flex items-center gap-4 mt-2 md:mt-0 flex-grow">
        <div className="relative flex-grow max-w-xl ml-20">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-1 pl-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none"
            style={{ borderColor: 'rgba(0,0,0,0.4)', outline: 'none', borderRadius: '0.5rem' }}
            onFocus={(e) => e.target.style.borderColor = '#000975'}
            onBlur={(e) => e.target.style.borderColor = 'gray'}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-1 w-144px font-medium bg-[#FDC500] text-[#000975] hover:bg-[#e6b300] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e6b300] transition"
          style={{ borderRadius: '0.5rem' }}
        >
          Import Question
        </button>
        <button
          onClick={() => setIsSingleQuestionModalOpen(true)}
          className="inline-flex items-center px-4 py-1 w-144px font-medium bg-[#FDC500] text-[#000975] hover:bg-[#e6b300] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e6b300] transition"
          style={{ borderRadius: '0.5rem' }}
        >
          Add Question
        </button>
      </div>
    </div>
  );
};

export default Header;
