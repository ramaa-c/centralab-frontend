import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 💡 AÑADIR ESTA LÍNEA PARA EL DESPLIEGUE EN IIS (Subcarpeta)
  base: './', 
  // O el nombre real de la carpeta donde pegaste los archivos en wwwroot

  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://192.168.2.103:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})