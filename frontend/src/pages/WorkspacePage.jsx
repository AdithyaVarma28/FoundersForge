import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { SectionIntro } from '../components/UiBlocks'
import { apiFetch, getAuthToken } from '../utils/api'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080'

function WorkspacePage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const [projectData, messagesData] = await Promise.all([
          apiFetch(`/projects/${id}`),
          apiFetch(`/messages/projects/${id}`)
        ])
        setProject(projectData.project)
        setMessages(messagesData.messages || [])

        // Initialize socket
        const token = getAuthToken()
        const socket = io(SOCKET_URL, {
          auth: { token }
        })
        
        socketRef.current = socket

        socket.on('connect', () => {
          socket.emit('project:join', { projectId: id }, (response) => {
            if (!response.success) {
              console.error('Failed to join room:', response.message)
            }
          })
        })

        socket.on('project:message', (newMessage) => {
          setMessages((prev) => [...prev, newMessage])
        })

      } catch (err) {
        setError(err.message || 'Failed to load workspace')
      } finally {
        setLoading(false)
      }
    }

    loadWorkspace()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [id])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || !socketRef.current) return

    socketRef.current.emit('project:message', { projectId: id, content: inputMessage }, (response) => {
      if (!response.success) {
        alert('Failed to send message: ' + response.message)
      }
    })
    setInputMessage('')
  }

  if (loading) return <div className="page"><p>Loading workspace...</p></div>
  if (error) return <div className="page"><p className="form-error">{error}</p></div>
  if (!project) return <div className="page"><p>Project not found.</p></div>

  const milestones = Array.isArray(project.objectives) && project.objectives.length > 0 
    ? project.objectives 
    : ['Define project scope', 'Build MVP', 'Seek funding']

  return (
    <div className="page">
      <section className="page-hero split-section">
        <div>
          <SectionIntro
            eyebrow="Workspace"
            title={`Workspace for ${project.title}`}
            description="Collaborate in real-time with your team members and keep investors updated on milestones."
          />
          <div className="info-strip">
            <strong>Project ID:</strong> {id}
          </div>

          <div className="glass-panel stacked-panel">
            <div className="panel-kicker">Current milestone lane</div>
            <ul className="stack-list">
              {milestones.map((milestone, idx) => (
                <li key={idx}>{milestone}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Funding pulse</div>
          <div className="funding-meter">
            <span>Funding Goal</span>
            <strong>₹{project.fundingGoal?.toLocaleString() || 0}</strong>
          </div>
          <p className="muted-copy">
            Investors can monitor progress while founders keep everyone aligned on outcomes,
            blockers, and delivery targets.
          </p>
        </aside>
      </section>

      <section className="content-section split-section">
        <div className="glass-panel stacked-panel" style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
          <div className="panel-kicker">Project room</div>
          <div className="chat-log" style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '1rem' }}>
            {messages.map((message) => (
              <div className="chat-bubble" key={message._id}>
                <strong>{message.sender?.fullName || 'User'}: </strong>
                {message.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage}>
            <label>
              Send an update
              <input 
                placeholder="Share a milestone, question, or project note" 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
            </label>
            <button type="submit" style={{ display: 'none' }}>Send</button>
          </form>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Participants</div>
          <ul className="stack-list">
            {project.members && project.members.map((member) => (
              <li key={member.user?._id}>
                <strong>{member.role}:</strong> {member.user?.fullName}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  )
}

export default WorkspacePage
