import React from 'react';

const StreamDotModal = ({ onClose, record }) => {
    const { stream_status, streamed } = record; // Destructuring the relevant properties from record

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg">
                <h2 className="text-lg font-semibold">Stream Details</h2>
                {stream_status ? (
                    <div>
                        <p>The stream is active.</p>
                        <p>Details about the stream:</p>
                        <pre>{JSON.stringify(record, null, 2)}</pre>
                    </div>
                ) : (
                    <div>
                        <p>
                            Please go to 
                            <a 
                                href="https://app.superfluid.finance/" 
                                className="text-blue-500 underline" 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                {" Superfluid"}
                            </a> 
                            <br />
                            to send a stream of 
                            <strong> {(10 * streamed).toFixed(2)} </strong>
                            monthly rate 
                            <br />
                            to address 
                            <strong> 0xe9627177fCf4fB212bA20f8ebf184e91E5Aeccdf</strong>, 
                            <br />
                            and maintain the stream for <strong> 1 month </strong> to pay off.
                        </p>
                    </div>
                )}
                <button className="mt-4 btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default StreamDotModal;