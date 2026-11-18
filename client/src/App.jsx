
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [sender, setSender] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [dashboard, setDashboard] = useState(null)

  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setDashboardLoading(true)

    try {
      const response = await fetch(
        'http://localhost:5000/api/dashboard'
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Dashboard loading failed')
      }

      setDashboard(data)

    } catch (error) {
      console.error('Dashboard Error:', error)
      setDashboard(null)

    } finally {
      setDashboardLoading(false)
    }
  }

  async function analyzeEmail(e) {
    e.preventDefault()
    setResult(null)
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sender, subject, message })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Email analysis failed')
        return
      }

      setResult({
        classification: data.classification,
        detected: data.detectedPatterns,
        finalState: data.finalState
      })

      await loadDashboard()

      if (showHistory) {
        await loadHistory()
      }

    } catch (error) {
      console.error(error)
      alert('Cannot connect to backend')

    } finally {
      setLoading(false)
    }
  }

  async function loadHistory() {
    setHistoryLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/history')
      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Unable to load history')
        return
      }

      setHistory(data.emails)

    } catch (error) {
      console.error(error)
      alert('Cannot load email history')

    } finally {
      setHistoryLoading(false)
    }
  }

  async function toggleHistory() {
    if (!showHistory) {
      setShowHistory(true)
      await loadHistory()
    } else {
      setShowHistory(false)
    }
  }

  function resetForm() {
    setSender('')
    setSubject('')
    setMessage('')
    setResult(null)
  }

  return (
    <div className="app">

      <header className="header">
        <h2>🛡️ MailGuard</h2>
        <span>Email Security System</span>
      </header>

      <main className="container">

        <section className="intro">
          <p className="tag">EMAIL PROTECTION SYSTEM</p>
          <h1>Detect Spam. Stay Secure.</h1>
          <p>Analyze your emails and identify suspicious patterns.</p>
        </section>

        {/* Dashboard Section */}

        <section className="dashboard">

          <h2>📊 Dashboard Overview</h2>

          {dashboardLoading ? (
            <p>Loading dashboard statistics...</p>
          ) : dashboard ? (

            <>
              <div className="dashboard-grid">

                <div className="dashboard-card total">
                  <h3>Total Emails Analyzed</h3>
                  <h1>{dashboard.totalEmails}</h1>
                </div>

                <div className="dashboard-card safe-card">
                  <h3>Safe Emails</h3>
                  <h1>{dashboard.safeEmails}</h1>
                </div>

                <div className="dashboard-card suspicious-card">
                  <h3>Suspicious Emails</h3>
                  <h1>{dashboard.suspiciousEmails}</h1>
                </div>

                <div className="dashboard-card spam-card">
                  <h3>Spam Emails</h3>
                  <h1>{dashboard.spamEmails}</h1>
                </div>

              </div>

              <div className="spam-percentage">
                <h3>Spam Detection Percentage</h3>

                <p className="percentage-value">
                  {dashboard.spamPercentage}%
                </p>
              </div>
            </>

          ) : (
            <p>Unable to load dashboard. Please check your backend.</p>
          )}

        </section>

        {/* Email Analysis Form */}

        <section className="form-card">
          <h2>Analyze Your Email</h2>
          <p>Enter the email details below.</p>

          <form onSubmit={analyzeEmail}>

            <label>Sender Email Address</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={sender}
              onChange={e => setSender(e.target.value)}
              required
            />

            <label>Email Subject</label>
            <input
              type="text"
              placeholder="Enter email subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />

            <label>Email Message</label>
            <textarea
              placeholder="Enter email message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows="6"
              required
            />

            <div className="buttons">

              <button type="submit" disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Email'}
              </button>

              <button
                type="button"
                className="reset"
                onClick={resetForm}
              >
                Clear
              </button>

            </div>

          </form>
        </section>

        {/* Analysis Result */}

        {result && (
          <section className="result-card">

            <h2>Analysis Result</h2>

            <h1 className={result.classification.toLowerCase()}>
              {result.classification}
            </h1>

            <p>
              {result.detected.length > 0
                ? 'Suspicious patterns detected:'
                : 'No matching spam keywords detected.'}
            </p>

            {result.detected.map((word, index) => (
              <span className="keyword" key={index}>
                {word}
              </span>
            ))}

            <p>
              DFA Final State: <strong>{result.finalState}</strong>
            </p>

          </section>
        )}

        {/* Email History */}

        <section className="form-card">

          <h2>Email History</h2>
          <p>View previously analyzed emails.</p>

          <button type="button" onClick={toggleHistory}>
            {showHistory ? 'Hide History' : 'View Email History'}
          </button>

          {showHistory && (
            <div className="history-list">

              {historyLoading ? (
                <p>Loading email history...</p>

              ) : history.length === 0 ? (
                <p>No email history found.</p>

              ) : (

                history.map(email => (
                  <div className="history-item" key={email._id}>

                    <h3>{email.subject}</h3>

                    <p>
                      <strong>Sender:</strong> {email.sender}
                    </p>

                    <p>
                      <strong>Message:</strong> {email.message}
                    </p>

                    <p>
                      <strong>Classification:</strong>{' '}
                      <span className={email.classification.toLowerCase()}>
                        {email.classification}
                      </span>
                    </p>

                    <p>
                      <strong>DFA State:</strong> {email.finalState}
                    </p>

                    <p>
                      <strong>Detected:</strong>{' '}
                      {email.detectedPatterns.length > 0
                        ? email.detectedPatterns.join(', ')
                        : 'None'}
                    </p>

                    <small>
                      {new Date(email.createdAt).toLocaleString()}
                    </small>

                  </div>
                ))

              )}

            </div>
          )}

        </section>

      </main>

      <footer>
        MailGuard © 2026 | Email Security and Spam Pattern Detection
      </footer>

    </div>
  )
}

export default App
