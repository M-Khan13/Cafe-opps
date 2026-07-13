import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'

const STATUS_FLOW = {
  new: 'preparing',
  preparing: 'served',
}

const STATUS_COLORS = {
  new: 'text-blue-400',
  preparing: 'text-yellow-400',
  served: 'text-green-400',
}

function OrderFeed() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchOrders() {
    try {
      const res = await api.get('/orders')
      setOrders(res.data)
    } catch (err) {
      console.error('Failed to load orders', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders() // initial load

    // poll every 5 seconds for new orders
    const interval = setInterval(fetchOrders, 5000)

    // cleanup: stop polling when component unmounts
    return () => clearInterval(interval)
  }, [])

  async function advanceStatus(order) {
    const next = STATUS_FLOW[order.status]
    if (!next) return // already served, nothing to do
    try {
      await api.patch(`/orders/${order._id}`, { status: next })
      fetchOrders() // refresh to show new status
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  if (loading) return <p className="text-zinc-400">Loading orders...</p>
  if (orders.length === 0)
    return <p className="text-zinc-500">No orders yet.</p>

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <div key={order._id} className="rounded-lg border border-zinc-800 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Table {order.tableNumber}</span>
            <span className={`text-xs uppercase ${STATUS_COLORS[order.status]}`}>
              {order.status}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-sm text-zinc-300 mb-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>

          {order.placedBy && (
            <p className="text-xs text-zinc-500 mb-3">
              by {order.placedBy.name}
            </p>
          )}

          {order.status !== 'served' && (
            <Button size="sm" className="w-full" onClick={() => advanceStatus(order)}>
              Mark as {STATUS_FLOW[order.status]}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

export default OrderFeed
