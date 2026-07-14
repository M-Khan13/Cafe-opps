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
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
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

  async function fetchStaff() {
    try {
      const res = await api.get('/auth/staff')
      setStaff(res.data)
    } catch (err) {
      console.error('Failed to load staff', err)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchStaff()
  }, [])

  function staffName(id) {
    const s = staff.find((s) => s._id === id)
    return s ? s.name : '—'
  }

  async function handleAssign() {
    if (!title || !assignedTo) return
    setAssigning(true)
    try {
      await api.post('/tasks', { title, assignedTo })
      setTitle('')
      setAssignedTo('')
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
      setProposals(res.data.tasks.map((t) => ({ ...t, assignedTo: '' })))
    } catch (err) {
      console.error('Failed to generate tasks', err)
    } finally {
      setGenerating(false)
    }
  }

  function setProposalStaff(index, staffId) {
    setProposals((prev) =>
      prev.map((p, i) => (i === index ? { ...p, assignedTo: staffId } : p))
    )
  }

  async function handleApprove() {
    const ready = proposals.filter((p) => p.assignedTo)
    try {
      for (const p of ready) {
        await api.post('/tasks', {
          title: p.title,
          assignedTo: p.assignedTo,
          suggestedRole: p.suggestedRole,
        })
      }
      setProposals([])
      setGoal('')
      fetchTasks()
    } catch (err) {
      console.error('Failed to save tasks', err)
    }
  }

  const readyCount = proposals.filter((p) => p.assignedTo).length

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
                <Label>Assign to</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select staff member">
                      {assignedTo ? staffName(assignedTo) : 'Select staff member'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}{s.jobTitle ? ` · ${s.jobTitle}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAssign}
                disabled={assigning || !title || !assignedTo}
                className="w-fit bg-amber text-espresso hover:bg-amber-dark"
              >
                {assigning ? 'Assigning...' : 'Assign task'}
              </Button>
            </div>
          </div>

          {/* AI */}
          <div className="rounded-xl border border-amber/40 bg-surface p-5 shadow-[0_0_30px_-12px_rgba(224,167,62,0.4)]">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-amber" />
              <p className="font-medium">Generate tasks with AI</p>
            </div>
            <p className="text-xs text-muted mb-4">Describe a goal, then assign each proposed task to someone.</p>
            <div className="flex flex-col gap-3">
              <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Prep for Saturday morning rush" />
              <Button onClick={handleGenerate} disabled={generating} variant="outline" className="w-fit border-amber/50 text-amber hover:bg-amber/10">
                {generating ? 'Generating...' : 'Generate'}
              </Button>
            </div>

            {proposals.length > 0 && (
              <div className="mt-5 flex flex-col gap-2">
                <p className="text-sm text-muted">Assign each task, then save:</p>
                {proposals.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border-warm p-3">
                    <span className="flex-1 text-sm">{p.title}</span>
                    <Select value={p.assignedTo} onValueChange={(v) => setProposalStaff(i, v)}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Assign to…">
                          {p.assignedTo ? staffName(p.assignedTo) : 'Assign to…'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((s) => (
                          <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <Button
                  onClick={handleApprove}
                  disabled={readyCount === 0}
                  className="w-fit mt-2 bg-amber text-espresso hover:bg-amber-dark"
                >
                  Approve &amp; save ({readyCount})
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
                    <span>{staffName(task.assignedTo)}</span>
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