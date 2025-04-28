import React from "react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 32, className = "" }) => {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-4 border-gray-200 border-t-4 border-t-green-500 ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
