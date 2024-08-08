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
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import '@ryaneewx/react-chat-widget/lib/styles.css';
import { useAccount } from 'wagmi';
import axios from "axios";

// Dynamically import the Chat Widget component
const ChatWidget = dynamic(() => import('@ryaneewx/react-chat-widget').then((mod) => mod.Widget), { ssr: false });

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { address: useAccountAddress, isConnected: useAccountIsConnected } = useAccount();

  const chatWidgetRef = useRef(null);

     const handleChatToggle = () => {
       setIsChatOpen((prev) => !prev);

       // Move focus away from the chat input to prevent virtual keyboard from opening
       if (chatWidgetRef.current) {
         chatWidgetRef.current.blur();
       }

       // or, if autofocus: false should work, ensure it's respected
       if (!isChatOpen && chatWidgetRef.current) {
         chatWidgetRef.current.autofocus = false;
       }
     };

  // State to maintain the entire conversation
  const [conversation, setConversation] = useState([
    { role: "system", content: "I am an active bot" },
    { role: "user", content: "Welcome to our chat!" },
  ]);

  // Function to initialize a streaming session and get a session ID
  const initStreamingSession = async (messageJson) => {
    try {
      const response = await axios.post("https://main-wjaxre4ena-uc.a.run.app/streaminit", { message_json: messageJson });
      return response.data.session_id;
    } catch (error) {
      console.error("Error initiating streaming session", error);
      throw new Error("Failed to initialize streaming session");
    }
  };

  // Function to interact with the chat streaming endpoint 
  const streamChatMessage = async (sessionId, newMessage) => {
    const secretKey = useAccountAddress.slice(-6);
    const url = `https://main-wjaxre4ena-uc.a.run.app/streamchat?session_id=${sessionId}&secret_key=${secretKey}`;
    try {
      const response = await axios.get(url);
      return response.data; // Modify based on your backend response structure
    } catch (error) {
      console.error("Error streaming chat message", error);
      throw new Error("Failed to stream chat message");
    }
  };

  // Function to initiate chat when chat widget is opened
  const initiateChatOnOpen = async () => {
    if (!useAccountAddress) {
      console.warn("User address is not connected.");
      import("@ryaneewx/react-chat-widget").then(({ addResponseMessage }) => {
        addResponseMessage("Please connect your wallet first.");
      });
      return;
    }

    const initialMessage = { 
      model: "cryptiqa", 
      message: conversation 
    };

    try {
      // Step 1: Initialize the streaming session
      const sessionId = await initStreamingSession(JSON.stringify(initialMessage));

      // Step 2: Stream the chat message to get a response
      const response = await streamChatMessage(sessionId, "Welcome to our chat!");

      setConversation(prev => [...prev, { role: "assistant", content: response.content, question_id: response.question_id }]);

      // Handle the backend response and display it in the chat widget
      import("@ryaneewx/react-chat-widget").then(({ addResponseMessage }) => {
        addResponseMessage(response.content); // Adjust based on your backend response structure
      });
    } catch (error) {
      console.error("Error initiating chat on open", error);
      import("@ryaneewx/react-chat-widget").then(({ addResponseMessage }) => {
        addResponseMessage("Sorry, something went wrong. Please try again.");
      });
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      console.log("address", useAccountAddress, "isConnected", useAccountIsConnected);

      // Initiate chat when the chat widget is opened
      initiateChatOnOpen();
    }
  }, [isChatOpen, useAccountAddress, useAccountIsConnected]);

  // Custom handler for new user messages
  const handleNewUserMessage = async (newMessage) => {
    const updatedConversation = [...conversation, { role: "user", content: newMessage }];
    const initialMessage = {
      model: "cryptiqa",
      message: updatedConversation,
    };

    try {
      // Step 1: Initialize the streaming session
      const sessionId = await initStreamingSession(JSON.stringify(initialMessage));

      // Step 2: Stream the chat message to get a response
      const response = await streamChatMessage(sessionId, newMessage);

      setConversation(prev => [...prev, { role: "assistant", content: response.content, question_id: response.question_id }]);

      // Handle the backend response and display it in the chat widget
      import("@ryaneewx/react-chat-widget").then(({ addResponseMessage }) => {
        addResponseMessage(response.content); // Adjust based on your backend response structure
      });
    } catch (error) {
      console.error("Error handling new user message", error);
      import("@ryaneewx/react-chat-widget").then(({ addResponseMessage }) => {
        addResponseMessage("Sorry, something went wrong. Please try again.");
      });
    }
  };

  return (
    <>
      <Menu />
      <main>
        {/*
        <HomeSection />
        <Section2 />
        <Section3 />
        */}
        <Section4 />
        {/*
        <Section5 />
        <Section6 />
        <Section7 />
        <Section8 />
        <Section9 />
        */}
        <Footer />
      </main>
      <ChatWidget
        handleNewUserMessage={handleNewUserMessage}
        handleToggle={handleChatToggle}
        autofocus={false}
      />
    </>
  );
}