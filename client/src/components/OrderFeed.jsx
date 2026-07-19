import { useState, useEffect } from 'react'
import api from '@/lib/api'
import socket from '@/lib/socket'
import { Button } from '@/components/ui/button'

const STATUS_FLOW = {
  new: 'preparing',
  preparing: 'served',
}

const COLUMNS = [
  { key: 'new', label: 'New', color: 'text-status-new', dot: 'bg-status-new' },
  { key: 'preparing', label: 'Preparing', color: 'text-status-preparing', dot: 'bg-status-preparing' },
  { key: 'served', label: 'Served', color: 'text-status-served', dot: 'bg-status-served' },
]

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
    // initial load (still need the current list on mount)
    fetchOrders()

    // real-time: a brand-new order arrives → add it to the top
    function handleNew(order) {
      setOrders((prev) => [order, ...prev])
    }

    // real-time: an existing order's status changed → replace it
    function handleUpdate(updated) {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      )
    }

    socket.on('order:new', handleNew)
    socket.on('order:update', handleUpdate)

    // cleanup: remove listeners when component unmounts
    return () => {
      socket.off('order:new', handleNew)
      socket.off('order:update', handleUpdate)
    }
  }, [])

  async function advanceStatus(order) {
    const next = STATUS_FLOW[order.status]
    if (!next) return
    try {
      await api.patch(`/orders/${order._id}`, { status: next })
      // no manual refresh needed — the server emits 'order:update'
      // and our listener updates state automatically
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-4xl font-semibold">Orders</h1>
        <span className="flex items-center gap-2 text-sm text-muted">
          <span className="h-2 w-2 rounded-full bg-status-served animate-pulse" />
          Live
        </span>
      </div>
      <p className="text-muted mb-8">Orders flow left to right as they're prepared.</p>

      {loading ? (
        <p className="text-muted">Loading orders...</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.key)
            return (
              <div key={col.key}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className={`text-sm font-medium uppercase tracking-wide ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs text-muted">({colOrders.length})</span>
                </div>

                <div className="flex flex-col gap-3">
                  {colOrders.length === 0 ? (
                    <p className="text-sm text-muted/60 border border-dashed border-border-warm rounded-xl p-4 text-center">
                      Nothing here
                    </p>
                  ) : (
                    colOrders.map((order) => (
                      <div key={order._id} className="rounded-xl border border-border-warm bg-surface p-4">
                        <div className="flex justify-between items-baseline mb-3">
                          <span className="font-serif text-lg font-semibold">
                            Table {order.tableNumber}
                          </span>
                          {order.placedBy && (
                            <span className="text-xs text-muted">by {order.placedBy.name}</span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 text-sm mb-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-cream/90">
                                {item.name} <span className="text-muted">× {item.qty}</span>
                              </span>
                              <span className="text-muted">₹{item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>

                        {order.status !== 'served' && (
                          <Button
                            size="sm"
                            className="w-full bg-amber text-espresso hover:bg-amber-dark"
                            onClick={() => advanceStatus(order)}
                          >
                            Mark as {STATUS_FLOW[order.status]}
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrderFeed