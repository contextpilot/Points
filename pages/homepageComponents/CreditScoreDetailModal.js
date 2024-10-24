const CreditScoreDetailModal = ({ isOpen, onClose, creditScores }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="bg-white p-6 rounded shadow-lg w-96">
          <h3 className="font-bold text-lg">Credit Score Details</h3>
          <ul className="mt-4">
            {Object.entries(creditScores).map(([key, value]) => (
              <li key={key} className="flex justify-between py-1">
                <span>{key.replace(/_/g, ' ')}:</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 bg-red-500 text-white p-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  export default CreditScoreDetailModal;