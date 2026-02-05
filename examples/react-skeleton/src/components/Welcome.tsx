import { useState } from 'react'

interface WelcomeProps {
  message: string
}

function Welcome({ message }: WelcomeProps) {
  const [count, setCount] = useState(0)

  return (
    <div className="welcome-card">
      <h2>{message}</h2>
      <div className="counter-section">
        <p>This is a sample interactive component demonstrating React hooks.</p>
        <button
          className="counter-button"
          onClick={() => setCount((count) => count + 1)}
        >
          You clicked {count} {count === 1 ? 'time' : 'times'}
        </button>
        {count > 0 && (
          <p className="counter-message">
            {count >= 10
              ? "Wow, you really like clicking!"
              : "Keep clicking to see what happens!"}
          </p>
        )}
      </div>
    </div>
  )
}

export default Welcome
