import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log', 'console.debug'],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/.test(id)) {
            return 'vendor-react';
          }

          if (id.includes('@zoom/meetingsdk')) return 'vendor-zoom';
          if (id.includes('@ckeditor')) return 'vendor-ckeditor';
          if (id.includes('react-pdf') || id.includes('pdfjs-dist')) return 'vendor-pdf';
          if (id.includes('apexcharts')) return 'vendor-charts';
          if (id.includes('plyr')) return 'vendor-plyr';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('slick-carousel') || id.includes('react-slick')) return 'vendor-slick';
          if (id.includes('docx-preview')) return 'vendor-docx';
          if (id.includes('laravel-echo') || id.includes('pusher-js')) return 'vendor-realtime';
          if (id.includes('@react-oauth') || id.includes('crypto-js')) return 'vendor-auth';
          if (id.includes('formik') || id.includes('yup')) return 'vendor-forms';
          if (id.includes('i18next')) return 'vendor-i18n';
          if (id.includes('date-fns') || id.includes('dayjs')) return 'vendor-date';
          if (id.includes('@mui/icons-material') || id.includes('iconsax-reactjs')) return 'vendor-icons';
          if (id.includes('@mui/x-date-pickers')) return 'vendor-mui-pickers';
          if (id.includes('@mui') || id.includes('@emotion')) return 'vendor-mui';
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('@reduxjs') || id.includes('react-redux')) return 'vendor-redux';
        },
      },
    },
  },
})
