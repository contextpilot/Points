// pages/homepageComponents/ResumeModal.js
import React, { useEffect, useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

// Register necessary components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResumeModal = ({ isOpen, onClose, usedTokens, allowedTokens, correctAnswers, totalAnswers, referredBy, evmAddress }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Refs for the chart instances
    const answeredQuestionsChartRef = useRef(null);
    const chatRecordsChartRef = useRef(null);
    const kombatPointsChartRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, evmAddress]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://crypti-talk-500474063246.us-central1.run.app/resume?evm_address=${evmAddress}`);
            setData(response.data);
        } catch (error) {
            setError("Failed to fetch data");
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const processDataForChart = (data) => {
        if (!data || Object.keys(data).length === 0) return { labels: [], datasets: [] };
        const labels = Object.keys(data);
        const values = labels.map(label => Object.keys(data[label]).length);
        return {
            labels,
            datasets: [
                {
                    label: 'Count',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                }
            ]
        };
    };

    const answeredQuestionsData = useMemo(() => processDataForChart(data?.answered_questions_by_date), [data]);
    const chatRecordsData = useMemo(() => processDataForChart(data?.chat_records_by_date), [data]);
    const kombatPointsData = useMemo(() => processDataForChart(data?.kombat_points_by_date), [data]);

    if (!isOpen) return null;
    if (loading) return <div className="text-center">Loading...</div>;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl h-4/5 overflow-auto">
                {error && <p className="text-red-500">{error}</p>}
                <Tabs>
                    <TabList>
                        <Tab>Token Usage</Tab>
                        <Tab>Answered Questions</Tab>
                        <Tab>Chat Records</Tab>
                        <Tab>Kombat Points</Tab>
                    </TabList>

                    <TabPanel>
                        <h2 className="text-lg font-bold mb-4">Token Usage</h2>
                        <p>Used / Allowed Tokens: {usedTokens} / {allowedTokens}</p>
                        <p>Correct / Total Answers: {correctAnswers} / {totalAnswers}</p>
                        <p>Referred by: {referredBy}</p>
                    </TabPanel>

                    <TabPanel>
                        <h2 className="text-xl font-bold mb-4">Answered Questions by Date</h2>
                        <Bar data={answeredQuestionsData} ref={answeredQuestionsChartRef} />
                    </TabPanel>

                    <TabPanel>
                        <h2 className="text-xl font-bold mb-4">Chat Records by Date</h2>
                        <Bar data={chatRecordsData} ref={chatRecordsChartRef} />
                    </TabPanel>

                    <TabPanel>
                        <h2 className="text-xl font-bold mb-4">Kombat Points by Date</h2>
                        <Bar data={kombatPointsData} ref={kombatPointsChartRef} />
                    </TabPanel>
                </Tabs>
                <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                    Close
                </button>
            </div>
        </div>
    );
};

ResumeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    usedTokens: PropTypes.number.isRequired,
    allowedTokens: PropTypes.number.isRequired,
    correctAnswers: PropTypes.number.isRequired,
    totalAnswers: PropTypes.number.isRequired,
    referredBy: PropTypes.string.isRequired,
    evmAddress: PropTypes.string.isRequired,
};

export default ResumeModal;