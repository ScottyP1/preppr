"use client";

import { useState, useRef, useEffect } from "react";
import { FaRobot } from "react-icons/fa";
import { PiChefHat } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa";
import { BsSend } from "react-icons/bs";



const Chat = ({ author = "user" }) => {
    const wsRef = useRef();
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([{
        id: 0, author: "bot", img: FaRobot, text: "Welcome!"
    }]);

    useEffect(() => {
        // Open connection
        wsRef.current = new WebSocket('ws://localhost:8000/ws/chat/');
          // Register event handlers
          wsRef.current.onopen = () => {
            setConnected(true);
            console.log('WebSocket connected');
          };
          wsRef.current.onmessage = (event) => {
              const data  = JSON.parse(event.data);
              const nextId = messages[messages.length-1].id + 1;
              console.log(messages[messages.length-1].id )
            const message = data["author"] == "chef" ?
                { id: nextId, author: "chef", img: PiChefHat, text: data.message.trim() } :
                { id: nextId, author: "user", img: FaRegUser, text: data.message.trim() }
              messages.push(message)
              setMessages([...messages]);
             
          };
          wsRef.current.onclose = () => {
            setConnected(false);
            console.log('WebSocket closed');
          };
          wsRef.current.onerror = (err) => {
            console.error('WebSocket error', err);
          };
          // Cleanup on unmount
          return () => {
            wsRef.current?.close();
          };
    }, []);

    // Send only when ready
    const sendMessage = (e) => {
        e.preventDefault();
        if (!draft.trim()) return;
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ author: author, message: draft.trim() }));
        } else {
            console.warn('Cannot send, socket not open');
        }

        setDraft("");
    };

    const [draft, setDraft] = useState("")
    // Get current instance of container including properties
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages])

    

    return (
        <div className="flex flex-col rounded-2xl w-80 h-96 border shadow-lg overflow-hidden">
            <div className="flex items-center justify-center px-4 py-2">
                <h2 className="text-lg font-semibold center">Live Chat</h2>
            </div>
            <div ref={scrollRef} className="flex-1 px-4 gap-6 bg-white/30 overflow-y-scroll scroll-auto space-y-2 touch-pan-y">
                {messages.map((msg, idx) => (
                <div key={msg.id} className="flex flex-row">
                    {/* {msg.img === FaRegUser ? <FaRegUser /> : <PiChefHat />} */}
                    <div
                        key={msg.id}
                        className={`max-w-[80%] px-3 py-2 rounded-2xl wrap-break-word
                            ${msg.author === "chef" ?
                            "self-start bg-green-500 text-black" :
                            "self-end bg-green-100 text-black"
                            }`}
                        > {msg.img === FaRegUser ? <FaRegUser /> : <PiChefHat />} {msg.text}
                    </div>
                </div>
                ))}
            </div>
            <form onSubmit={sendMessage}  className="flex flex-row items-center border-t px-2 py-1">
                <input
                    type="text"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Type Message Here..."
                    className="flex-1 px-2 py-2 w-sm border focus:outline-none"
                    />
                <button
                    type="submit"
                    className="px-4 py-2 text-black"
                >{<BsSend />}</button>
            </form> 

        </div>
    )
}

export default Chat;


