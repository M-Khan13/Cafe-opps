import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import TakeOrder from '@/components/TakeOrder'
import MyTasks from '@/components/MyTasks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function StaffDashboard() {
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
    <Layout>
      <Tabs defaultValue="order">
        <TabsList className="mb-6">
          <TabsTrigger value="order">Take Order</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          
         
        
        </TabsList>

        <TabsContent value="order">
          <TakeOrder />
        </TabsContent>

        <TabsContent value="tasks">
          <MyTasks />
        </TabsContent>

        <TabsContent value="menu">
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
        </TabsContent>
      </Tabs>
    </Layout>
  )
}

export default StaffDashboard