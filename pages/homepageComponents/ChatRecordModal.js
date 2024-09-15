import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const ChatRecordModal = ({ isOpen, onClose, sessionIds }) => {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && sessionIds.length > 0) {
            fetchChatRecords();
        }
    }, [isOpen, sessionIds]);

    const fetchChatRecords = async () => {
        setLoading(true);
        setSummaries([]);  // Clear previous summaries
        setError(null);

        const fetchDataForSession = async (sessionId) => {
            try {
                const response = await axios.get(`https://storage.googleapis.com/contextpilot/summary_data/${sessionId}.json`);
                return { sessionId, summary: response.data.summary };
            } catch (error) {
                console.error('Failed to fetch chat record', error);
                return { sessionId, summary: 'Failed to load summary. ' };
            }
        };

        try {
            const fetchedSummaries = await Promise.all(sessionIds.map(fetchDataForSession));
            setSummaries(fetchedSummaries);
        } catch (generalError) {
            setError('Failed to fetch chat records');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl h-4/5 overflow-auto">
                {loading && <div className="text-center">Loading...</div>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && summaries.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Chat Summaries</h2>
                        {summaries.map(({ sessionId, summary }) => (
                            <div key={sessionId} className="mb-4">
                                <h3 className="text-lg font-semibold mb-2">Session ID: {sessionId}</h3>
                                <textarea 
                                    className="w-full h-32 p-4 bg-gray-200 mb-2" 
                                    value={summary} 
                                    readOnly 
                                />
                            </div>
                        ))}
                    </div>
                )}
                <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                    Close
                </button>
            </div>
        </div>
    );
};

ChatRecordModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    sessionIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ChatRecordModal;