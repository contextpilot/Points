// BorrowDotModal.js
import React from 'react';

const BorrowDotModal = ({ onClose, record }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg">
                <h2 className="text-lg font-semibold">Borrow Details</h2>
                <p>Details about borrow for record:</p>
                <pre>{JSON.stringify(record, null, 2)}</pre>
                <button className="mt-4 btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default BorrowDotModal;