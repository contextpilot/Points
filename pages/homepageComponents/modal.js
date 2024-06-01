// components/Modal.jsx
import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-auto bg-smoke-light flex"
      onClick={onClose}
    >
      <div
        className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            className="focus:outline-none p-2"
            onClick={onClose}
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
            >
              <path
                d="M16.2002 3.6001L14.3998 1.7998L8.99976 7.19985L3.59973 1.7998L1.79941 3.6001L7.19944 9.00013L1.79941 14.4002L3.59973 16.2005L8.99976 10.8005L14.3998 16.2005L16.2002 14.4002L10.8001 9.00013L16.2002 3.6001Z"
              />
            </svg>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;