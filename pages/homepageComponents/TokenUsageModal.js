// components/DetailModal.js
import React from 'react';
import PropTypes from 'prop-types';

const TokenUsageModal = ({ isOpen, onClose, usedTokens, allowedTokens, correctAnswers, totalAnswers, referredBy }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-50 absolute inset-0" onClick={onClose}></div>
            <div className="bg-white rounded-lg p-6 z-10">
                <h2 className="text-lg font-bold mb-4">Token Usage</h2>
                <p>Used / Allowed Tokens: {usedTokens} / {allowedTokens}</p>
                <p>Correct / Total Answers: {correctAnswers} / {totalAnswers}</p>
                <p>Referred by: {referredBy}</p>
                <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                    Close
                </button>
            </div>
        </div>
    );
};
export default TokenUsageModal;