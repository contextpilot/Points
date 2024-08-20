import Image from 'next/image';
import { useEffect, useState } from 'react';

const CreditCardModal = ({ evmAddress }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [creditScore, setCreditScore] = useState('***');
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust the breakpoint as needed
    };

    window.addEventListener('resize', handleResize);

    // Check the screen size on the initial render
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
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleClick = () => {
    setIsClicked(true);
    fetchCreditScore();
    setTimeout(() => {
      setIsClicked(false);
    }, 200); // Duration of the click effect
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
          <div className="left-[25px] top-[402px] absolute text-black text-xl font-normal font-irish-grover">witch.xxxxx.[eth/bnb/sol/?]</div>
          <div className="left-[71px] top-[310px] absolute text-black text-3xl font-normal font-irish-grover">{creditScore}</div>
          <Image
            className={`left-[137px] top-[315px] absolute rounded-[15px] cursor-pointer ${isClicked ? 'opacity-50' : ''}`}
            src="/images/refresh.png"
            alt="Refresh"
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
          <div className="left-[238px] top-[219px] absolute text-black text-xl font-normal font-irish-grover">witch.xxxxx.[eth/bnb/sol/?]</div>
          <div className="left-[299px] top-[125px] absolute text-black text-3xl font-normal font-irish-grover">{creditScore}</div>
          <Image
            className={`left-[359px] top-[129px] absolute rounded-[15px] cursor-pointer ${isClicked ? 'opacity-50' : ''}`}
            src="/images/refresh.png"
            alt="Refresh"
            width={72}
            height={24}
            onClick={handleClick}
          />
        </div>
      )}
    </div>
  );
};

export default CreditCardModal;