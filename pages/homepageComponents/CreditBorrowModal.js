import React, { useState, useEffect } from 'react';

const CreditBorrowTable = ({ borrowRecords, onStreamDotClicked, onBorrowDotClicked }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRecords = borrowRecords.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(borrowRecords.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="relative">
            <table className="w-full table-auto border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="text-left px-2 py-1 text-black font-semibold border-b border-gray-300">Amount</th>
                        <th className="text-left px-2 py-1 text-black font-semibold border-b border-gray-300">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRecords.map((record, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            {/* Amount Cell */}
                            <td className="text-center px-4 py-2 text-black" style={{ minWidth: '100px' }}>
                                {parseFloat(record.allowance).toFixed(2)}
                            </td>
                            {/* Status Cell */}
                            <td className="text-center px-4 py-2">
                                <div className="flex justify-center space-x-2">
                                    <div
                                        className="inline-block w-3 h-3 rounded-full animate-pulse cursor-pointer"
                                        style={{ backgroundColor: record.borrow_status ? '#00FF00' : '#FF0000' }}
                                        onClick={() => onBorrowDotClicked(record)}
                                    />
                                    <div
                                        className="inline-block w-3 h-3 rounded-full animate-pulse cursor-pointer"
                                        style={{ backgroundColor: record.stream_status ? '#00FF00' : '#FF0000' }}
                                        onClick={() => onStreamDotClicked(record)}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="absolute top-1/2 -translate-y-1/2 -left-8">
                <button
                    className="text-black text-xl disabled:opacity-50"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                    &#9664;
                </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-8">
                <button
                    className="text-black text-xl disabled:opacity-50"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    &#9654;
                </button>
            </div>
        </div>
    );
};

const CreditBorrowModal = ({ onClose, address }) => {
    const [isMobile, setIsMobile] = useState(true);
    const [borrowRecords, setBorrowRecords] = useState([]);
    const [creditBasedAllowance, setCreditBasedAllowance] = useState(0);
    const [remainAllowance, setRemainAllowance] = useState("0.00");
    const [tempRemainAllowance, setTempRemainAllowance] = useState("0.00");
    const [inputAmount, setInputAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [warning, setWarning] = useState("");
    const [borrowLoading, setBorrowLoading] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchBorrowStatus = async () => {
        try {
            const response = await fetch(`https://main-wjaxre4ena-uc.a.run.app/get_borrow_status?evm_address=${address}`);
            const data = await response.json();

            setBorrowRecords(data.borrow_records || []);
            setCreditBasedAllowance(data.credit_based_allowance || 0);
            setRemainAllowance(parseFloat(data.remain_allowance || "0.00").toFixed(2));
            setTempRemainAllowance(parseFloat(data.remain_allowance || "0.00").toFixed(2));
        } catch (error) {
            console.error("Error fetching borrow status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBorrowStatus();
    }, [address]);

    const handleInputChange = (e) => {
        const value = parseFloat(e.target.value);
        setInputAmount(value);
        if (isNaN(value) || value > parseFloat(remainAllowance)) {
            setWarning("illegal number!");
        } else {
            setWarning("");
            const updatedTempRemainAllowance = Math.max(0, (parseFloat(remainAllowance) - value).toFixed(2));
            setTempRemainAllowance(updatedTempRemainAllowance);
        }
    };

    const handleBorrow = async () => {
        if (!inputAmount || isNaN(inputAmount) || inputAmount <= 0) {
            setWarning("Please enter a valid amount to borrow!");
            return;
        }

        setBorrowLoading(true);
        try {
            const response = await fetch('https://main-wjaxre4ena-uc.a.run.app/credit_borrow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: address,
                    amount: inputAmount,
                }),
            });

            const responseData = await response.json();

            if (response.ok && responseData.init_stream) {
                // Refresh the borrow status after the borrowing action
                await fetchBorrowStatus();
                setInputAmount(0); // Reset input amount after successful borrow
                setWarning(""); // Clear any warning messages
            } else {
                throw new Error(responseData.message || 'Failed to borrow');
            }
        } catch (error) {
            console.error("Error borrowing:", error);
            setWarning("Borrowing failed! Please try again.");
        } finally {
            setBorrowLoading(false);
        }
    };

    const handleStreamDotClick = (record) => {
        console.log("Stream dot clicked for record:", record);
    };

    const handleBorrowDotClick = (record) => {
        console.log("Borrow dot clicked for record:", record);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            {loading ? (
                <div className="text-white">Loading...</div>
            ) : isMobile ? (
                <div className="w-[275px] h-[499px] relative">
                    <div className="w-[499px] h-[275px] left-0 top-[499px] absolute origin-top-left -rotate-90 bg-[#3962a0] rounded-[15px] shadow border border-black" />
                    <div className="left-[44px] top-[56px] absolute text-black text-3xl font-normal font-['Irish Grover']">Credit Borrow</div>
                    <div className="left-[47px] top-[90px] absolute text-black text-lg font-normal font-['Istok Web']">
                        Total: {creditBasedAllowance.toFixed(2)}
                    </div>
                    <div className="left-[47px] top-[110px] absolute text-black text-lg font-normal font-['Istok Web']">
                        Remaining: {parseFloat(tempRemainAllowance).toFixed(2)}
                    </div>
                    <div className="flex items-center left-[47px] top-[150px] absolute">
                        <input
                            type="number"
                            className="w-[94px] h-[41px] text-black text-xl font-normal font-['Irish Grover'] bg-white border border-black rounded p-1 text-center"
                            value={inputAmount}
                            onChange={handleInputChange}
                            disabled={borrowLoading}
                        />
                        <button 
                            className="ml-2 w-[72px] h-[41px] bg-[#acdff6] rounded-[15px] shadow text-black text-xs font-normal font-['Istok Web']"
                            onClick={handleBorrow}
                            disabled={borrowLoading}
                        >
                            {borrowLoading ? 'Borrowing...' : 'Borrow'}
                        </button>
                    </div>
                    {warning && (
                        <div className="left-[47px] top-[200px] absolute text-red-600 text-sm font-normal font-['Istok Web']">
                            {warning}
                        </div>
                    )}

                    <div
                        className="left-[243px] top-[11px] absolute text-xl font-normal font-['Istok Web'] cursor-pointer"
                        onClick={onClose}
                    >
                        X
                    </div>
                    <div className="w-[170px] h-[197px] left-[56px] top-[238px] absolute">
                        <CreditBorrowTable
                            borrowRecords={borrowRecords}
                            onStreamDotClicked={handleStreamDotClick}
                            onBorrowDotClicked={handleBorrowDotClick}
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-white p-4 rounded shadow-lg w-[499px] h-[275px] relative">
                    <div className="w-[499px] h-[275px] left-0 top-0 absolute bg-[#3962a0] rounded-[15px] shadow border border-black" />
                    <div className="left-[27px] top-[30px] absolute text-black text-3xl font-normal font-['Irish Grover']">Credit Borrow</div>
                    <div className="left-[35px] top-[90px] absolute text-black text-lg font-normal font-['Istok Web']">
                        Total: {creditBasedAllowance.toFixed(2)}
                    </div>
                    <div className="left-[35px] top-[110px] absolute text-black text-lg font-normal font-['Istok Web']">
                        Remaining: {parseFloat(tempRemainAllowance).toFixed(2)}
                    </div>
                    <div className="flex items-center left-[35px] top-[150px] absolute">
                        <input
                            type="number"
                            className="w-[94px] h-[41px] text-black text-xl font-normal font-['Istok Web'] bg-white border border-black rounded p-1 text-center"
                            value={inputAmount}
                            onChange={handleInputChange}
                            disabled={borrowLoading}
                        />
                        <button
                            className="ml-2 w-[72px] h-[41px] bg-[#acdff6] rounded-[15px] shadow text-black text-xs font-normal font-['Istok Web']"
                            onClick={handleBorrow}
                            disabled={borrowLoading}
                        >
                            {borrowLoading ? 'Borrowing...' : 'Borrow'}
                        </button>
                    </div>
                    {warning && (
                        <div className="left-[35px] top-[200px] absolute text-red-600 text-sm font-normal font-['Istok Web']">
                            {warning}
                        </div>
                    )}

                    <div
                        className="left-[464px] top-[16px] absolute text-xl font-normal font-['Istok Web'] cursor-pointer"
                        onClick={onClose}
                    >
                        X
                    </div>
                    <div className="w-[170px] h-[197px] left-[286px] top-[52px] absolute">
                        <CreditBorrowTable
                            borrowRecords={borrowRecords}
                            onStreamDotClicked={handleStreamDotClick}
                            onBorrowDotClicked={handleBorrowDotClick}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditBorrowModal;
