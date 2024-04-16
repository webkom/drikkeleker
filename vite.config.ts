import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import ReactRefresh from '@vitejs/plugin-react-refresh'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ReactRefresh()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
