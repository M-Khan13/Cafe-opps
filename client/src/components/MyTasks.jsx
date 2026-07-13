import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'

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
      fetchTasks() // refresh
    } catch (err) {
      console.error('Failed to update task', err)
    }
  }

  if (loading) return <p className="text-zinc-400">Loading tasks...</p>
  if (tasks.length === 0)
    return <p className="text-zinc-500">No tasks assigned to you.</p>

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="rounded-lg border border-zinc-800 p-4 flex justify-between items-center"
        >
          <div>
            <p className={`font-medium ${task.status === 'done' ? 'line-through text-zinc-500' : ''}`}>
              {task.title}
            </p>
            <p className="text-xs text-zinc-500 mt-1 uppercase">{task.status}</p>
          </div>
          {task.status !== 'done' && (
            <Button size="sm" variant="outline" onClick={() => markDone(task._id)}>
              Mark done
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

export default MyTasks
