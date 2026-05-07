import { useState } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to analyze text')
      }
    } catch (err) {
      setError('Error connecting to backend. Is it running?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Get dynamic colors based on sentiment
  const getSentimentStyle = (sentiment) => {
    if (!sentiment) return ''
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'sentiment-positive'
      case 'negative': return 'sentiment-negative'
      case 'neutral': return 'sentiment-neutral'
      default: return ''
    }
  }

  return (
    <div className="app-container">
      <div className="glass-panel main-content">
        <header className="header">
          <h1>AI Sentiment Analysis</h1>
          <p>Analyze the emotion behind any review, comment, or social media post using advanced NLP.</p>
        </header>

        <main>
          <div className="input-section">
            <textarea
              className="text-input"
              placeholder="Paste a movie review or a tweet here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
            />
            <button 
              className={`analyze-button ${loading ? 'loading' : ''}`}
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                'Analyze Sentiment'
              )}
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {result && (
            <div className={`result-section ${getSentimentStyle(result.sentiment)}`}>
              <h2>Analysis Result</h2>
              
              <div className="sentiment-card">
                <div className="sentiment-label">
                  {result.sentiment}
                </div>
                
                <div className="confidence-meter">
                  <div className="confidence-label">
                    <span>Confidence</span>
                    <span>{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${result.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </div>
  )
}

export default App
