import '../styles/App.css'
import Welcome from './Welcome'

function App() {
  return (
    <>
      <div className="app-container">
        <header className="app-header">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
          <h1>React Skeleton Application</h1>
          <p className="subtitle">Built with Vite + React + TypeScript</p>
        </header>

        <main className="app-main">
          <Welcome message="Welcome to your new React application!" />

          <div className="info-card">
            <h2>Ready to Build</h2>
            <p>
              This skeleton application is ready for you to add components,
              routes, and functionality. Use AI-assisted development tools
              to rapidly build your application.
            </p>
          </div>

          <div className="getting-started">
            <h3>Getting Started</h3>
            <ul>
              <li>Edit <code>src/components/App.tsx</code> to modify this page</li>
              <li>Create new components in <code>src/components/</code></li>
              <li>Add styles in <code>src/styles/</code></li>
              <li>Hot module replacement (HMR) is enabled for instant updates</li>
            </ul>
          </div>
        </main>

        <footer className="app-footer">
          <p>Edit components to see changes instantly with HMR</p>
        </footer>
      </div>
    </>
  )
}

export default App
