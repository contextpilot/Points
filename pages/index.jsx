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
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import '@ryaneewx/react-chat-widget/lib/styles.css';
import { useAccount } from 'wagmi';
import axios from "axios";
import NotificationBanner from "./homepageComponents/NotificationBanner";

// Dynamically import the Chat Widget component
const ChatWidget = dynamic(() => import('@ryaneewx/react-chat-widget').then((mod) => mod.Widget), { ssr: false });

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { address: useAccountAddress, isConnected: useAccountIsConnected } = useAccount();
  const chatWidgetRef = useRef(null);

  const [userApiKey, setUserApiKey] = useState(null);
  const [conversation, setConversation] = useState([
    { role: "system", content: "I am an active bot" },
    { role: "user", content: "How are you!" },
  ]);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");

  useEffect(() => {
    if (!useAccountAddress) return;

    async function fetchApiUsage() {
      try {
        const response = await axios.get(`https://main-wjaxre4ena-uc.a.run.app/api_usage?address=${useAccountAddress}`);
        if (response.status !== 200) throw new Error("Failed to fetch API key");

        const data = response.data;
        setUserApiKey(data.api_key);
      } catch (error) {
        console.error("Failed to fetch API key:", error);
      }
    }

    fetchApiUsage();
  }, [useAccountAddress]);

  const handleChatToggle = () => {
    setIsChatOpen((prev) => !prev);
  };

  const initStreamingSession = async (messageJson) => {
    try {
      const response = await axios.post("https://main-wjaxre4ena-uc.a.run.app/streaminit", { message_json: messageJson });
      return response.data.session_id;
    } catch (error) {
      console.error("Error initiating streaming session", error);
      throw new Error("Failed to initialize streaming session");
    }
  };

  const streamChatMessage = async (sessionId, newMessage) => {
    return new Promise((resolve, reject) => {
      if (!userApiKey) {
        console.error("API key is not available");
        reject(new Error("API key is not available"));
        return;
      }
  
      const url = `https://main-wjaxre4ena-uc.a.run.app/streamchat?session_id=${sessionId}&secret_key=${userApiKey}`;
      let responseContent = "";
  
      // Initialize EventSource
      const eventSource = new EventSource(url);
  
      // Handle incoming messages
      eventSource.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        responseContent += messageData.text;
        if (messageData.finish_reason) {
          eventSource.close();
          resolve({ content: responseContent, question_id: messageData.question_id });
        }
      };
  
      // Error handling
      eventSource.onerror = (event) => {
        console.error("EventSource failed:", event);
        eventSource.close();
        reject(new Error("Failed to stream chat message"));
      };
    });
  };

  const initiateChatOnOpen = async () => {
    if (!useAccountAddress) {
      console.warn("User address is not connected.");
      import("@ryaneewx/react-chat-widget").then(({ addResponseMessage }) => {
        addResponseMessage("Please connect your wallet first.");
      });
      return;
    }

    if (conversation.length > 2) {
      console.warn("Conversation length is larger than 2. No action will be taken.");
      return;
    }

    const initialMessage = {
      model: selectedModel,
      message: conversation,
    };

    try {
      const sessionId = await initStreamingSession(JSON.stringify(initialMessage));
      const response = await streamChatMessage(sessionId, "Welcome to our chat!");

      setConversation(prev => [...prev, { role: "assistant", content: response.content, question_id: response.question_id }]);
      import("@ryaneewx/react-chat-widget").then(({ addResponseMessage }) => {
        addResponseMessage(response.content);
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
      initiateChatOnOpen();
    }
  }, [isChatOpen, useAccountAddress, userApiKey, selectedModel]);

  useEffect(() => {
    if (chatWidgetRef.current) {
      const inputElement = chatWidgetRef.current.querySelector('.rcw-input');

      if (inputElement && 'ontouchstart' in window) {
        inputElement.setAttribute('contenteditable', false);
        const handleTouchStart = () => {
          inputElement.setAttribute('contenteditable', true);
          setTimeout(() => {
            inputElement.focus();
          }, 100);
        };

        inputElement.addEventListener('touchstart', handleTouchStart);

        return () => {
          inputElement.removeEventListener('touchstart', handleTouchStart);
        };
      }
    }
  }, [isChatOpen]);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

    if (isiOS && chatWidgetRef.current) {
      const widgetContainer = chatWidgetRef.current.querySelector('.rcw-widget-container');
      if (widgetContainer) {
        widgetContainer.style.paddingBottom = '15px';
        widgetContainer.style.boxSizing = 'border-box';

        const conversationContainer = chatWidgetRef.current.querySelector('.rcw-conversation-container');
        if (conversationContainer) {
          conversationContainer.style.height = `calc(100vh - ${widgetContainer.offsetTop}px - env(safe-area-inset-bottom))`;
        }
      }
    }
  }, []);

  const handleNewUserMessage = async (newMessage) => {
    const updatedConversation = [...conversation, { role: "user", content: newMessage }];
    const initialMessage = {
      model: selectedModel,
      message: updatedConversation,
    };

    try {
      const sessionId = await initStreamingSession(JSON.stringify(initialMessage));
      const response = await streamChatMessage(sessionId, newMessage);

      setConversation(prev => [...prev, { role: "assistant", content: response.content, question_id: response.question_id }]);

      import("@ryaneewx/react-chat-widget").then(({ addResponseMessage }) => {
        addResponseMessage(response.content);
      });
    } catch (error) {
      console.error("Error handling new user message", error);
      import("@ryaneewx/react-chat-widget").then(({ addResponseMessage }) => {
        addResponseMessage("Sorry, something went wrong. Please try again.");
      });
    }
  };

  // Clear session function including widget clear
  const clearSession = () => {
    setConversation([
      { role: "system", content: "I am an active bot" },
      { role: "user", content: "How are you!" },
    ]);

    import("@ryaneewx/react-chat-widget").then(({ addResponseMessage, deleteMessages }) => {
      // Assuming deleteMessages or similar is available:
      deleteMessages(); // Hypothetical function to clear the widget messages
      addResponseMessage("Session cleared. Starting a new conversation.");
    });
  };

  return (
    <>
      <div>
        <label htmlFor="model-select">Choose a model:</label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="gpt-4o">GPT-4o</option>
          <option value="claude-3-5-sonnet-latest">claude-3-5-sonnet-latest</option>
          <option value="gemini-1.5-pro-latest">gemini-1.5-pro-latest</option>
          <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
        </select>
        <button onClick={clearSession}>Clear Session</button>
      </div>
      <main className="flex flex-col min-h-screen">
        <Section4 />
      </main>
      <div ref={chatWidgetRef}>
        <ChatWidget
          handleNewUserMessage={handleNewUserMessage}
          handleToggle={handleChatToggle}
          autofocus={false}
          resizable={true}
        />
      </div>
    </>
  );
}