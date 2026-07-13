import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function TaskBoard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  // manual assign form
  const [title, setTitle] = useState('')
  const [role, setRole] = useState('staff')
  const [assigning, setAssigning] = useState(false)

  // AI generate flow
  const [goal, setGoal] = useState('')
  const [generating, setGenerating] = useState(false)
  const [proposals, setProposals] = useState([]) // [{title, suggestedRole, approved}]

  async function fetchTasks() {
    try {
      const res = await api.get('/tasks')
      setTasks(res.data)
    } catch (err) {
      console.error('Failed to load tasks', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  async function handleAssign() {
    if (!title) return
    setAssigning(true)
    try {
      await api.post('/tasks', { title, suggestedRole: role })
      setTitle('')
      setRole('staff')
      fetchTasks()
    } catch (err) {
      console.error('Failed to assign task', err)
    } finally {
      setAssigning(false)
    }
  }

  async function handleGenerate() {
    if (!goal) return
    setGenerating(true)
    setProposals([])
    try {
      const res = await api.post('/tasks/generate', { goal })
      // mark each proposal approved by default so admin can uncheck
      const withApproval = res.data.tasks.map((t) => ({ ...t, approved: true }))
      setProposals(withApproval)
    } catch (err) {
      console.error('Failed to generate tasks', err)
    } finally {
      setGenerating(false)
    }
  }

  function toggleProposal(index) {
    setProposals((prev) =>
      prev.map((p, i) => (i === index ? { ...p, approved: !p.approved } : p))
    )
  }

  async function handleApprove() {
    const approved = proposals.filter((p) => p.approved)
    try {
      // save each approved proposal
      for (const p of approved) {
        await api.post('/tasks', { title: p.title, suggestedRole: p.suggestedRole })
      }
      setProposals([])
      setGoal('')
      fetchTasks()
    } catch (err) {
      console.error('Failed to save tasks', err)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* LEFT: create tasks (manual + AI) */}
      <div className="flex flex-col gap-6">
        {/* Manual assign */}
        <div className="rounded-lg border border-zinc-800 p-4">
          <p className="font-medium mb-3">Assign a task</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="task-title">Task</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Restock napkins at counter"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>For role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssign} disabled={assigning} className="w-fit">
              {assigning ? 'Assigning...' : 'Assign task'}
            </Button>
          </div>
        </div>

        {/* AI generate */}
        <div className="rounded-lg border border-zinc-800 p-4">
          <p className="font-medium mb-1">Generate tasks with AI</p>
          <p className="text-xs text-zinc-500 mb-3">
            Describe a goal and let AI propose a task list to review.
          </p>
          <div className="flex flex-col gap-3">
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Prep for Saturday morning rush"
            />
            <Button
              onClick={handleGenerate}
              disabled={generating}
              variant="outline"
              className="w-fit"
            >
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>

          {/* Proposals review */}
          {proposals.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm text-zinc-400">Review proposals:</p>
              {proposals.map((p, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 rounded-md border border-zinc-800 p-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={p.approved}
                    onChange={() => toggleProposal(i)}
                  />
                  <span className="flex-1 text-sm">{p.title}</span>
                  <span className="text-xs text-zinc-500 uppercase">{p.suggestedRole}</span>
                </label>
              ))}
              <Button onClick={handleApprove} className="w-fit mt-2">
                Approve & save ({proposals.filter((p) => p.approved).length})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: existing tasks */}
      <div>
        <p className="font-medium mb-3">All tasks</p>
        {loading ? (
          <p className="text-zinc-400">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-zinc-500">No tasks yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="rounded-lg border border-zinc-800 p-3 flex justify-between items-center"
              >
                <span
                  className={`text-sm ${task.status === 'done' ? 'line-through text-zinc-500' : ''}`}
                >
                  {task.title}
                </span>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  {task.suggestedRole && <span className="uppercase">{task.suggestedRole}</span>}
                  <span className="uppercase">{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskBoard
