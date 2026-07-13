import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'

function TakeOrder() {
  const [menu, setMenu] = useState([])
  const [table, setTable] = useState(1)
  const [cart, setCart] = useState([]) // [{ menuItemId, name, price, qty }]
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
        // already in cart → bump qty
        return prev.map((c) =>
          c.menuItemId === item._id ? { ...c, qty: c.qty + 1 } : c
        )
      }
      // new line
      return [
        ...prev,
        { menuItemId: item._id, name: item.name, price: item.price, qty: 1 },
      ]
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
      await api.post('/orders', {
        tableNumber: table,
        items: cart,
      })
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
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Menu picker — 2 columns wide */}
      <div className="lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-zinc-400">Table</span>
          <select
            value={table}
            onChange={(e) => setTable(Number(e.target.value))}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Table {n}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {menu.map((item) => (
            <button
              key={item._id}
              onClick={() => addToCart(item)}
              className="rounded-lg border border-zinc-800 p-4 text-left hover:border-zinc-600 transition"
            >
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-zinc-400">₹{item.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart — 1 column */}
      <div className="rounded-lg border border-zinc-800 p-4 h-fit">
        <p className="font-medium mb-3">Current Order · Table {table}</p>
        {cart.length === 0 ? (
          <p className="text-sm text-zinc-500">No items yet. Tap the menu to add.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {cart.map((c) => (
              <div key={c.menuItemId} className="flex justify-between items-center text-sm">
                <span>
                  {c.name} × {c.qty}
                </span>
                <div className="flex items-center gap-2">
                  <span>₹{c.price * c.qty}</span>
                  <button
                    onClick={() => removeFromCart(c.menuItemId)}
                    className="text-red-500 text-xs"
                  >
                    remove
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t border-zinc-800 mt-2 pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        )}
        <Button
          className="w-full mt-4"
          onClick={submitOrder}
          disabled={submitting || cart.length === 0}
        >
          {submitting ? 'Placing...' : 'Place order'}
        </Button>
        {message && <p className="text-sm text-green-500 mt-2">{message}</p>}
      </div>
    </div>
  )
}

export default TakeOrder
