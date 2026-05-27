import React, { useState, useEffect, useRef } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hi there! 🙋🏻‍♂️ I'm Lourd. Thanks for checking out my portfolio! Feel free to ask about my projects, the tools I use, or my experience. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText, time: currentTime }]);
    setIsTyping(true);

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    if (!apiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'model',
          text: 'API Key is missing! Please set REACT_APP_GEMINI_API_KEY in your .env file.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      // Format history for Gemini API
      const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      // Add the new user message
      contents.push({ role: 'user', parts: [{ text: userText }] });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are Lourd Angelou D. Bufete, a Full Stack Web Developer. You are chatting with a visitor on your portfolio website. Be friendly, professional, and concise. Here are your resume facts: Contact: Cubacub Mandaue City, lourdangeloubufete17@gmail.com, +63 966 804 4546, Website: https://lourdev.vercel.app. Summary: Full Stack Developer building scalable web apps with React, TypeScript, Node.js, and .NET. Skilled in secure, role-based systems and MySQL/MS SQL Server. Education: Recently graduated (completely done) with a Bachelor of Science in Information Technology from Benedicto College (2022-2026), A.S Fortuna St. Bakilid Mandaue City. Experience 1: Intern Full Stack Developer at MIS Office, Mandaue City Hall (Dec 2025-Apr 2026). Built Asset Management System with React, TypeScript, Tailwind, C#, .NET, MS SQL, Azure DevOps. Modules: asset registration, PAR, purchase orders, disposal tracking, role-based access. Experience 2 (Freelance): Full Stack Developer for Web-based Modern Notepad (Node.js, Express, MySQL backend; React, TypeScript, Tailwind frontend). Experience 3 (Freelance): Backend Developer for Job Request Ticketing System (Dec 2025-Mar 2026) built with C#, .NET Framework, MS SQL, GitHub. Experience 4 (Freelance): Maintenance & Frontend Developer for Bagkuning E-commerce (Next.js, Firebase) and JoyMove Mobile App (2025-present). Projects: Backend Developer for Capstone Online Record Management System for Benedicto College Registrar (React, Tailwind, Node.js, Express, MySQL). Skills: Languages (C, C++, C#, TypeScript). Frontend (HTML, CSS, JS, Tailwind, React.js). Backend (Node.js, Express.js, .NET, Firebase). Databases (MySQL, MS SQL Server). Tools (VS Code, Git, GitHub, Azure DevOps, Postman). Soft Skills (Active Listening, Problem Solving, Adaptability, Agile Mindset). CRITICAL RULE: Answer questions about my portfolio, skills, and experience using ONLY the facts provided above. You are highly encouraged to act as a helpful AI and answer general questions about programming, technology, UI/UX, web development, and coding concepts. If asked about completely unrelated non-tech topics, politely steer the conversation back to tech or my portfolio. FORMATTING RULE: You MUST respond in pure plain text ONLY. DO NOT use any markdown formatting, no asterisks (**), no bullet points, and no bold text. Keep your answers clean, professional, and try to keep them to a single concise paragraph."
            }]
          },
          contents: contents
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }

      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't understand that.";
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: 'model', text: botReply, time: botTime }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: 'model', text: "Oops! Something went wrong connecting to the AI. Please try again later.", time: errTime }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <>
        {/* Updated style block for the left-to-right tilting animation */}
        <style>{`
          @keyframes tilt-icon {
            0%, 100% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
          }
          .animate-tilt-icon {
            animation: tilt-icon 2s ease-in-out infinite;
            transform-origin: center;
          }
        `}</style>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-black dark:bg-white text-white dark:text-black p-3.5 md:px-5 md:py-3 font-semibold text-[14px] flex items-center justify-center gap-2 shadow-xl hover:bg-black dark:hover:bg-slate-200 transition-colors z-50 rounded-none md:rounded-none"
        >
          {/* Updated the className here from animate-float-icon to animate-tilt-icon */}
          <svg className="w-5 h-5 md:w-5 md:h-5 animate-tilt-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <span className="hidden md:inline">Chat with Lourd</span>
        </button>
      </>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 md:right-6 w-[380px] h-[500px] max-h-[80vh] max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-3rem)] bg-white dark:bg-black border border-slate-200 dark:border-[#333] shadow-2xl flex flex-col z-50 rounded-none overflow-hidden font-sans transition-all duration-300 transform origin-bottom-right">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
        .sharp-avatar {
          image-rendering: -webkit-optimize-contrast;
          transform: translateZ(0);
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-100 dark:border-[#333] bg-white dark:bg-black">
        <div className="flex items-center gap-2">
          <div className="relative">
            {/* Using a placeholder for the profile pic, ideally it should match the main profile picture */}
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <img src="/chatbotPic.jpg" alt="Lourd" className="w-full h-full object-cover sharp-avatar" onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1a1c23] rounded-full"></div>
          </div>
          <div className="flex flex-col leading-tight -space-y-0.5">
            <h3 className="font-bold text-[15px] text-black dark:text-white">Chat with Lourd</h3>
            <span className="text-[14px] font-medium text-black dark:text-slate-100 ">Online</span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 flex items-center justify-center text-slate-900 dark:text-white hover:text-black dark:hover:text-white transition-colors bg-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full border border-slate-200 dark:border-[#333]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 px-3 py-5 overflow-y-auto custom-scrollbar bg-white dark:bg-black space-y-5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-3'}`}>
            {msg.role === 'model' && (
              <img src="/chatbotPic.jpg" alt="Lourd" className="w-8 h-8 rounded-full border border-slate-200 dark:border-[#333] object-cover mt-1 shrink-0 sharp-avatar" onError={(e) => { e.target.style.display = 'none' }} />
            )}
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end max-w-[85%]' : 'items-start max-w-[75%]'}`}>
              {msg.role === 'model' && (
                <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200 mb-1 ml-1">Lourd Angelou</span>
              )}
              <div
                className={`px-4 py-3 text-[14px] leading-relaxed break-words ${msg.role === 'user'
                  ? 'bg-[#111] dark:bg-white text-white dark:text-black rounded-2xl rounded-br-none shadow-sm'
                  : 'bg-white dark:bg-black text-black dark:text-white rounded-2xl rounded-tl-none border border-slate-200 dark:border-[#333]/50 shadow-sm'
                  }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-200 mt-1">{msg.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start gap-3">
            <img src="/chatbotPic.jpg" alt="Lourd" className="w-8 h-8 rounded-full border border-slate-200 dark:border-[#333] object-cover mt-1 shrink-0 sharp-avatar" onError={(e) => { e.target.style.display = 'none' }} />
            <div className="flex flex-col items-start max-w-[75%]">
              <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200 mb-1 ml-1">Lourd Angelou</span>
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-[#333]/50 px-4 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-3 py-2 bg-white dark:bg-black border-t border-slate-200 dark:border-[#333]">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 w-10 h-10 bg-white dark:bg-black text-black dark:text-white text-[14px] px-4 py-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-9 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:bg-[#111] dark:hover:bg-slate-200 transition-colors shrink-0"
          >
            <svg className="w-[16px] h-[16px] ml-[-2px] mt-[2px]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>

    </div>
  );
}
