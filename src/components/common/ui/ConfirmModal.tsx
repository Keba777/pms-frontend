"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  showInput: boolean;
  confirmText: string;
  inputPlaceholder?: string;
  confirmButtonText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal = ({
  isVisible,
  title,
  message,
  showInput,
  confirmText,
  inputPlaceholder = 'Type "DELETE" to confirm',
  confirmButtonText = "Delete",
  onClose,
  onConfirm,
}: ConfirmModalProps) => {
  const [confirmInput, setConfirmInput] = useState("");

  if (!isVisible) return null;

  const handleCancel = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (showInput && confirmInput !== confirmText) return;
    onConfirm();
  };

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={handleCancel}>
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        <p className="text-gray-600 mt-2">{message}</p>
        {showInput && (
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={inputPlaceholder}
            className="mt-4 p-2 border rounded w-full"
          />
        )}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 rounded flex items-center space-x-2"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleConfirm}
            disabled={showInput && confirmInput !== confirmText}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50 flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
