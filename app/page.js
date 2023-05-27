"use client"
import Chat from "@/components/chat";
import Prompts from "@/components/prompts";
import Head from "next/head";
import custombg from "/styles/bg.module.css";
import { useState } from "react";
import { useEffect } from "react";
import { animateScroll as scroll } from 'react-scroll';
import { ClockLoader } from 'react-spinners';

const promptList = [
  {
      name: "AI assistant",
      request : {
        model: "text-davinci-003",
        prompt: "",
        temperature: 0.9,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
      }
  },
  {
      name: "English to other languages",
      request: {
        model: "text-davinci-003",
        prompt: "",
        temperature: 0.1,
        max_tokens: 200,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }
  },
  {
      name: "Image generator",
      request: {
        prompt: "",
        n: 1,
        size: "512x512",
      }
  }
]
export {promptList}; 

// Generate instruction prompt
function generateInstructionPrompt(userInput, currentPrompt) {
  let instructionPrompt = ``;
  switch (currentPrompt) {
    case promptList[0].name:
         instructionPrompt = `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.
         \nHuman: Hello, who are you?
         \nAI: I am an AI created by OpenAI. How can I help you today?
         \nHuman: ${userInput}
         \nAI:`
         break;
    case promptList[1].name:
        instructionPrompt = `Translate this into four languages 1. French, 2. Spanish, 3. Japanese and 4. Malay:\n\n${userInput}\n\n`
        break;
    case promptList[2].name:
        instructionPrompt = `${userInput}`
        break;
    default: 
    instructionPrompt = `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.
    \n\nHuman: Hello, who are you?
    \nAI: I am an AI created by OpenAI. How can I help you today?
    \nHuman: ${userInput}`
  }
  return instructionPrompt;
}

// Generate body
function generateBody(currentPrompt, messages, userInput, tempMessages, instructionPrompt) { 
  let body = "";
  switch(currentPrompt) {
    case promptList[0].name:
      body = JSON.stringify({input: `${messages.length === 0 ? instructionPrompt : tempMessages.map(m => m.message).join(" ")}`, prompt: currentPrompt})
      break;
    case promptList[1].name:
      body = JSON.stringify({input: instructionPrompt, prompt: currentPrompt})
    case promptList[2].name:
      body = JSON.stringify({input: instructionPrompt, prompt: currentPrompt})
      break;
    default:
      body = JSON.stringify({input: `${messages.length === 0 ? instructionPrompt : tempMessages.map(m => m.message).join(" ")}`, prompt: currentPrompt})
  }
  return body
}

// To generate placeholder
function generatePlaceholder(currentPrompt) { 
  switch(currentPrompt) {
    case promptList[0].name:
      return "Start chatting"
    case promptList[1].name:
      return "Insert any text you want to translate into French,Spanish,Japanese and Malay: "
    case promptList[2].name:
      return "Insert your prompt to generate image:"
    default:
      return "Start chatting."
  }
}

export default function Home() {
  // loading useState
  const [loading, setLoading] = useState(false);
  // Save and set conversation
  const [messages, setMessages] = useState([]);
  // Save and set current prompt
  const [currentPrompt, setCurrentPrompt] = useState(`AI assistant`);
  // Save and set userinput
  const [userInput,setUserInput] = useState("");
  // Message type
  const messageType = {me: "me", openAI: "openAI"};

  // Scroll the chat container to the bottom
  useEffect(() => {
    scroll.scrollToBottom({
        containerId: "chat",
        duration: 250,
      });
  }, [messages])

  // Set a new chat
  function clearChat() {
    setMessages([]);
  }

  // Set prompt
  function setPrompt(event) {
    event.preventDefault();
    clearChat();
    setCurrentPrompt(event.target.value);
  }

  // Handle submit 
  async function submit(event) {
    event.preventDefault();
    // Set loading animation to true
    setLoading(true);
    // Get instruction prompt
    const instructionPrompt = generateInstructionPrompt(userInput, currentPrompt)
    // Temporary message
    let tempMessages = [...messages, {user: `${messageType.me}`, message: `${userInput}`}];
    // Put the userInput in the messages
    setMessages(tempMessages);
    // Clear user input
    setUserInput("");

    // Call the API
    try {
      const response = await fetch("api/generate",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: generateBody(currentPrompt, messages, userInput, tempMessages, instructionPrompt)
      });
      
      // If we get unsuccessful response
      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      setMessages([...tempMessages, {user: messageType.openAI, message: `${data.openAI && data.openAI.trimStart()}`, image: data.image }]);
      // Set loading animation to false
      setLoading(false);
    } 
    catch (error) {
      // Set loading animation to false
      setLoading(false);
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <>
      {/* Head */} 
      <Head>
          <title>ChatGPT</title>
      </Head>
      {/* Main */}
      <div className={`w-full min-h-full ${custombg.customBg}`}>
        <div className="flex">
          {/* Sidebar */}
          <div className="bg-gray-800 h-screen w-1/5 p-2">
            <div>
              {/* New chat */}
              <div>
                <div className="text-gray-100 flex items-center text-xl p-3  bg-gray-900 rounded-md border border-slate-600 shadow-md m-1 hover:bg-gray-700" onClick={clearChat}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                    </svg>
                    <h2 className="text-sm px-1">
                        New chat
                    </h2>
                </div>
              </div>
              {/* Prompts */}
              <div>
                  <h2 className="text-sm px-2 py-1 text-gray-100">
                        Prompt options:
                  </h2>
                  <div className="p-1 flex justify-center">
                    <select onChange={setPrompt} className="form-select appearance-none
                    block
                    w-full
                    px-3
                    py-1.5
                    text-gray-100
                    bg-gray-900 bg-clip-padding bg-no-repeat
                    border border-slate-600
                    rounded
                    transition
                    ease-in-out
                    m-0
                    focus:text-gray-100 focus:bg-gray-900 focus:border-slate-600 focus:outline-none">
                    {/* Prompts select button  */}
                    <Prompts/>
                    </select>
                  </div>
              </div>
            </div>
          </div> 
          {/* Main area */}
          <div className="w-4/5 relative">
            {/* Chat area */}
            <div id="chat" className="h-[90vh] overflow-auto scrollbar">
              {messages.length > 0 && 
                messages.map((user, index)=>(
                  <Chat key={index} user={user}/>
                ))
              }
            </div>
            {/* Text input area */}
            <div>
              <div className="p-5 absolute bottom-0 right-0 left-0">
                <div className="flex justify-center mb-2">
                  {/* ClocLoader */}
                  <ClockLoader size={20} color={"#F3F4F6"} loading={loading} />
                </div>
                <form className="relative" onSubmit={submit}>
                  <input 
                    type="text"
                    placeholder= {generatePlaceholder(currentPrompt)}
                    value={userInput} 
                    required
                    onChange={(e)=>setUserInput(e.target.value)} 
                    rows="1" 
                    className="block p-2.5 w-full text-sm text-gray-50 bg-gray-700 rounded-lg focus:outline-none ring-gray-500 focus:border-gray-500 shadow-md"
                  />  
                  <button type="submit" className="right-2 bottom-3 absolute pr-2" >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="gray" className="w-5 h-5">
                      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                    </svg>
                  </button>
                </form> 
              </div>
            </div>
          </div> 
        </div> 
      </div>
      
    </>
  )
}