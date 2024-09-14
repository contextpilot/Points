// pages/homepageComponents/ResumeModal.js
import React, { useEffect, useState, useMemo } from 'react';
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
            setError('Failed to fetch data');
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const processAnsweredQuestionsData = data => {
        if (!data || Object.keys(data).length === 0) return { labels: [], datasets: [] };
        const labels = Object.keys(data);
        const correctValues = labels.map(label => data[label].correct);
        const totalValues = labels.map(label => data[label].total - data[label].correct); // Total minus correct gives incorrect

        return {
            labels,
            datasets: [
                {
                    label: 'Correct Answers',
                    data: correctValues,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    stack: 'Stack 0',
                },
                {
                    label: 'Incorrect Answers',
                    data: totalValues,
                    backgroundColor: 'rgba(192, 75, 75, 0.6)',
                    stack: 'Stack 0',
                },
            ],
        };
    };

    const processChatTokensData = data => {
        if (!data || Object.keys(data).length === 0) return { labels: [], datasets: [] };
        const labels = Object.keys(data);
        const values = labels.map(label => data[label].reduce((acc, record) => acc + record.num_tokens, 0));
        return {
            labels,
            datasets: [
                {
                    label: 'Tokens',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
            ],
        };
    };

    const processChatModelCountsData = data => {
        if (!data || Object.keys(data).length === 0) return { labels: [], datasets: [] };

        const labels = Object.keys(data);
        const modelCounts = {};

        labels.forEach(date => {
            data[date].forEach(record => {
                if (!modelCounts[record.model]) {
                    modelCounts[record.model] = {};
                }
                if (!modelCounts[record.model][date]) {
                    modelCounts[record.model][date] = 0;
                }
                modelCounts[record.model][date] += 1;
            });
        });

        const datasets = Object.keys(modelCounts).map(model => ({
            label: model,
            data: labels.map(label => modelCounts[model][label] || 0),
            backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
        }));

        return { labels, datasets };
    };

    const processKombatPointsData = data => {
        if (!data || Object.keys(data).length === 0) return { labels: [], datasets: [] };
        const labels = Object.keys(data);
        const values = labels.map(label => data[label]);
        return {
            labels,
            datasets: [
                {
                    label: 'Kombat Points',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
            ],
        };
    };

    const answeredQuestionsData = useMemo(() => processAnsweredQuestionsData(data?.answered_questions_by_date), [data]);
    const chatTokensData = useMemo(() => processChatTokensData(data?.chat_records_by_date), [data]);
    const chatModelCountsData = useMemo(() => processChatModelCountsData(data?.chat_records_by_date), [data]);
    const kombatPointsData = useMemo(() => processKombatPointsData(data?.kombat_points_by_date), [data]);

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
                        <Bar
                            data={answeredQuestionsData}
                            options={{
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: context => {
                                                let label = context.dataset.label || '';
                                                if (label) {
                                                    label += ': ';
                                                }
                                                label += context.raw;
                                                return label;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    x: {
                                        stacked: true,
                                    },
                                    y: {
                                        stacked: true,
                                    },
                                },
                            }}
                        />
                    </TabPanel>

                    <TabPanel>
                        <h2 className="text-xl font-bold mb-4">Chat Records by Date</h2>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-2">Tokens</h3>
                            <Bar data={chatTokensData} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-2">Model Counts</h3>
                            <Bar
                                data={chatModelCountsData}
                                options={{
                                    plugins: {
                                        tooltip: {
                                            callbacks: {
                                                label: context => {
                                                    let label = context.dataset.label || '';
                                                    if (label) {
                                                        label += ': ';
                                                    }
                                                    label += context.raw;
                                                    return label;
                                                },
                                            },
                                        },
                                    },
                                    scales: {
                                        x: {
                                            stacked: true,
                                        },
                                        y: {
                                            stacked: true,
                                        },
                                    },
                                }}
                            />
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <h2 className="text-xl font-bold mb-4">Kombat Points by Date</h2>
                        <Bar data={kombatPointsData} />
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