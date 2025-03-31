import { formatDate } from "@/utils/helper";
import { motion } from "framer-motion";

interface RequestCardProps {
  activity: string;
  type: string;
  date: Date;
  financeStatus: string;
}

const RequestCard = ({
  activity,
  type,
  date,
  financeStatus,
}: RequestCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`relative bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl `}
    >
      <div className="h-24 w-full bg-gradient-to-r from-cyan-700 to-teal-700"></div>
      <div className="p-6">
        <p className="text-gray-700 font-medium">
          <span className="font-semibold">Activity:</span> {activity}
        </p>
        <p className="text-gray-700 font-medium">
          <span className="font-semibold">Type:</span> {type}
        </p>
        <p className="text-gray-700 font-medium">
          <span className="font-semibold">Date:</span> {formatDate(date)}
        </p>
        <p className="text-gray-700 font-medium  ">
          <span className="font-semibold">Finance Status:</span> {financeStatus}
        </p>
        <div className="mt-6 text-xs flex justify-between items-center">
          <button className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg shadow-md transition-all">
            View Details
          </button>
          <button className="flex items-center gap-2 bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded-lg shadow-md transition-all">
            View Financial Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RequestCard;
