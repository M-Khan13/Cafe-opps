import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchTasks() {
    try {
      const res = await api.get('/tasks/mine')
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

  async function markDone(id) {
    try {
      await api.patch(`/tasks/${id}`, { status: 'done' })
      fetchTasks()
    } catch (err) {
      console.error('Failed to update task', err)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold mb-1">My Tasks</h1>
      <p className="text-muted mb-8">Your assigned work for the shift.</p>

      {loading ? (
        <p className="text-muted">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="h-8 w-8 text-muted/50 mb-3" />
          <p className="text-muted">No tasks assigned to you.</p>
          <p className="text-xs text-muted/60">You're all caught up.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="rounded-xl border border-border-warm bg-surface p-4 flex justify-between items-center"
            >
              <div>
                <p className={`font-medium ${task.status === 'done' ? 'line-through text-muted' : ''}`}>
                  {task.title}
                </p>
                <p className="text-xs uppercase tracking-wide text-muted mt-1">{task.status}</p>
              </div>
              {task.status !== 'done' && (
                <Button size="sm" variant="outline" onClick={() => markDone(task._id)}>
                  Mark done
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyTasks