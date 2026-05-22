import { useEffect, useState } from "react"
import axios from "axios"

const API_BASE = "http://127.0.0.1:8000/api"

export default function App() {
  const [tasks, setTasks] = useState([])
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I can create, complete, and delete tasks for you." }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const loadTasks = async () => {
    const res = await axios.get(`${API_BASE}/tasks/`)
    setTasks(res.data)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const res = await axios.post(`${API_BASE}/agent/chat/`, {
        message: input,
      })

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ])

      if (res.data.tasks) {
        setTasks(res.data.tasks)
      } else {
        await loadTasks()
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ])
    } finally {
      setInput("")
      setLoading(false)
    }
  }

  const toggleComplete = async (task) => {
    await axios.patch(`${API_BASE}/tasks/${task.id}/`, {
      completed: !task.completed,
    })
    await loadTasks()
  }

  const deleteTask = async (taskId) => {
    await axios.delete(`${API_BASE}/tasks/${taskId}/`)
    await loadTasks()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl">
          <h1 className="text-3xl font-bold mb-2">AI Task Agent</h1>
          <p className="text-slate-400 mb-6">
            Talk to the agent and it will manage your tasks.
          </p>

          <form onSubmit={sendMessage} className="flex gap-2 mb-6">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Try: "Add buy milk" or "Mark task 1 done"'
              className="flex-1 rounded-xl bg-slate-800 px-4 py-3 outline-none border border-slate-700"
            />
            <button
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-4 py-3 font-semibold disabled:opacity-50"
            >
              {loading ? "..." : "Send"}
            </button>
          </form>

          <div className="space-y-3 max-h-[65dvh] overflow-y-scroll">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-3 ${
                  msg.role === "user" ? "bg-slate-800" : "bg-slate-700"
                }`}
              >
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {msg.role}
                </span>
                <p className="mt-1">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-1">Tasks</h2>
          <span className="text-xs font-thin text-gray-300">📜 Note: The task ID continues even if previous tasks are deleted.</span>
          {/* <span>Please note that the task ID continues even if you delete previous tasks.</span> */}

          <div className="space-y-3 max-h-[75dvh] overflow-y-scroll mt-5">
            {tasks.length === 0 ? (
              <p className="text-slate-400">No tasks yet.</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-800 p-4"
                >
                  <div>
                    <div className={`font-medium ${task.completed ? "line-through text-slate-400" : ""}`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-slate-500">Task #{task.id}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleComplete(task)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm"
                    >
                      {task.completed ? "Undo" : "Done"}
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}