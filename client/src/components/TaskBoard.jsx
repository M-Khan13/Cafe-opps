import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles } from 'lucide-react'
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
  const [title, setTitle] = useState('')
  const [role, setRole] = useState('staff')
  const [assigning, setAssigning] = useState(false)
  const [goal, setGoal] = useState('')
  const [generating, setGenerating] = useState(false)
  const [proposals, setProposals] = useState([])

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
      setProposals(res.data.tasks.map((t) => ({ ...t, approved: true })))
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
    <div>
      <h1 className="font-serif text-4xl font-semibold mb-1">Tasks</h1>
      <p className="text-muted mb-8">Assign work manually or let AI draft a list.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: create */}
        <div className="flex flex-col gap-6">
          {/* Manual */}
          <div className="rounded-xl border border-border-warm bg-surface p-5">
            <p className="font-medium mb-4">Assign a task</p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-title">Task</Label>
                <Input
                  id="task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Restock napkins at counter"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>For role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssign} disabled={assigning} className="w-fit bg-amber text-espresso hover:bg-amber-dark">
                {assigning ? 'Assigning...' : 'Assign task'}
              </Button>
            </div>
          </div>

          {/* AI — special treatment */}
          <div className="rounded-xl border border-amber/40 bg-surface p-5 shadow-[0_0_30px_-12px_rgba(224,167,62,0.4)]">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-amber" />
              <p className="font-medium">Generate tasks with AI</p>
            </div>
            <p className="text-xs text-muted mb-4">Describe a goal and let AI propose a task list to review.</p>
            <div className="flex flex-col gap-3">
              <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Prep for Saturday morning rush" />
              <Button onClick={handleGenerate} disabled={generating} variant="outline" className="w-fit border-amber/50 text-amber hover:bg-amber/10">
                {generating ? 'Generating...' : 'Generate'}
              </Button>
            </div>

            {proposals.length > 0 && (
              <div className="mt-5 flex flex-col gap-2">
                <p className="text-sm text-muted">Review proposals:</p>
                {proposals.map((p, i) => (
                  <label key={i} className="flex items-center gap-3 rounded-lg border border-border-warm p-3 cursor-pointer hover:border-muted transition">
                    <input type="checkbox" checked={p.approved} onChange={() => toggleProposal(i)} className="accent-amber" />
                    <span className="flex-1 text-sm">{p.title}</span>
                    <span className="text-xs text-muted uppercase">{p.suggestedRole}</span>
                  </label>
                ))}
                <Button onClick={handleApprove} className="w-fit mt-2 bg-amber text-espresso hover:bg-amber-dark">
                  Approve & save ({proposals.filter((p) => p.approved).length})
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: all tasks */}
        <div>
          <p className="font-medium mb-4">All tasks</p>
          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : tasks.length === 0 ? (
            <p className="text-muted">No tasks yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <div key={task._id} className="rounded-xl border border-border-warm bg-surface p-4 flex justify-between items-center">
                  <span className={`text-sm ${task.status === 'done' ? 'line-through text-muted' : ''}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    {task.suggestedRole && <span className="uppercase">{task.suggestedRole}</span>}
                    <span className="uppercase">{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskBoard