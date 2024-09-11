// Save this file as ./homepageComponents/NotificationBanner.jsx

import { useState } from 'react';

export default function NotificationBanner() {
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // Define the initial message content with links
  const initialMessage = [
    { text: "We make this tough decision for the sustainability of our future.", link: "" },
    { text: "We will change the credit score calculation rule, credit score will be binded with the kombat score", link: "https://doc.context-pilot.xyz/the-witch-card/credit-score" },
    { text: "Referral bonus rule will be changed, we are reducing our reward for each bucket", link: "https://doc.context-pilot.xyz/getting-started/referral-bonus" },
    { text: "G airdrop rule changed", link: "https://doc.context-pilot.xyz/the-witch-card/g-airdrop" }
  ];

  // Function to close the banner
  const handleBannerClose = () => {
    setIsBannerVisible(false);
  };

  return (
    <>
      {isBannerVisible && (
        <div className="fixed top-1/2 left-1/2 w-4/5 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white p-4 z-50 flex flex-col items-start rounded-lg shadow-lg text-sm">
          {initialMessage.map((content, index) => (
            <p key={index} className="mb-2">
              {index > 0 && <span className="font-bold">{index}.</span>} {content.text}{" "}
              {content.link && (
                <a href={content.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">detail</a>
              )}
            </p>
          ))}
          <button className="self-end mt-2 font-bold" onClick={handleBannerClose}>X</button>
        </div>
      )}
    </>
  );
}