''use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, Clock, CheckCircle, Truck, ExternalLink, XCircle, AlertCircle } from 'lucide-react'

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

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error("Errore fetch:", error)
    else setOrders(data || [])
    
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('Errore Database: ' + error.message)
      fetchOrders()
    }
  }

  const openPrescription = async (path: string) => {
    if (!path) return alert("Nessun file associato")
    const { data, error } = await supabase
      .storage
      .from('prescriptions')
      .createSignedUrl(path, 60)

    if (error) return alert('Impossibile aprire il file')
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ready': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'IN ATTESA'
      case 'accepted': return 'ACCETTATO'
      case 'ready': return 'RIDER CHIAMATO'
      case 'delivered': return 'CONSEGNATO'
      case 'rejected': return 'RIFIUTATO'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-green-600" />
            Dashboard Farmacia
          </h1>
          <button onClick={fetchOrders} className="bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600">
            Aggiorna Lista
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Caricamento ordini...</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              // LOGICA PER ABILITARE/DISABILITARE I BOTTONI
              const isPending = order.status === 'pending';
              const isAccepted = order.status === 'accepted';
              const isReady = order.status === 'ready';
              const isFinal = order.status === 'delivered' || order.status === 'rejected';

              return (
                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition hover:shadow-md">
                  
                  {/* Intestazione */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 6)}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        📅 {new Date(order.created_at).toLocaleString('it-IT')}
                      </p>
                      {order.notes && (
                        <p className="text-gray-700 mt-2 text-sm bg-gray-50 p-2 rounded-lg inline-block border border-gray-100">
                          📝 {order.notes}
                        </p>
                      )}
                    </div>
                    
                    {order.prescription_url ? (
                      <button 
                        onClick={() => openPrescription(order.prescription_url)}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition border border-indigo-100"
                      >
                        <ExternalLink size={16} />
                        Vedi Ricetta
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1 italic">
                        <AlertCircle size={14} /> Nessuna ricetta
                      </span>
                    )}
                  </div>

                  {/* Pulsanti Azione CON LOGICA INTELLIGENTE */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                    
                    {/* RIFIUTA: Attivo solo se non è già finito */}
                    <button 
                      disabled={isFinal}
                      onClick={() => updateStatus(order.id, 'rejected')} 
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition ${isFinal ? 'opacity-30 bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                    >
                      <XCircle size={16} /> Rifiuta
                    </button>

                    {/* ACCETTA: Attivo solo se è In Attesa */}
                    <button 
                      disabled={!isPending}
                      onClick={() => updateStatus(order.id, 'accepted')} 
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition ${!isPending ? 'opacity-30 bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                    >
                      <Clock size={16} /> Accetta
                    </button>

                    {/* CHIAMA RIDER: Attivo solo se è Accettato */}
                    <button 
                      disabled={!isAccepted}
                      onClick={() => updateStatus(order.id, 'ready')} 
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition ${!isAccepted ? 'opacity-30 bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'}`}
                    >
                      <Truck size={16} /> Chiama Rider
                    </button>

                    {/* CONSEGNATO: Attivo solo se Rider è partito */}
                    <button 
                      disabled={!isReady}
                      onClick={() => updateStatus(order.id, 'delivered')} 
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition ${!isReady ? 'opacity-30 bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                    >
                      <CheckCircle size={16} /> Consegnato
                    </button>
                  </div>
                </div>
              )
            })}

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