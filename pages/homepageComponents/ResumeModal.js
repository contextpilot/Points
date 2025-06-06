import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ChatRecordModal from './ChatRecordModal';

// Register necessary components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResumeModal = ({ isOpen, onClose, usedTokens, allowedTokens, correctAnswers, totalAnswers, referredBy, evmAddress }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chatRecordModalOpen, setChatRecordModalOpen] = useState(false);
    const [selectedSessionIds, setSelectedSessionIds] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, evmAddress]);

    const handleBarClick = (sessionIds) => {
        setSelectedSessionIds(sessionIds);
        setChatRecordModalOpen(true);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://main-wjaxre4ena-uc.a.run.app//resume?evm_address=${evmAddress}`);
            setData(response.data);
        } catch (error) {
            setError('Failed to fetch data');
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
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

    const processChatModelCountsData = (data, handleBarClick) => {
        if (!data || Object.keys(data).length === 0) return { labels: [], datasets: [] };

        const labels = Object.keys(data);
        const modelCounts = {};

        labels.forEach(date => {
            data[date].forEach(record => {
                if (!modelCounts[record.model]) {
                    modelCounts[record.model] = {};
                }
                if (!modelCounts[record.model][date]) {
                    modelCounts[record.model][date] = [];
                }
                modelCounts[record.model][date].push(record.session_id);
            });
        });

        const datasets = Object.keys(modelCounts).map(model => ({
            label: model,
            data: labels.map(label => modelCounts[model][label] ? modelCounts[model][label].length : 0),
            backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
        }));

        return {
            labels,
            datasets,
            onClick: (e, elements) => {
                if (elements && elements.length > 0) {
                    const chart = elements[0];
                    const model = datasets[chart.datasetIndex].label;
                    const date = labels[chart.index];
                    const sessionIds = modelCounts[model][date];
                    handleBarClick(sessionIds);
                }
            },
        };
    };

    const chatTokensData = useMemo(() => processChatTokensData(data?.chat_records_by_date), [data]);
    const chatModelCountsData = useMemo(() => processChatModelCountsData(data?.chat_records_by_date, handleBarClick), [data]);

    if (!isOpen) return null;
    if (loading) return <div className="text-center">Loading...</div>;

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl h-4/5 overflow-auto">
                    {error && <p className="text-red-500">{error}</p>}
                    <Tabs>
                        <TabList>
                            <Tab>Token Usage</Tab>
                            <Tab>Model Records</Tab>
                        </TabList>

                        <TabPanel>
                            <h2 className="text-lg font-bold mb-4">Token Usage</h2>
                            <p>Used / Allowed Tokens: {usedTokens} / {allowedTokens}</p>
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
                                        onClick: chatModelCountsData.onClick,
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
                    </Tabs>
                    <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                        Close
                    </button>
                </div>
            </div>

            {/* Render ChatRecordModal */}
            <ChatRecordModal
                isOpen={chatRecordModalOpen}
                onClose={() => setChatRecordModalOpen(false)}
                sessionIds={selectedSessionIds}
            />
        </>
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