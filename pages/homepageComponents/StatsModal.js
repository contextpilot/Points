import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

// Register necessary components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatsModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [leaders, setLeaders] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingLeaders, setLoadingLeaders] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'ascending' });
  const itemsPerPage = 10;

  // Refs for the chart instances
  const evmAccessChartRef = useRef(null);
  const evmRecordChartRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchGeneralStats();
      fetchLeaders();
    }
  }, [isOpen]);

  const fetchGeneralStats = async () => {
    setLoadingStats(true);
    try {
      const response = await axios.get(
        "https://main-wjaxre4ena-uc.a.run.app/general_stats"
      );
      setData(response.data);
    } catch (error) {
      setError("Failed to fetch general stats");
      console.error("Failed to fetch general stats", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchLeaders = async () => {
    setLoadingLeaders(true);
    try {
      const response = await axios.get("https://main-wjaxre4ena-uc.a.run.app/leaders"); // replace with actual endpoint
      setLeaders(response.data);
    } catch (error) {
      setError("Failed to fetch leaders data");
      console.error("Failed to fetch leaders data", error);
    } finally {
      setLoadingLeaders(false);
    }
  };

  const getTotal = (obj) => {
    if (!obj) return 0;
    return Object.values(obj).reduce((acc, num) => acc + num, 0);
  };

  const prepareChartData = (obj) => {
    if (!obj) return { labels: [], datasets: [] };
    return {
      labels: Object.keys(obj),
      datasets: [
        {
          label: "Count",
          data: Object.values(obj),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedLeaders = useMemo(() => {
    if (!leaders) return [];

    const sortableLeaders = Object.entries(leaders).map(([key, value]) => ({
      code: key,
      ...value,
    }));

    sortableLeaders.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return sortableLeaders;
  }, [leaders, sortConfig]);

  const renderLeadersTable = useMemo(() => {
    if (loadingLeaders) return <p>Loading...</p>;
    if (!leaders) return <p>No data available...</p>;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeaders = sortedLeaders.slice(startIndex, startIndex + itemsPerPage);

    const rows = currentLeaders.map((leader) => (
      <tr key={leader.code} className="border-b">
        <td className="py-1 px-2 border-r text-sm">{String(leader.code)}</td>
        <td className="py-1 px-2 border-r text-sm">{String(leader.allowed_tokens)}</td>
        <td className="py-1 px-2 border-r text-sm">{String(leader.refer_counts)}</td>
        <td className="py-1 px-2 border-r text-sm">{String(leader.used_tokens)}</td>
        <td className="py-1 px-2 text-sm">{String(leader.points)}</td>
      </tr>
    ));

    const totalPages = Math.ceil(sortedLeaders.length / itemsPerPage);

    return (
      <>
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="border-b">
              <th className="py-1 px-2 border-r cursor-pointer text-sm" onClick={() => handleSort('code')}>Code</th>
              <th className="py-1 px-2 border-r cursor-pointer text-sm" onClick={() => handleSort('allowed_tokens')}>Allowed Tokens</th>
              <th className="py-1 px-2 border-r cursor-pointer text-sm" onClick={() => handleSort('refer_counts')}>Refer Counts</th>
              <th className="py-1 px-2 border-r cursor-pointer text-sm" onClick={() => handleSort('used_tokens')}>Used Tokens</th>
              <th className="py-1 px-2 cursor-pointer text-sm" onClick={() => handleSort('points')}>Kombat Points</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
        <div className="mt-4 flex justify-center">
          <button
            className="px-3 py-1 mx-1 text-white bg-blue-500 rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span className="px-3 py-1 mx-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 mx-1 text-white bg-blue-500 rounded"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </>
    );
  }, [sortedLeaders, currentPage, loadingLeaders, sortConfig]);

  useEffect(() => {
    // Cleanup function to destroy chart instances when component gets unmounted or re-rendered
    return () => {
      if (evmAccessChartRef.current) {
        evmAccessChartRef.current.destroy();
      }
      if (evmRecordChartRef.current) {
        evmRecordChartRef.current.destroy();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl h-4/5 overflow-auto">
        {error && <p className="text-red-500">{error}</p>}
        {loadingStats ? (
          <p>Loading stats...</p>
        ) : (
          data && (
            <Tabs>
              <TabList>
                <Tab>General Stats</Tab>
                <Tab>Leaders</Tab>
              </TabList>

              <TabPanel>
                <h2 className="text-2xl font-bold mb-4">Stats</h2>
                <div className="mb-6">
                  <p>
                    <strong>Total Paid Addresses: </strong>
                    {getTotal(data.evm_access)}
                  </p>
                  <p>
                    <strong>Total Chat Record: </strong>
                    {getTotal(data.evm_record)}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Paid Addresses by Date</h3>
                  <Bar data={prepareChartData(data.evm_access)} ref={evmAccessChartRef} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mt-6 mb-4">Chat Record By Date</h3>
                  <Bar data={prepareChartData(data.evm_record)} ref={evmRecordChartRef} />
                </div>
              </TabPanel>

              <TabPanel>
                <h2 className="text-2xl font-bold mb-4">Leaders</h2>
                {renderLeadersTable}
              </TabPanel>
            </Tabs>
          )
        )}
        <button
          className="mt-6 bg-red-500 text-white p-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default StatsModal;