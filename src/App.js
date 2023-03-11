import React, { useState, useRef } from "react";
import styles from "./App.module.css";
import { Send } from "react-feather";

import aiIcon from "./aiIcon.png";
import user from "./user.png";

function App() {
  const SECRET_KEY = process.env.REACT_APP_OSI_KEY;
  console.log(SECRET_KEY);
  const [inputMsg, setInputMsg] = useState(" ");
  const [processing, setProcessing] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: " I am an AI created by OpenAI. How can I help you today?",
    },
  ]);
  const lastMsg = useRef();
  const fetchDetails = async () => {
    if (!inputMsg.trim() || processing) return;

    const reqUrl = "https://api.openai.com/v1/completions";

    const tempMsg = [...messages, { from: "user", text: inputMsg }];
    setMessages(tempMsg);
    setInputMsg("");

    const reqPrompt =
      "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n" +
      tempMsg
        .slice(-6)
        .map((msg) => `${msg.from === "ai" ? "\nAI:" : "\nHuman:"} ${msg.text}`)
        .join("\n") +
      "\nAI:";
    // console.log(reqPrompt);

    try {
      setProcessing(true);
      setTimeout(() => {
        lastMsg.current.scrollIntoView({ behavior: "smooth" });
      });
      const res = await fetch(reqUrl, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${SECRET_KEY}`,
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: reqPrompt,
          max_tokens: 200,
          temperature: 0.5,
        }),
      });
      const data = await res.json();
      setProcessing(false);

      if (!Array.isArray(data.choices)) return;
      const ans = data?.choices[0]?.text;

      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: ans.trim(),
        },
      ]);
      setTimeout(() => {
        lastMsg.current.scrollIntoView({ behavior: "smooth" });
      });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: "Error in processing",
        },
      ]);
    }
  };
  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <img src={aiIcon} alt="AI" />
        </div>
        <div className={styles.title}>Ai ChatBox</div>
      </div>
      <div className={styles.body}>
        {messages.map((msgs, index) => (
          <div
            key={index}
            className={`${styles.msgs} ${
              msgs.from === "ai" ? styles.aiMsg : styles.userMsg
            }`}
          >
            <div className={styles.icon}>
              <img src={`${msgs.from === "ai" ? aiIcon : user}`} alt="AI" />
            </div>
            <div className={styles.text}>{msgs.text}</div>
          </div>
        ))}

        {processing ? (
          <div className={styles.loading}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        ) : (
          ""
        )}
        <div ref={lastMsg} />
      </div>
      <div className={styles.footer}>
        <input
          type="text"
          placeholder="Type here..."
          value={inputMsg || ""}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyUp={(e) => (e.key === "Enter" ? fetchDetails() : "")}
        />
        <div className={styles.btn} onClick={fetchDetails}>
          <div className={styles.icon}>
            <Send />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
