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
      name: "AI助手",
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
      name: "英文翻译",
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
      name: "图像生成",
      request: {
        prompt: "",
        n: 1,
        size: "512x512",
      }
  }
]
export {promptList}; 

// 生成指令提示词
function generateInstructionPrompt(userInput, currentPrompt) {
  let instructionPrompt = ``;
  switch (currentPrompt) {
    case promptList[0].name:
         instructionPrompt = `以下是与AI助手的对话。该助手很有帮助性、创造性、聪明并且非常友善。
         \n人类：你好，你叫什么名字？
         \nAI：我是由OpenAI创建的AI。我今天能为您做些什么？
         \n人类：${userInput}
         \nAI:`
         break;
    case promptList[1].name:
        instructionPrompt = `将这个翻译成四种语言：1. 中文，2. 西班牙语，3. 日语和4. 马来语:\n\n${userInput}\n\n`
        break;
    case promptList[2].name:
        instructionPrompt = `${userInput}`
        break;
    default: 
    instructionPrompt = `以下是与AI助手的对话。该助手很有帮助性、创造性、聪明并且非常友善。
    \n人类：你好，你叫什么名字？
    \nAI：我是由OpenAI创建的AI。我今天能为您做些什么？
    \n人类：${userInput}`
  }
  return instructionPrompt;
}

// 生成API接口body
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

// 生成占位符提示信息
function generatePlaceholder(currentPrompt) { 
  switch(currentPrompt) {
    case promptList[0].name:
      return "开始聊天"
    case promptList[1].name:
      return "将需要翻译成中文、西班牙语、日语和马来语的任何文本插入："
    case promptList[2].name:
      return "请告诉我你想要生成的图片的主题或描述。"
    default:
      return "开始聊天"
  }
}

export default function Home() {
  // 加载 useState
  const [loading, setLoading] = useState(false);
  // 保存和设置对话
  const [messages, setMessages] = useState([]);
  // 保存和设置当前Prompt
  const [currentPrompt, setCurrentPrompt] = useState(`AI助手`);
  // 保存和设置用户输入
  const [userInput,setUserInput] = useState("");
  // 消息类型
  const messageType = {me: "me", openAI: "openAI"};

  // 将聊天窗口滚动到底部
  useEffect(() => {
    scroll.scrollToBottom({
        containerId: "chat",
        duration: 250,
      });
  }, [messages])

  // 开始一个新的聊天会话
  function clearChat() {
    setMessages([]);
  }

  // 设置Prompt
  function setPrompt(event) {
    event.preventDefault();
    clearChat();
    setCurrentPrompt(event.target.value);
  }

  // 处理请求提交
  async function submit(event) {
    event.preventDefault();
    // 设置加载动画
    setLoading(true);
    // 获取指令提示
    const instructionPrompt = generateInstructionPrompt(userInput, currentPrompt)
    // 临时信息
    let tempMessages = [...messages, {user: `${messageType.me}`, message: `${userInput}`}];
    // 把用户输入放到消息中
    setMessages(tempMessages);
    // 清除用户输入
    setUserInput("");

    // 调用OpenAI API接口
    try {
      const response = await fetch("api/generate",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: generateBody(currentPrompt, messages, userInput, tempMessages, instructionPrompt)
      });
      
      // 如果我们得到不成功的响应
      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      setMessages([...tempMessages, {user: messageType.openAI, message: `${data.openAI && data.openAI.trimStart()}`, image: data.image }]);
      // 设置加载动画为false
      setLoading(false);
    } 
    catch (error) {
      // 将加载动画设置为false
      setLoading(false);
      // 考虑在这里实现你自己的错误处理逻辑
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <>
      {/* Head */} 
      <Head>
          <title>ChatGPT-Genius</title>
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
                        开始新话题
                    </h2>
                </div>
              </div>
              {/* Prompts */}
              <div>
                  <h2 className="text-sm px-2 py-1 text-gray-100">
                        提示词选项:
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