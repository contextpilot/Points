import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import Chart from 'chart.js/auto';

const StatsModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://main-wjaxre4ena-uc.a.run.app/general_stats"
      );
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const getTotal = (obj) => {
    return Object.values(obj).reduce((acc, num) => acc + num, 0);
  };

  const prepareChartData = (obj) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl h-4/5 overflow-auto">
        {data && (
          <>
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
              <Bar data={prepareChartData(data.evm_access)} />
            </div>
            <div>
              <h3 className="text-xl font-bold mt-6 mb-4">Chat Record By Date</h3>
              <Bar data={prepareChartData(data.evm_record)} />
            </div>
          </>
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