import React from 'react'

export const sidebar = () => {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center relative z-[10000]">
        <p className="text-gray-800 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Confirmar
          </button>
          <button
            onClick={() => {
              onCancel();
              window.location.reload();
            }}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root") 
  );
}

import { createPortal } from "react-dom";

export default function ConfirmModal({ isOpen, onConfirm, onCancel, message }) {
  if (!isOpen) return null;

}