import React from 'react';

const CreditBorrowModal = ({ onClose, bnbDomainName }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg w-[499px] h-[275px] relative">
        <div className="w-[499px] h-[275px] left-0 top-0 absolute bg-[#3962a0] rounded-[15px] shadow border border-black" />
        <div className="left-[27px] top-[30px] absolute text-black text-3xl font-normal font-['Irish Grover']">Credit Borrow</div>
        <div className="w-[72px] h-6 left-[152px] top-[132px] absolute">
          <img className="w-[72px] h-6 left-0 top-0 absolute rounded-[15px] shadow" src="https://via.placeholder.com/72x24" alt="Borrow Icon" />
          <div className="w-[54px] h-3.5 left-[9px] top-[5px] absolute bg-[#acdff6]" />
          <div className="left-[22px] top-[5px] absolute text-black text-xs font-normal font-['Istok Web']">Borrow</div>
        </div>
        <div className="w-[94px] h-[41px] left-[35px] top-[124px] absolute bg-[#d9d9d9]" />
        <div className="left-[53px] top-[129px] absolute text-black text-3xl font-normal font-['Irish Grover']">5.00</div>
        <div className="left-[464px] top-[16px] absolute text-[#ff0505] text-xl font-normal font-['Istok Web']" onClick={onClose}>X</div>
        <div className="w-[170px] h-[197px] left-[286px] top-[52px] absolute bg-[#d9d9d9]" />
      </div>
    </div>
  );
};

export default CreditBorrowModal;