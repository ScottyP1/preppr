"use client";

import { useState, useRef, useEffect } from "react";
import { FaRobot } from "react-icons/fa";
import { PiChefHat } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa";
import { BsSend } from "react-icons/bs";
import { WebSocket } from "vite";


const Chat = ({author="user"}) => {
    // const webSocket = new WebSocket("ws://"+ location.hostname+":8000"+"/ws/chat/");
    const webSocket = new WebSocket("ws://localhost:8000/ws/chat/");
    
    webSocket.onmessage = e => {
        const data = JSON.parse(e.data);
        console.log("Got message", data);
        };
    webSocket.onopen = () => console.log("WebSocket connected");

    const [messages, setMessages] = useState([{
        id: 1, author: "bot", img: FaRobot, text: "Welcome!"
    }]);

    const [draft, setDraft] = useState("")
    // get current instance of container including properties
    const scrollRef = useRef(null);

    // auto-scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages])

    const sendMessage = (e) => {
        e.preventDefault();
        if (!draft.trim()) return;
        console.log(author);
        console.log(draft.trim())
        
        webSocket.send(JSON.stringify({ author: author, message: draft.trim() }));

        const nextId = messages.length + 1;
    

        setMessages([
            ...messages,
            messages.author == "chef" ?
                { id: nextId, author: "chef", img: PiChefHat, text: draft.trim() } :
                { id: nextId, author: "user", img: FaRegUser, text: draft.trim() }
        ]);

        setDraft("");
    }

    

    return (
        <div className="flex flex-col w-80 h-96 border shadow-lg overflow-hidden">
            <div className="flex items-center px-4 py-2">
                <h2 className="text-lg font-semibold">Live Chat</h2>
            </div>
            <div ref={scrollRef} className="flex-1 px-4 overflow-y-auto, space-y-2">
                {messages.img}
                {messages.map((msg, idx) => (
                <div
                    key={msg.id}
                    className={`max-w-[80%] px-3 py-2
                        ${msg.author === "chef" ?
                        "self-start bg-green-500 text-black" :
                        "self-end bg-green-100 text-black"
                        }`}
                > {msg.text}
                </div>
                ))}
            </div>
            <form onSubmit={sendMessage}  className="flex flex-row items-center border-t px-2 py-1">
                <input
                    type="text"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Type Message Here..."
                    className="flex-1 px-2 py-2 border focus:outline-none"
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