import React, { useState, useEffect } from 'react';

const CreditBorrowModal = ({ onClose, address }) => {
    const [isMobile, setIsMobile] = useState(true);
    const [borrowRecords, setBorrowRecords] = useState([]);
    const [creditBasedAllowance, setCreditBasedAllowance] = useState(0);
    const [remainAllowance, setRemainAllowance] = useState("0.0");
    const [loading, setLoading] = useState(true); // Track loading state

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchBorrowStatus = async () => {
            try {
                const response = await fetch(`https://main-wjaxre4ena-uc.a.run.app/get_borrow_status?evm_address=${address}`);
                const data = await response.json();
                
                setBorrowRecords(data.borrow_records || []);
                setCreditBasedAllowance(data.credit_based_allowance || 0);
                setRemainAllowance(data.remain_allowance || "0.00");
            } catch (error) {
                console.error("Error fetching borrow status:", error);
            } finally {
                setLoading(false); // Set loading to false once the fetch is complete
            }
        };

        fetchBorrowStatus();
    }, [address]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            {loading ? ( // Show loading message while fetching
                <div className="text-white">Loading...</div>
            ) : isMobile ? (
                <div className="w-[275px] h-[499px] relative">
                    <div className="w-[499px] h-[275px] left-0 top-[499px] absolute origin-top-left -rotate-90 bg-[#3962a0] rounded-[15px] shadow border border-black" />
                    <div className="left-[44px] top-[56px] absolute text-black text-3xl font-normal font-['Irish Grover']">Credit Borrow</div>
                    <div className="w-[72px] h-6 left-[161px] top-[130px] absolute">
                        <img className="w-[72px] h-6 left-0 top-0 absolute rounded-[15px] shadow" src="https://via.placeholder.com/72x24" />
                        <div className="w-[54px] h-3.5 left-[9px] top-[5px] absolute bg-[#acdff6]" />
                        <div className="left-[22px] top-[5px] absolute text-black text-xs font-normal font-['Istok Web']">Borrow</div>
                    </div>
                    <input 
                        type="number" 
                        max={remainAllowance}
                        className="left-[47px] top-[122px] absolute w-[94px] h-[41px] text-black text-xl font-normal font-['Irish Grover'] bg-white border border-black rounded p-1 text-center"
                        value={remainAllowance} 
                        readOnly // Set to true to make it read-only for display
                    />
                    
                    <div
                        className="left-[243px] top-[11px] absolute text-xl font-normal font-['Istok Web'] cursor-pointer"
                        onClick={onClose}
                    >
                        X
                    </div>
                    <div className="w-[170px] h-[197px] left-[56px] top-[238px] absolute bg-[#d9d9d9]" />
                </div>
            ) : (
                <div className="bg-white p-4 rounded shadow-lg w-[499px] h-[275px] relative">
                    <div className="w-[499px] h-[275px] left-0 top-0 absolute bg-[#3962a0] rounded-[15px] shadow border border-black" />
                    <div className="left-[27px] top-[30px] absolute text-black text-3xl font-normal font-['Irish Grover']">Credit Borrow</div>

                    <div className="w-[72px] h-6 left-[152px] top-[132px] absolute">
                        <img className="w-[72px] h-6 left-0 top-0 absolute rounded-[15px] shadow" src="https://via.placeholder.com/72x24" alt="Borrow Icon" />
                        <div className="w-[54px] h-3.5 left-[9px] top-[5px] absolute bg-[#acdff6]" />
                        <div className="left-[22px] top-[5px] absolute text-black text-xs font-normal font-['Istok Web']">Borrow</div>
                    </div>
                    <input 
                        type="number" 
                        max={remainAllowance}
                        className="left-[35px] top-[124px] absolute w-[94px] h-[41px] text-black text-xl font-normal font-['Istok Web'] bg-white border border-black rounded p-1 text-center"
                        value={remainAllowance} 
                        readOnly // Set to true to make it read-only for display
                    />
                    <div
                        className="left-[464px] top-[16px] absolute text-xl font-normal font-['Istok Web'] cursor-pointer"
                        onClick={onClose}
                    >
                        X
                    </div>
                    <div className="w-[170px] h-[197px] left-[286px] top-[52px] absolute bg-[#d9d9d9]" />
                </div>
            )}
        </div>
    );
};

export default CreditBorrowModal;