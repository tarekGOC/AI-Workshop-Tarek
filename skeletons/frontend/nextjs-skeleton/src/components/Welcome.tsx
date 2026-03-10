"use client";

import { useState } from "react";
import styles from "./Welcome.module.css";

interface WelcomeProps {
  message: string;
}

export default function Welcome({ message }: WelcomeProps) {
  const [count, setCount] = useState(0);

  return (
    <div className={styles.card}>
      <h2>{message}</h2>
      <div className={styles.counterSection}>
        <p>This is a sample interactive component demonstrating React hooks.</p>
        <button
          className={styles.counterButton}
          onClick={() => setCount((c) => c + 1)}
        >
          You clicked {count} {count === 1 ? "time" : "times"}
        </button>
        {count > 0 && (
          <p className={styles.counterMessage}>
            {count >= 10
              ? "Wow, you really like clicking!"
              : "Keep clicking..."}
          </p>
        )}
      </div>
    </div>
  );
}
