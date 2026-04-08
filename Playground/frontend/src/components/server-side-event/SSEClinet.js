import React,{useEffect,useState} from "react";
const SSEClinet=()=>{
    const [messages,setMessages]=useState([]);
    useEffect(()=>{
        const source= new EventSource("http://localhost:5000/api/v1/playground/sse");
        source.onmessage=(e)=>{console.log("message",e)};
        source.onerror=(e)=>{
            console.error("failed",e)
        };
        return ()=> source.close();
    },[])

    return( <div>
      <h2>SSE Client</h2>
      {messages.map((msg, i) => (
        <p key={i}>{msg.message} — {msg.time}</p>
      ))}
    </div>)
}
export default SSEClinet;