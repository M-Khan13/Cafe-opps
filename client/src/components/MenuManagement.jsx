import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function MenuManagement() {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Coffee')
  const [submitting, setSubmitting] = useState(false)

  async function fetchMenu() {
    try {
      const res = await api.get('/menu')
      setMenu(res.data)
    } catch (err) {
      console.error('Failed to load menu', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  async function handleAdd() {
    if (!name || !price) return
    setSubmitting(true)
    try {
      await api.post('/menu', { name, price: Number(price), category, available: true })
      setName('')
      setPrice('')
      setCategory('Coffee')
      fetchMenu()
    } catch (err) {
      console.error('Failed to add item', err)
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleAvailable(item) {
    try {
      await api.patch(`/menu/${item._id}`, { available: !item.available })
      fetchMenu()
    } catch (err) {
      console.error('Failed to update item', err)
    }
  }

  async function deleteItem(id) {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/menu/${id}`)
      fetchMenu()
    } catch (err) {
      console.error('Failed to delete item', err)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold mb-1">Menu</h1>
      <p className="text-muted mb-8">Add, update, and manage the day's menu.</p>

      {/* Add form */}
      <div className="rounded-xl border border-border-warm bg-surface p-5 mb-8 max-w-2xl">
        <p className="font-medium mb-4">Add a menu item</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Cappuccino" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Price (₹)</Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="180" className="w-28" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Coffee">Coffee</SelectItem>
                <SelectItem value="Tea">Tea</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Dessert">Dessert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={submitting} className="bg-amber text-espresso hover:bg-amber-dark">
            {submitting ? 'Adding...' : 'Add item'}
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-muted">Loading menu...</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {menu.map((item) => (
            <div key={item._id} className="rounded-xl border border-border-warm bg-surface p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted mb-1">{item.category}</p>
                  <p className="font-medium">{item.name}</p>
                </div>
                <p className="font-semibold text-amber">₹{item.price}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${item.available ? 'text-status-served' : 'text-danger'}`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleAvailable(item)}>
                    {item.available ? 'Mark out' : 'Mark in'}
                  </Button>
                  <Button size="sm" variant="outline" className="text-danger" onClick={() => deleteItem(item._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MenuManagement
