'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Camera, ArrowLeft, UploadCloud } from 'lucide-react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  // Gestisce la selezione del file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  // Invia la ricetta
  const handleUpload = async () => {
    if (!file) return alert('Seleziona prima una foto!')
    
    setUploading(true)
    
    // 1. Ottieni l'utente corrente (METODO CORRETTO E SEMPLICE)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Devi essere loggato!')
      setUploading(false)
      return
    }

    // 2. Crea un nome unico per il file
    // Rimuoviamo spazi e caratteri strani dal nome file
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
    const fileName = `ricetta-${Date.now()}-${safeFileName}`
    
    // 3. Carica su Supabase Storage (Bucket: prescriptions)
    const { data, error: uploadError } = await supabase
      .storage
      .from('prescriptions')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Errore Upload:', uploadError)
      alert('Errore caricamento foto: ' + uploadError.message)
      setUploading(false)
      return
    }

    // 4. Salva l'ordine nel Database
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        prescription_url: data.path,
        notes: 'Ricetta caricata via App',
        delivery_address: 'Indirizzo da profilo'
      })

    if (dbError) {
      alert('Errore creazione ordine nel database')
      console.error('Errore DB:', dbError)
    } else {
      alert('Ricetta inviata con successo! La farmacia la valuterà.')
      router.push('/') // Torna alla home
    }
    
    setUploading(false)
  }

  return (
    // Padding top aumentato per evitare la "tacca" dell'iPhone
    <div className="min-h-screen bg-gray-50 p-6 pt-14 flex flex-col items-center">
      
      {/* Header con pulsante Indietro */}
      <div className="w-full flex items-center mb-8 relative z-50">
        <button 
          onClick={() => router.push('/')} // Torna alla Home
          className="p-3 bg-white hover:bg-gray-200 rounded-full shadow-sm border border-gray-100"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold ml-4 text-gray-800">Carica Ricetta</h1>
      </div>

      {/* Area Upload */}
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border-2 border-dashed border-green-300 flex flex-col items-center text-center mt-4">
        
        {file ? (
          <div className="text-green-600 font-medium mb-4 break-all">
            📄 {file.name}
          </div>
        ) : (
          <>
            <div className="bg-green-50 p-4 rounded-full mb-4">
              <Camera size={40} className="text-green-600" />
            </div>
            <p className="text-gray-500 mb-6">
              Scatta una foto alla ricetta o carica il PDF del medico.
            </p>
          </>
        )}

        <label className="bg-green-600 text-white py-3 px-6 rounded-xl font-bold cursor-pointer hover:bg-green-700 transition w-full block">
          {file ? 'Cambia Foto' : 'Scatta / Carica Foto'}
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            capture="environment"
            className="hidden" 
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* Bottone Invio Finale */}
      {file && (
        <button 
          onClick={handleUpload}
          disabled={uploading}
          className="mt-6 w-full max-w-md bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition flex justify-center items-center gap-2"
        >
          {uploading ? 'Invio in corso...' : (
            <>
              <UploadCloud size={20} />
              Invia alla Farmacia
            </>
          )}
        </button>
      )}
    </div>
  )
}