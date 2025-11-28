'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

// Definiamo come è fatto un prodotto
type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  requires_prescription: boolean
}

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Scarica i dati appena apri la pagina
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
      
      if (error) console.error('Errore:', error)
      else setProducts(data || [])
      
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return (
    // AGGIUNTO pt-14 per evitare la tacca dell'iPhone
    <div className="min-h-screen bg-gray-50 pb-20 pt-14">
      
      {/* Header Fisso con tasto Indietro */}
      <div className="fixed top-0 left-0 right-0 bg-white p-4 shadow-sm flex items-center gap-4 z-50 pt-14">
        <button 
          onClick={() => router.push('/')} // Torna alla Home sicuro
          className="p-2 hover:bg-gray-100 rounded-full border border-gray-100"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Cerca Farmaco</h1>
      </div>

      {/* Griglia Prodotti (Aggiunto margine in alto per non finire sotto l'header) */}
      <div className="p-4 grid grid-cols-1 gap-4 mt-4">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Caricamento catalogo...</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
              {/* Immagine */}
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">No Foto</div>
                )}
              </div>

              {/* Dettagli */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      € {product.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                </div>
                
                <div className="flex justify-between items-end mt-2">
                  {product.requires_prescription && (
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                      Serve Ricetta
                    </span>
                  )}
                  <button className="bg-green-600 text-white p-2 rounded-full shadow hover:bg-green-700 transition ml-auto">
                    <ShoppingBag size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}