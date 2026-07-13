import { useState, useEffect } from 'react'
import api from '@/lib/api'

function StaffMenu() {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await api.get('/menu')
        setMenu(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold mb-1">Menu</h1>
      <p className="text-muted mb-8">Today's offerings and availability.</p>

      {loading ? (
        <p className="text-muted">Loading menu...</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {menu.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-border-warm bg-surface p-4 flex justify-between items-start"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-muted mb-1">{item.category}</p>
                <p className="font-medium">{item.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-amber">₹{item.price}</p>
                <p className={`text-xs mt-1 ${item.available ? 'text-status-served' : 'text-danger'}`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StaffMenu
