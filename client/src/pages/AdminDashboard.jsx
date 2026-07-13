import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
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

function AdminDashboard() {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)

  // form state
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
      await api.post('/menu', {
        name,
        price: Number(price),
        category,
        available: true,
      })
      // reset form
      setName('')
      setPrice('')
      setCategory('Coffee')
      // refresh list so the new item shows
      fetchMenu()
    } catch (err) {
      console.error('Failed to add item', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Menu Management</h1>

      {/* Add item form */}
      <div className="rounded-lg border border-zinc-800 p-4 mb-6 max-w-2xl">
        <p className="font-medium mb-3">Add a menu item</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cappuccino"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="180"
              className="w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Coffee">Coffee</SelectItem>
                <SelectItem value="Tea">Tea</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Dessert">Dessert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={submitting}>
            {submitting ? 'Adding...' : 'Add item'}
          </Button>
        </div>
      </div>

      {/* Existing items list */}
      {loading ? (
        <p className="text-zinc-400">Loading menu...</p>
      ) : (
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
              <p className="font-semibold">₹{item.price}</p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default AdminDashboard