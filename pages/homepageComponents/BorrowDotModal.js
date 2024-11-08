import React from 'react';

const BorrowDotModal = ({ onClose, record = {} }) => {
    const { borrow_status, borrowed, token_hash } = record;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg">
                <h2 className="text-lg font-semibold">Borrow Details</h2>
                {borrow_status ? (
                    <div>
                        <p>The borrow is done.</p>
                        <p>Details about the borrow transaction:</p>
                        {/* Display the token hash */}
                        {token_hash && (
                            <p>
                                Token Hash: 
                                <a 
                                    href={`https://bscscan.io/tx/${token_hash}`} 
                                    className="text-blue-500 underline" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    {` ${token_hash}`}
                                </a>
                            </p>
                        )}
                    </div>
                ) : (
                    <div>
                        <p>
                            Please be patient, {(typeof borrowed === 'number' ? borrowed : parseFloat(borrowed)).toFixed(2)} amount of USDT is on the way!
                        </p>
                    </div>
                )}
                <button className="mt-4 btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default BorrowDotModal;