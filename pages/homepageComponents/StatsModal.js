import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { Bar, Scatter } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement
} from "chart.js";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { format } from "date-fns";
import ResumeModal from "./ResumeModal";
import CreditScoreDetailModal from "./CreditScoreDetailModal";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement);

const StatsModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [leaders, setLeaders] = useState(null);
  const [kombatData, setKombatData] = useState(null);
  const [creditScores, setCreditScores] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingLeaders, setLoadingLeaders] = useState(false);
  const [loadingKombat, setLoadingKombat] = useState(false);
  const [loadingCreditScores, setLoadingCreditScores] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "address",
    direction: "ascending",
  });
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedCreditScores, setSelectedCreditScores] = useState(null);

  const itemsPerPage = 10;

  const evmAccessChartRef = useRef(null);
  const evmRecordChartRef = useRef(null);
  const kombatActiveAddressesChartRef = useRef(null);
  const kombatAddedAddressesChartRef = useRef(null);
  const kombatTotalPointsChartRef = useRef(null);
  const creditScoresChartRef = useRef(null);
  const [currentCreditScorePage, setCurrentCreditScorePage] = useState(1);
  const [creditScoreSortConfig, setCreditScoreSortConfig] = useState({
    key: "evm_address",
    direction: "ascending",
  });
  const [creditScoreModalOpen, setCreditScoreModalOpen] = useState(false);
  const [itemizedCreditScores, setItemizedCreditScores] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchGeneralStats();
      fetchLeaders();
      fetchKombatStats();
      fetchCreditScores();
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
      const response = await axios.get(
        "https://main-wjaxre4ena-uc.a.run.app/leaders"
      );
      setLeaders(response.data);
    } catch (error) {
      setError("Failed to fetch leaders data");
      console.error("Failed to fetch leaders data", error);
    } finally {
      setLoadingLeaders(false);
    }
  };

  const fetchKombatStats = async () => {
    setLoadingKombat(true);
    try {
      const response = await axios.get(
        "https://main-wjaxre4ena-uc.a.run.app/kombat_stats_all_days"
      );
      setKombatData(response.data);
    } catch (error) {
      setError("Failed to fetch Kombat stats");
      console.error("Failed to fetch Kombat stats", error);
    } finally {
      setLoadingKombat(false);
    }
  };

  const fetchCreditScores = async () => {
    setLoadingCreditScores(true);
    try {
      const response = await axios.get("https://main-wjaxre4ena-uc.a.run.app/all_credit_scores");
      setCreditScores(response.data);
    } catch (error) {
      setError("Failed to fetch credit scores");
      console.error("Failed to fetch credit scores", error);
    } finally {
      setLoadingCreditScores(false);
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

  const prepareKombatChartData = (array, key) => {
    if (!array) return { labels: [], datasets: [] };
    return {
      labels: array.map((item) => item.date.split(",")[1].trim().split(" ").slice(0, 3).join(" ")), // Trimming to keep yyyy-MM-dd format
      datasets: [
        {
          label: key.replace(/_/g, " ").toUpperCase(),
          data: array.map((item) => item[key]),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  };

  const prepareCreditScoresChartData = (creditScores) => {
    if (!creditScores) return { datasets: [] };
  
    const scores = creditScores.map(score => ({
      x: Math.random(), // Random x value for the dot plot
      y: score.credit_score.credit_score,
    }));
  
    return {
      datasets: [
        {
          label: "Credit Scores",
          data: scores,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  };

  const handleCreditScoreClick = (creditScore, type) => {
    if(type === 'address'){
      // Logic for handling address click
      setResumeModalOpen(true);
    } else if(type === 'score') {
      setItemizedCreditScores(creditScore.credit_score);
      setCreditScoreModalOpen(true);
    }
  };
  
  // Sorting function for credit scores
  const handleCreditScoreSort = (key) => {
    let direction = "ascending";
    if (creditScoreSortConfig.key === key && creditScoreSortConfig.direction === "ascending") {
      direction = "descending";
    }
    setCreditScoreSortConfig({ key, direction });
  };

  // Sorted and paginated credit scores
  const sortedCreditScores = useMemo(() => {
    if (!creditScores) return [];
  
    const sortableCreditScores = [...creditScores];
  
    sortableCreditScores.sort((a, b) => {
      const aValue = a.credit_score[creditScoreSortConfig.key] || a[creditScoreSortConfig.key];
      const bValue = b.credit_score[creditScoreSortConfig.key] || b[creditScoreSortConfig.key];
  
      if (aValue < bValue) {
        return creditScoreSortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return creditScoreSortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  
    return sortableCreditScores;
  }, [creditScores, creditScoreSortConfig]);
  
  const renderCreditScoresTable = useMemo(() => {
    if (loadingCreditScores) return <p>Loading...</p>;
    if (!creditScores) return <p>No data available...</p>;
  
    const startIndex = (currentCreditScorePage - 1) * itemsPerPage;
    const currentCreditScores = sortedCreditScores.slice(startIndex, startIndex + itemsPerPage);
  
    const rows = currentCreditScores.map((creditScore) => (
      <tr key={creditScore.evm_address} className="border-b">
        <td
          className="py-1 px-2 border-r text-sm text-blue-500 underline cursor-pointer"
          onClick={() => handleCreditScoreClick(creditScore, 'address')}
        >
          {creditScore.evm_address}
        </td>
        <td
          className="py-1 px-2 border-r text-sm text-blue-500 underline cursor-pointer"
          onClick={() => handleCreditScoreClick(creditScore, 'score')}
        >
          {creditScore.credit_score.credit_score}
        </td>
      </tr>
    ));
  
    const totalPages = Math.ceil(sortedCreditScores.length / itemsPerPage);
  
    return (
      <>
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="border-b">
              <th
                className="py-1 px-2 border-r cursor-pointer text-sm"
                onClick={() => handleCreditScoreSort("evm_address")}
              >
                EVM Address
              </th>
              <th
                className="py-1 px-2 border-r cursor-pointer text-sm"
                onClick={() => handleCreditScoreSort("credit_score")}
              >
                Credit Score
              </th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        <div className="mt-4 flex justify-center">
          <button
            className="px-3 py-1 mx-1 text-white bg-blue-500 rounded"
            disabled={currentCreditScorePage === 1}
            onClick={() => setCurrentCreditScorePage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span className="px-3 py-1 mx-1">
            Page {currentCreditScorePage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 mx-1 text-white bg-blue-500 rounded"
            disabled={currentCreditScorePage === totalPages}
            onClick={() => setCurrentCreditScorePage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </>
    );
  }, [sortedCreditScores, currentCreditScorePage, loadingCreditScores]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedLeaders = useMemo(() => {
    if (!leaders) return [];

    const sortableLeaders = Object.entries(leaders).map(([key, value]) => ({
      address: key, // Assuming 'key' is the address
      ...value,
    }));

    sortableLeaders.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    return sortableLeaders;
  }, [leaders, sortConfig]);

  const handleLeaderClick = (leader) => {
    setSelectedLeader(leader);
    setResumeModalOpen(true);
  };

  const abbreviateAddress = (address) => {
    if (!address) return '';
    return address.substring(0, 4) + '...' + address.substring(address.length - 3);
  };

  const renderLeadersTable = useMemo(() => {
    if (loadingLeaders) return <p>Loading...</p>;
    if (!leaders) return <p>No data available...</p>;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeaders = sortedLeaders.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    const rows = currentLeaders.map((leader) => (
      <tr
        key={leader.address}
        className="border-b cursor-pointer"
        onClick={() => handleLeaderClick(leader)}
      >
        <td className="py-1 px-2 border-r text-sm">
          <a 
            href="#" 
            className="text-blue-500 underline"
          >
            {abbreviateAddress(leader.address)}
          </a>
        </td>
        <td className="py-1 px-2 border-r text-sm">
          {String(leader.allowed_tokens)}
        </td>
        <td className="py-1 px-2 border-r text-sm">
          {String(leader.used_tokens)}
        </td>
        <td className="py-1 px-2 border-r text-sm">
          {String(leader.withdrawed_points)}
        </td>
        <td className="py-1 px-2 text-sm">{String(leader.points)}</td>
      </tr>
    ));

    const totalPages = Math.ceil(sortedLeaders.length / itemsPerPage);

    return (
      <>
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="border-b">
              <th
                className="py-1 px-2 border-r cursor-pointer text-sm"
                onClick={() => handleSort("address")}
              >
                Address
              </th>
              <th
                className="py-1 px-2 border-r cursor-pointer text-sm"
                onClick={() => handleSort("allowed_tokens")}
              >
                Allowed Tokens
              </th>
              <th
                className="py-1 px-2 border-r cursor-pointer text-sm"
                onClick={() => handleSort("used_tokens")}
              >
                Used Tokens
              </th>
              <th
                className="py-1 px-2 border-r cursor-pointer text-sm"
                onClick={() => handleSort("withdrawed_points")}
              >
                Withdrawed Points
              </th>
              <th
                className="py-1 px-2 cursor-pointer text-sm"
                onClick={() => handleSort("points")}
              >
                Kombat Points
              </th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        <div className="mt-4 flex justify-center">
          <button
            className="px-3 py-1 mx-1 text-white bg-blue-500 rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span className="px-3 py-1 mx-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 mx-1 text-white bg-blue-500 rounded"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </>
    );
  }, [sortedLeaders, currentPage, loadingLeaders, sortConfig]);

  useEffect(() => {
    return () => {
      if (evmAccessChartRef.current) {
        evmAccessChartRef.current.destroy();
      }
      if (evmRecordChartRef.current) {
        evmRecordChartRef.current.destroy();
      }
      if (kombatActiveAddressesChartRef.current) {
        kombatActiveAddressesChartRef.current.destroy();
      }
      if (kombatAddedAddressesChartRef.current) {
        kombatAddedAddressesChartRef.current.destroy();
      }
      if (kombatTotalPointsChartRef.current) {
        kombatTotalPointsChartRef.current.destroy();
      }
      if (creditScoresChartRef.current) {
        creditScoresChartRef.current.destroy();
      }
    };
  }, []);

  const creditScoresChartData = useMemo(
    () => prepareCreditScoresChartData(creditScores),
    [creditScores]
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl h-4/5 overflow-auto">
          {error && <p className="text-red-500">{error}</p>}
          {(loadingStats || loadingKombat || loadingCreditScores) ? (
            <p>Loading stats...</p>
          ) : (
            (data || kombatData || creditScores) && (
              <Tabs>
                <TabList>
                  <Tab>General Stats</Tab>
                  <Tab>Leaders</Tab>
                  <Tab>Kombat Stats</Tab>
                  <Tab>Credit Scores</Tab>
                </TabList>

                <TabPanel>
                  <h2 className="text-2xl font-bold mb-4">General Stats</h2>
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
                    <h3 className="text-xl font-bold mb-4">
                      Paid Addresses by Date
                    </h3>
                    <Bar
                      data={prepareChartData(data.evm_access)}
                      ref={evmAccessChartRef}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mt-6 mb-4">
                      Chat Record By Date
                    </h3>
                    <Bar
                      data={prepareChartData(data.evm_record)}
                      ref={evmRecordChartRef}
                    />
                  </div>
                </TabPanel>

                <TabPanel>
                  <h2 className="text-2xl font-bold mb-4">Leaders</h2>
                  {renderLeadersTable}
                </TabPanel>

                <TabPanel>
                  <h2 className="text-2xl font-bold mb-4">Kombat Stats</h2>
                  <div className="mb-6"></div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">
                      Daily Active Addresses
                    </h3>
                    <Bar
                      data={prepareKombatChartData(
                        kombatData,
                        "daily_active_addresses"
                      )}
                      ref={kombatActiveAddressesChartRef}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mt-6 mb-4">
                      Daily Added Addresses
                    </h3>
                    <Bar
                      data={prepareKombatChartData(
                        kombatData,
                        "daily_added_addresses"
                      )}
                      ref={kombatAddedAddressesChartRef}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mt-6 mb-4">
                      Daily Total Points
                    </h3>
                    <Bar
                      data={prepareKombatChartData(kombatData, "daily_total_points")}
                      ref={kombatTotalPointsChartRef}
                    />
                  </div>
                </TabPanel>

                <TabPanel>
                  <h2 className="text-2xl font-bold mb-4">Credit Scores</h2>
                  <div>
                    <Scatter
                      data={creditScoresChartData}
                      options={{ 
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                return `Credit Score: ${context.raw.y}`;
                              },
                            },
                          },
                        } 
                      }}
                      ref={creditScoresChartRef}
                    />
                  </div>
                  <div className="mt-6">
                    {renderCreditScoresTable}
                  </div>
                  {selectedCreditScores && (
                    <div className="mt-6 p-4 bg-gray-100 rounded">
                      <h3 className="font-bold">Itemized Scores</h3>
                      <ul>
                        {Object.entries(selectedCreditScores).map(([key, value]) => (
                          <li key={key} className="flex justify-between">
                            <span>{key.replace(/_/g, ' ')}:</span>
                            <span>{value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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

      {selectedLeader && (
        <ResumeModal
          isOpen={resumeModalOpen}
          onClose={() => setResumeModalOpen(false)}
          evmAddress={selectedLeader.address}  // Using leader's full address
          // Add more properties as needed based on `selectedLeader`
        />   
      )}
      <ResumeModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        evmAddress={selectedLeader ? selectedLeader.address : ''}
      />
      <CreditScoreDetailModal
        isOpen={creditScoreModalOpen}
        onClose={() => setCreditScoreModalOpen(false)}
        creditScores={itemizedCreditScores}
      />
    </>
  );
};

export default StatsModal;