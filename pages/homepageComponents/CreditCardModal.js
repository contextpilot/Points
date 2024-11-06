import Image from 'next/image';
import { useEffect, useState } from 'react';
import CreditBorrowModal from './CreditBorrowModal';

const ConfirmationModal = ({ onCancel, onConfirm, transactionHashes, isMinting }) => {
  const transactionLinkTexts = [
    "Set Space ID domain",
    "Set Credit Score",
    "Allow USDT on AAVE",
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-semibold">Confirm Mint</h2>
        <p>We will charge you 1000 tokens to mint. Do you want to proceed?</p>
        
        {transactionHashes && (
          <div className="mt-2">
            <h3 className="font-medium">Transaction Result:</h3>
            <ul>
              {transactionHashes.error ? (  // Check if transactionHashes has an error property
                <li className="text-red-500">{transactionHashes.error}</li> // Display the error message
              ) : (
                Object.values(transactionHashes).map((txHash, index) => (
                  <li key={index} className="break-all">
                    <a
                      href={`https://bscscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {transactionLinkTexts[index] || txHash} {/* Use custom link text based on the index */}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button className="mr-2 px-4 py-2 text-white bg-gray-500 rounded" onClick={onCancel}>Cancel</button>
          <button 
            className={`px-4 py-2 text-white ${isMinting ? 'bg-orange-500' : 'bg-blue-500'} rounded`} 
            onClick={onConfirm} 
            disabled={isMinting} 
          >
            {isMinting ? 'Minting...' : 'Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreditCardModal = ({ evmAddress }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [creditScore, setCreditScore] = useState('***');
  const [domainExists, setDomainExists] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [bnbDomainName, setBnbDomainName] = useState('Fetching...');
  const [buttonText, setButtonText] = useState('Refresh');
  const [isConfirmingMint, setIsConfirmingMint] = useState(false);
  const [transactionHashes, setTransactionHashes] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isBorrowingVisible, setIsBorrowingVisible] = useState(false);

  const handleOpenBorrowModal = () => {
    setIsBorrowingVisible(true);
  };

  const handleCloseBorrowModal = () => {
    setIsBorrowingVisible(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCreditScore = async () => {
    try {
      const response = await fetch(`https://main-wjaxre4ena-uc.a.run.app/api_usage?address=${evmAddress}&type=credit_checkin`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCreditScore(data.credit_score);
      setDomainExists(data.domain_exists);
      // Check conditions for button text
      if (
        data.credit_score > 600 &&
        bnbDomainName.toLowerCase().includes('bnb')
      ) {
        setButtonText('Mint Credit');
      } else {
        setButtonText('Refresh');
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const fetchEnsNameFromAPI = async (address) => {
    try {
      const response = await fetch(`https://api.prd.space.id/v1/getName?tld=bnb&address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ENS name');
      }

      const data = await response.json();
      if (data.code === 0 && data.name) {
        setBnbDomainName(data.name);
      } else {
        setBnbDomainName('No ENS name found');
      }
    } catch (error) {
      console.error('Error fetching ENS name:', error);
      setBnbDomainName('Error fetching ENS name');
    }
  };

  useEffect(() => {
    fetchEnsNameFromAPI(evmAddress);
  }, [evmAddress]);

  const handleMintCredit = async () => {
    try {
      const response = await fetch('https://main-wjaxre4ena-uc.a.run.app/credit_consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: evmAddress, is_force: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mint credit');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error minting credit:', error);
    }
  };

  const handleClick = () => {
    setIsClicked(true);

    if (buttonText === 'Refresh') {
      fetchCreditScore();
    } else {
      // Show the confirmation pop-up
      setIsConfirmingMint(true);
    }

    setTimeout(() => {
      setIsClicked(false);
    }, 200);
  };

  const handleMintConfirm = async () => {
    try {
      setIsMinting(true); // Mark as minting
      const data = await handleMintCredit(); // Call the mint function
      setTransactionHashes(data);
    } catch (err) {
      console.error('Error minting credit:', err);
      // Optionally handle the error state here if needed
    } finally {
      setIsMinting(false); // Reset minting state after operation
    }
  };
  
  const handleMintCancel = () => {
    setIsConfirmingMint(false); // Close the confirmation modal
  };

  return (
    <div>
      {isMobile ? (
        <div className="w-[275px] h-[499px] relative">
          <div className="w-[499px] h-[275px] left-0 top-[499px] absolute origin-top-left -rotate-90 bg-[#3962a0] rounded-[15px] shadow border border-black" />
          <Image
            className="left-[47px] top-[80px] absolute rounded-[15px]"
            src="/images/witch.png"
            alt="Witch Card"
            width={171}
            height={113}
          />
          <div className="left-[47px] top-[241px] absolute text-black text-3xl font-normal font-irish-grover">Credit Score</div>
          <div className="left-[63px] top-[22px] absolute text-black text-3xl font-normal font-irish-grover">Witch Card</div>
          <div className="left-[40px] top-[355px] absolute text-blue-500 text-sm font-irish-grover underline block">
            <a
              href="https://doc.context-pilot.xyz/the-witch-card/credit-score"
              target="_blank"
              rel="noopener noreferrer"
            >
              How credit score is calculated
            </a>
            <br />
            <a
              className="mt-2"  // Add margin-top class here
              href="https://doc.context-pilot.xyz/the-witch-card/witch-domain/mint-credit-score-on-chain"
              target="_blank"
              rel="noopener noreferrer"
            >
              How to mint credit score
            </a>
          </div>
          <div className="left-[25px] top-[402px] absolute text-black text-xl font-normal font-irish-grover">
            {bnbDomainName !== 'Fetching...' && (
              <a 
                onClick={handleOpenBorrowModal} // Make sure this function is defined
                className="cursor-pointer text-blue-500 underline"
              >
                witchcard.{bnbDomainName}
              </a>
            )}
          </div>
          <div className="left-[71px] top-[310px] absolute text-black text-3xl font-normal font-irish-grover">{creditScore}</div>
          <Image
            className={`left-[137px] top-[315px] absolute rounded-[15px] cursor-pointer ${isClicked ? 'opacity-50' : ''}`}
            src={`/images/${buttonText === 'Mint Credit' ? 'mint.png' : 'refresh.png'}`}
            alt={buttonText}
            width={72}
            height={24}
            onClick={handleClick}
          />
        </div>
      ) : (
        <div className="w-[499px] h-[275px] relative">
          <div className="w-[499px] h-[275px] left-0 top-0 absolute bg-[#3962a0] rounded-[15px] shadow border border-black" />
          <Image
            className="left-[24px] top-[52px] absolute rounded-[15px]"
            src="/images/witch.png"
            alt="Witch Card"
            width={171}
            height={113}
          />
          <div className="left-[268px] top-[52px] absolute text-black text-3xl font-normal font-irish-grover">Credit Score</div>
          <div className="left-[24px] top-[213px] absolute text-black text-3xl font-normal font-irish-grover">Witch Card</div>
          <div className="left-[238px] top-[219px] absolute text-black text-xl font-normal font-irish-grover">
            {bnbDomainName !== 'Fetching...' && (
              <a 
                onClick={handleOpenBorrowModal} // Make sure this function is defined
                className="cursor-pointer text-blue-500 underline"
              >
                witchcard.{bnbDomainName}
              </a>
            )}
          </div>
          <div className="left-[299px] top-[125px] absolute text-black text-3xl font-normal font-irish-grover">{creditScore}</div>
          <Image
            className={`left-[359px] top-[129px] absolute rounded-[15px] cursor-pointer ${isClicked ? 'opacity-50' : ''}`}
            src={`/images/${buttonText === 'Mint Credit' ? 'mint.png' : 'refresh.png'}`}
            alt={buttonText}
            width={72}
            height={24}
            onClick={handleClick}
          />
          <div className="left-[268px] top-[165px] absolute text-blue-500 text-sm font-irish-grover underline block flex flex-col">
            <a
              href="https://doc.context-pilot.xyz/the-witch-card/credit-score"
              target="_blank"
              rel="noopener noreferrer"
            >
              How credit score is calculated
            </a>
            <a
              className="mt-2"  // Add margin-top class here
              href="https://doc.context-pilot.xyz/the-witch-card/witch-domain/mint-credit-score-on-chain"
              target="_blank"
              rel="noopener noreferrer"
            >
              How to mint credit score
            </a>
          </div>
        </div>
      )}
      {isConfirmingMint && (
        <ConfirmationModal
          onCancel={handleMintCancel}
          onConfirm={handleMintConfirm}
          transactionHashes={transactionHashes}
          isMinting={isMinting} // Pass minting state to the modal
        />
      )}
      {isBorrowingVisible && (
        <CreditBorrowModal 
          onClose={handleCloseBorrowModal} 
          bnbDomainName={bnbDomainName} 
        />
      )}
    </div>
  );
};

export default CreditCardModal;