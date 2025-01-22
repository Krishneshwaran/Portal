import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Users, Clock, ChevronRight, FileText, Code } from "lucide-react";
import { Card, CardHeader, CardFooter, CardBody } from "@nextui-org/react";

const TestCard = ({ title, type, date, category, stats, status, contestId }) => {
  const navigate = useNavigate();

  const handleViewTest = () => {
    navigate(`/viewtest/${contestId}`);
  };

  const statusStyles = {
    Live: "bg-[#34cf70] text-white",
    Upcoming: "bg-[#fd944e] text-white",
    Completed: "bg-red-500 text-white",
  };

  const getIcon = (type) => {
    switch (type) {
      case "Coding":
        return <Code className="w-4 h-4 text-[#fd944e]" />;
      case "MCQ":
        return <FileText className="w-4 h-4 text-[#000975]" />;
      default:
        return <FileText className="w-4 h-4 text-[#000975]" />;
    }
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="w-full max-w-md">
      <Card className="py-2 shadow-lg bg-gradient-to-br from-blue-50 to-white rounded-xl hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex justify-between items-center gap-2">
          <div className="flex gap-2 items-center">
            <div className="p-1 rounded-full">
              {getIcon(type)}
            </div>
            <div className="text-[#000975]">
              <h3 className="text-base font-bold">{title}</h3>
              <p className="text-xs">{category}</p>
            </div>
          </div>
          <span
            className={`px-2 py-1 mb-2 rounded-full text-xs font-semibold ${statusStyles[status]}`}
          >
            {status}
          </span>
        </CardHeader>
        <CardBody className="grid grid-cols-3 gap-2 w-full">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-gray-600 text-sm inline-block">{key}</p>
              <h4 className="text-lg font-medium inline-block ml-1">{value}</h4>
            </div>
          ))}
        </CardBody>
        <CardFooter className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mt-2">
          <div className="flex flex-row gap-1">
            <div className="flex bg-white py-0.5 px-1.5 sm:py-0.5 sm:px-2 border rounded-full items-center gap-1">
              <Calendar className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              <span className="text-xs sm:text-xs">{date}</span>
            </div>
            <div className="flex bg-white py-0.5 px-1.5 sm:py-0.5 sm:px-2 border rounded-full items-center gap-1">
              <Users className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              <span className="text-xs sm:text-xs">{category}</span>
            </div>
            <div className="flex bg-white py-0.5 px-1.5 sm:py-0.5 sm:px-2 border rounded-full items-center gap-1">
              <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              <span className="text-xs sm:text-xs">{type}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewTest}
            className="w-1/9 sm:w-20 ml-16 px-0.5 py-1 bg-[#000975] text-white rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center font-light text-xs sm:text-xs"
          >
            View Test
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
          </motion.button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TestCard;
