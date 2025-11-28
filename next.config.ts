import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // <--- DICE A NEXT.JS DI CREARE HTML STATICO
  images: {
    unoptimized: true // <--- NECESSARIO PERCHÉ SUL TELEFONO NON C'È UN SERVER IMMAGINI
  }
};

export default nextConfig;