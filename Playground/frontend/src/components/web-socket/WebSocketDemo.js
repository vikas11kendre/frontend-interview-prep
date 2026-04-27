import React, { useState, useEffect } from 'react';


const WebSocketDemo = () => {
    const [active, setActive] = useState(false);
    useEffect(() => {
          let socket;
           let ping;
        if (active) {
            socket = new WebSocket("ws://localhost:5000");
            socket.addEventListener("open", (event) => {
                 ping=setInterval(()=>{
                socket.send("Hello Server!");

                },3000);
                console.log("connected")
            });
            socket.addEventListener("message", (event) => {
  
                console.log("Message from server ", event.data);
            });
            socket.addEventListener("error", (e) => {
                console.log(`ERROR`);
            });
            socket.addEventListener("close", () => {
                 console.log("DISCONNECTED");
            });

        }
        return () => {
            clearInterval(ping);
            if(socket) socket.close();

            }
    }, [active]);

    return (<>

        <p>this is web socket demo</p>
        <p>Status:{active ? "active" : "close"}</p>
        <button onClick={() => setActive(prev => (!prev))}>togle</button>
    </>)
};

export default WebSocketDemo;