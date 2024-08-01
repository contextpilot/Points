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
import { useEffect } from "react";
import dynamic from "next/dynamic";
import '@ryaneewx/react-chat-widget/lib/styles.css';

// Dynamically import the Chat Widget component
const ChatWidget = dynamic(() => import('@ryaneewx/react-chat-widget').then((mod) => mod.Widget), { ssr: false });

export default function Home() {
  useEffect(() => {
    // Dynamically import addResponseMessage function
    import('@ryaneewx/react-chat-widget').then(({ addResponseMessage }) => {
      addResponseMessage("Welcome to our chat!");
    });
  }, []);

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
      />
    </>
  );
}