import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import api from '@/lib/api'

function StaffDashboard() {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await api.get('/menu')
        setMenu(res.data)
      } catch (err) {
        setError('Could not load menu.')
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Menu</h1>

      {loading && <p className="text-zinc-400">Loading menu...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {menu.map((item) => (
            <div
              key={item._id}
              className="rounded-lg border border-zinc-800 p-4 flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-zinc-400">{item.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{item.price}</p>
                <p className={`text-xs ${item.available ? 'text-green-500' : 'text-red-500'}`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default StaffDashboard