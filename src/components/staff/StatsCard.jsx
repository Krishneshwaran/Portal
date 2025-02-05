import React from "react";
import { FaCheckCircle } from "react-icons/fa"; // Replace with your desired icon

const StatsCard = ({ icon, title, value }) => {
  return (
    <div className="w-64 h-22 bg-white rounded-[12px] shadow-md">
      <div className="p-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-normal text-sm text-[#a0aec0] font-sans">
            {title}
          </span>
          <span className="font-bold text-md text-[#2d3748] font-sans leading-[20px]">
            {value}
          </span>
        </div>
        <div className="w-[36px] h-[36px] bg-amber-400 text-lg text-white rounded-xl flex items-center justify-center shadow-[0px_3.5px_5.5px_#00000005]">
          {icon || <FaCheckCircle className="w-[18px] h-[18px] text-white" />}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
