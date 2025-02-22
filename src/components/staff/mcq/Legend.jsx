import React from "react";

export default function Legend() {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-10 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#ffe078]"></div>
          <span className="text-xs text-[#00296b]">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#ff7676]"></div>
          <span className="text-xs text-[#00296b]">Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-300"></div>
          <span className="text-xs text-[#00296b]">Review</span>
        </div>
      </div>
      <div className="flex items-center gap-[26px]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#c1f0c8]"></div>
          <span className="text-xs text-[#00296b]">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-[#ffe078]"></div>
          <span className="text-xs text-[#00296b]">Not Attempted</span>
        </div>
      </div>
    </div>
  );
}