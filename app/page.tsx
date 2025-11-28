'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, LogOut, PlusCircle, Search, Package, Loader2, Star } from 'lucide-react'

// Tipo per gli ordini
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
  
  // Stati per il GPS
  const [gpsLocation, setGpsLocation] = useState<string | null>(null)
  const [findingLocation, setFindingLocation] = useState(false)
  
  const router = useRouter()

  // 1. All'avvio: Controlla utente e scarica ordini
  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setUser(session.user)
        
        // Scarica gli ordini di questo utente
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }) // Dal più recente
          
        if (ordersData) setOrders(ordersData)
      }
      setLoading(false)
    }
    initData()
  }, [])

  // 2. Logout completo
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setOrders([])
    router.refresh()
  }

  // 3. Geolocalizzazione Reale
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Il tuo dispositivo non supporta il GPS')
      return
    }

    setFindingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setGpsLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        setFindingLocation(false)
        
        // Apre Google Maps per conferma
        window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')
      },
      (error) => {
        console.error(error)
        alert('Impossibile trovare la posizione. Controlla i permessi del browser.')
        setFindingLocation(false)
      },
      { enableHighAccuracy: true }
    )
  }

  // 4. Etichette colorate per lo stato ordine
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

  // Vista Caricamento
  if (loading) return <div className="flex h-screen items-center justify-center text-green-600 font-bold">Caricamento gpharma...</div>

  // --- VISTA DASHBOARD (UTENTE LOGGATO) ---
  if (user) {
    return (
      <main className="min-h-screen bg-gray-50 pb-20">
        
        {/* Header con Logo */}
        <div className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10 pt-12 sm:pt-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-auto object-contain" />
            <div className="hidden sm:block"> 
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Bentornato</p>
              <p className="text-sm font-bold text-gray-800 truncate w-32">{user.email.split('@')[0]}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition">
            <LogOut size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          
          {/* Banner Promo */}
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-white relative">
            <img src="/banner.jpg" alt="Promo" className="w-full h-full object-cover object-center" />
          </div>

          {/* Box GPS */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">Dove ti trovi?</h2>
              {gpsLocation ? (
                <p className="text-xs text-green-600 font-mono mt-1">📍 {gpsLocation}</p>
              ) : (
                <p className="text-xs text-gray-500">Trova farmacie vicine</p>
              )}
            </div>
            <button 
              onClick={handleGetLocation}
              disabled={findingLocation}
              className={`p-3 rounded-full shadow-lg transition flex items-center justify-center ${
                findingLocation ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {findingLocation ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
            </button>
          </div>

          {/* Pulsanti Azione */}
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

          {/* Lista Ordini */}
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

          {/* Box Recensioni Google */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100 text-center shadow-sm">
            <h3 className="font-bold text-gray-800 mb-1 text-lg">Ti piace gpharma?</h3>
            <p className="text-sm text-gray-500 mb-4">Lasciaci una recensione, ci aiuta moltissimo! ⭐</p>
            
            <button 
              onClick={() => window.open('https://g.page/r/example', '_blank')} // Metterai qui il link vero
              className="bg-white text-gray-800 px-6 py-3 rounded-full font-bold shadow-sm border border-gray-200 flex items-center justify-center gap-2 mx-auto hover:bg-yellow-50 transition transform hover:scale-105"
            >
              <Star size={20} className="text-yellow-500 fill-yellow-500" />
              Lascia 5 Stelle
            </button>
          </div>

        </div>
      </main>
    )
  }

  // --- VISTA OSPITE (LOGIN/LANDING) ---
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
      
      {/* Sfondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-green-50 to-white z-0"></div>

      <div className="z-10 flex flex-col items-center w-full max-w-sm">
        
        {/* Banner + Logo Ospite */}
        <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-xl mb-6 border border-white">
          <img src="/banner.jpg" alt="Promo" className="w-full h-full object-cover" />
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex justify-center border border-gray-100">
          <img src="/logo.jpg" alt="gpharma" className="h-10 w-auto object-contain" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">gpharma</h1>
        <p className="text-gray-500 mb-8 text-center px-4 leading-relaxed">
          La farmacia a domicilio.<br/>
          <span className="text-sm">Ordina, carica la ricetta, ricevi.</span>
        </p>

        <Link href="/login" className="w-full bg-green-600 text-white text-center py-4 rounded-2xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 hover:scale-[1.02] transition transform duration-200 flex items-center justify-center gap-2">
          Inizia Subito
        </Link>
        
        <p className="mt-8 text-xs text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Web App Attiva v2.0
        </p>
      </div>
    </main>
  )
}