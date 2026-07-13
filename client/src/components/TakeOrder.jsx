import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'

function TakeOrder() {
  const [menu, setMenu] = useState([])
  const [table, setTable] = useState(1)
  const [cart, setCart] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await api.get('/menu')
        setMenu(res.data.filter((m) => m.available))
      } catch (err) {
        console.error('Failed to load menu', err)
      }
    }
    fetchMenu()
  }, [])

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item._id)
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item._id ? { ...c, qty: c.qty + 1 } : c
        )
      }
      return [...prev, { menuItemId: item._id, name: item.name, price: item.price, qty: 1 }]
    })
  }

  function removeFromCart(menuItemId) {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId))
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0)

  async function submitOrder() {
    if (cart.length === 0) return
    setSubmitting(true)
    setMessage('')
    try {
      await api.post('/orders', { tableNumber: table, items: cart })
      setCart([])
      setMessage(`Order placed for table ${table}`)
    } catch (err) {
      setMessage('Failed to place order.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold mb-1">Take Order</h1>
      <p className="text-muted mb-8">Build an order and send it to the pass.</p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT: table + menu */}
        <div className="lg:col-span-2">
          {/* Table selector */}
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Select Table</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setTable(n)}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  table === n
                    ? 'bg-amber text-espresso font-medium'
                    : 'border border-border-warm text-muted hover:text-cream hover:border-muted'
                }`}
              >
                Table {n}
              </button>
            ))}
          </div>

          {/* Menu */}
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Menu</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {menu.map((item) => (
              <button
                key={item._id}
                onClick={() => addToCart(item)}
                className="rounded-xl border border-border-warm bg-surface p-4 text-left hover:border-amber transition group"
              >
                <p className="text-xs uppercase tracking-wide text-muted mb-3">{item.category}</p>
                <div className="flex justify-between items-baseline">
                  <span className="font-medium group-hover:text-amber transition">{item.name}</span>
                  <span className="text-amber font-semibold">₹{item.price}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: current order */}
        <div className="rounded-xl border border-border-warm bg-surface p-5 h-fit sticky top-8">
          <p className="font-serif text-xl font-semibold">Current Order</p>
          <p className="text-sm text-muted mb-4">Table {table}</p>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ShoppingBag className="h-8 w-8 text-muted/50 mb-3" />
              <p className="text-sm text-muted">No items yet</p>
              <p className="text-xs text-muted/60">Tap a menu item to start.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-4">
              {cart.map((c) => (
                <div key={c.menuItemId} className="flex justify-between items-center text-sm">
                  <span>
                    {c.name} <span className="text-muted">× {c.qty}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span>₹{c.price * c.qty}</span>
                    <button
                      onClick={() => removeFromCart(c.menuItemId)}
                      className="text-danger text-xs hover:underline"
                    >
                      remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t border-border-warm mt-1 pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-amber">₹{total}</span>
              </div>
            </div>
          )}

          <Button
            className="w-full bg-amber text-espresso hover:bg-amber-dark"
            onClick={submitOrder}
            disabled={submitting || cart.length === 0}
          >
            {submitting ? 'Placing...' : 'Place order'}
          </Button>
          {message && <p className="text-sm text-status-served mt-3 text-center">{message}</p>}
        </div>
      </div>
    </div>
  )
}

export default TakeOrder