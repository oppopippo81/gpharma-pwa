'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, Clock, CheckCircle, Truck, ExternalLink, XCircle } from 'lucide-react'

type Order = {
  id: string
  created_at: string
  status: string
  prescription_url: string
  notes: string
  user_id: string
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Scarica gli ordini
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error(error)
    else setOrders(data || [])
    
    setLoading(false)
  }

  // Aggiorna ogni 10 secondi
  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  // Funzione per cambiare stato
  const updateStatus = async (id: string, newStatus: string) => {
    // Feedback immediato per l'utente (optimistic update)
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('Errore aggiornamento')
      fetchOrders() // Se fallisce, ricarica i dati veri
    }
  }

  // Apre la ricetta
  const openPrescription = async (path: string) => {
    const { data, error } = await supabase
      .storage
      .from('prescriptions')
      .createSignedUrl(path, 60)

    if (error) alert('Errore apertura file')
    else window.open(data.signedUrl, '_blank')
  }

  // Colore badge (L'etichetta in alto a sinistra)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ready': return 'bg-green-100 text-green-800 border-green-200'
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100'
    }
  }

  // Traduzione stato per l'utente
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'IN ATTESA'
      case 'accepted': return 'ACCETTATO'
      case 'ready': return 'PRONTO X RIDER'
      case 'delivered': return 'CONSEGNATO'
      case 'rejected': return 'RIFIUTATO'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-green-600" />
            Dashboard Farmacia
          </h1>
          <button 
            onClick={fetchOrders}
            className="bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            Aggiorna Lista
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Caricamento ordini...</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition hover:shadow-md">
                
                {/* Intestazione Ordine */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleString('it-IT')}
                    </p>
                    {order.notes && (
                      <p className="text-gray-700 mt-3 text-sm bg-gray-50 p-2 rounded-lg inline-block">
                        📝 Note: {order.notes}
                      </p>
                    )}
                  </div>
                  
                  {order.prescription_url && (
                    <button 
                      onClick={() => openPrescription(order.prescription_url)}
                      className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition"
                    >
                      <ExternalLink size={16} />
                      Vedi Ricetta
                    </button>
                  )}
                </div>

                {/* Pulsanti Azione (Ora sono neutri finché non li clicchi) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                  
                  {/* TASTO RIFIUTA (ROSSO) */}
                  <button 
                    onClick={() => updateStatus(order.id, 'rejected')}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
                  >
                    <XCircle size={18} />
                    Rifiuta
                  </button>

                  {/* TASTO ACCETTA (BLU) */}
                  <button 
                    onClick={() => updateStatus(order.id, 'accepted')}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition"
                  >
                    <Clock size={18} />
                    Accetta
                  </button>

                  {/* TASTO PRONTO (VERDE) */}
                  <button 
                    onClick={() => updateStatus(order.id, 'ready')}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-green-200 text-green-600 font-semibold hover:bg-green-50 transition"
                  >
                    <Truck size={18} />
                    Chiama Rider
                  </button>

                  {/* TASTO CONSEGNATO (GRIGIO) */}
                  <button 
                    onClick={() => updateStatus(order.id, 'delivered')}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition"
                  >
                    <CheckCircle size={18} />
                    Consegnato
                  </button>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                Nessun ordine in arrivo.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}