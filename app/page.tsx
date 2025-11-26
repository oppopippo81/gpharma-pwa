'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, LogOut, PlusCircle, Search, Package } from 'lucide-react'

type Order = {
  id: string
  created_at: string
  status: string
  notes: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const router = useRouter()

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
        if (ordersData) setOrders(ordersData)
      }
      setLoading(false)
    }
    initData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-800' }
      case 'accepted': return { label: 'Accettato', color: 'bg-blue-100 text-blue-800' }
      case 'ready': return { label: 'Rider in arrivo', color: 'bg-indigo-100 text-indigo-800' }
      case 'delivered': return { label: 'Consegnato', color: 'bg-green-100 text-green-800' }
      case 'rejected': return { label: 'Rifiutato', color: 'bg-red-100 text-red-800' }
      default: return { label: status, color: 'bg-gray-100' }
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center text-green-600 font-bold">Caricamento gpharma...</div>

  // --- UTENTE LOGGATO ---
  if (user) {
    return (
      <main className="min-h-screen bg-gray-50 pb-20">
        {/* Header con Logo Rettangolare Corretto */}
        <div className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* QUI ABBIAMO CORRETTO LE DIMENSIONI PER IL LOGO RETTANGOLARE */}
            <img src="/logo.jpg" alt="Logo" className="h-10 w-auto object-contain" />
            
            <div className="hidden sm:block"> 
              {/* Nascondiamo la mail su schermi piccolissimi per dare spazio al logo */}
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Bentornato</p>
              <p className="text-sm font-bold text-gray-800 truncate w-32">{user.email.split('@')[0]}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition">
            <LogOut size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          
          {/* BANNER PROMOZIONALE (Senza scritte sopra, si vede la tua grafica) */}
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-white">
            <img 
              src="/banner.jpeg" 
              alt="Promo" 
              className="w-full h-full object-cover object-center" 
            />
          </div>

          {/* Card Geolocalizzazione */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">Dove ti trovi?</h2>
              <p className="text-xs text-gray-500">Trova farmacie vicine</p>
            </div>
            <button 
              onClick={() => alert('Demo: Posizione OK')}
              className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition"
            >
              <MapPin size={20} />
            </button>
          </div>

          {/* Azioni Rapide */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/search')}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:border-green-500 transition group"
            >
              <div className="bg-blue-50 p-4 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                <Search size={24} />
              </div>
              <span className="font-bold text-sm text-gray-700">Cerca Farmaco</span>
            </button>

            <button 
              onClick={() => router.push('/upload')}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:border-green-500 transition group"
            >
              <div className="bg-orange-50 p-4 rounded-full text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition">
                <PlusCircle size={24} />
              </div>
              <span className="font-bold text-sm text-gray-700">Carica Ricetta</span>
            </button>
          </div>

          {/* LISTA ORDINI */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={18} className="text-gray-400" />
              I tuoi ordini
            </h3>
            
            {orders.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-dashed border-gray-200 text-center">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-400 text-sm">Nessun ordine recente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const statusInfo = getStatusLabel(order.status)
                  return (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusInfo.color.split(' ')[0]}`}></div>
                      <div className="pl-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-gray-700 mt-1 truncate w-40">
                          {order.notes}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }

  // --- VISTA OSPITE (Login) ---
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-green-50 to-transparent z-0"></div>

      <div className="z-10 flex flex-col items-center w-full max-w-sm">
        {/* LOGO GRANDE NELLA HOME OSPITE */}
        <div className="bg-white p-6 rounded-3xl shadow-xl mb-8 w-full flex justify-center">
          <img src="/logo.jpg" alt="gpharma" className="h-16 w-auto object-contain" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">gpharma</h1>
        <p className="text-gray-500 mb-10 text-center px-4">
          La farmacia a domicilio.<br/>Ordina, carica la ricetta, ricevi.
        </p>

        <Link href="/login" className="w-full bg-green-600 text-white text-center py-4 rounded-2xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 hover:scale-[1.02] transition transform duration-200">
          Inizia Subito
        </Link>
        
        <p className="mt-8 text-xs text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Web App Attiva v1.3
        </p>
      </div>
    </main>
  )
}