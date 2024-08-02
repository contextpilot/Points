import Menu from "./homepageComponents/menu.js";
import HomeSection from "./homepageComponents/home.js";
import Section2 from "./homepageComponents/section2.js";
import Section3 from "./homepageComponents/section3.js";
import Section4 from "./homepageComponents/section4.js";
import Section5 from "./homepageComponents/section5.js";
import Section6 from "./homepageComponents/section6.js";
import Section7 from "./homepageComponents/section7.js";
import Section8 from "./homepageComponents/section8.js";
import Section9 from "./homepageComponents/section9.js";
import Footer from "./homepageComponents/footer.js";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import '@ryaneewx/react-chat-widget/lib/styles.css';
import { useAccount } from 'wagmi';

// Dynamically import the Chat Widget component
const ChatWidget = dynamic(() => import('@ryaneewx/react-chat-widget').then((mod) => mod.Widget), { ssr: false });

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { address: useAccountAddress, isConnected: useAccountIsConnected } = useAccount();

  // Function to toggle chat visibility
  const handleChatToggle = () => {
    setIsChatOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isChatOpen) {
      console.log("address", useAccountAddress, "isConnected", useAccountIsConnected);
      // Chat just opened, send a greeting message
      import('@ryaneewx/react-chat-widget').then(({ addResponseMessage }) => {
        addResponseMessage("Welcome to our chat!");
      });
    }
  }, [isChatOpen]);

  // Custom handler for new user messages
  const handleNewUserMessage = (newMessage) => {
    console.log(`New message incoming! ${newMessage}`);
    // Handle the new message as needed (e.g., send to a server or API)
    import('@ryaneewx/react-chat-widget').then(({ addResponseMessage }) => {
      addResponseMessage("Welcome to our chat!");
    });
  };

  return (
    <>
      <Menu />
      <main>
        <HomeSection />
        {/*
        <Section2 />
        <Section3 />
        */}
        <Section4 />
        {/*
        <Section7 />
        <Section5 />
        <Section6 />
        <Section8 />
        <Section9 />
        */}
        <Footer />
      </main>
      <ChatWidget
        title="Context Pilot"
        subtitle="What a wonderful day!"
        handleNewUserMessage={handleNewUserMessage}
        handleToggle={handleChatToggle} // Call handleChatToggle on toggle event if available
      />
    </>
  );
}