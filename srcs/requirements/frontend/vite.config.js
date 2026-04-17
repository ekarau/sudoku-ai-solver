import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    [
                        'babel-plugin-styled-components',
                        {
                            displayName: true, // Component isimlerini DOM'da gösterir (örn: GameMainArea__sc-1x2y3z)
                            fileName: false
                        }
                    ]
                ]
            }
        })
    ],
    server: {
        host: true,
        port: 5173,
        strictPort: true,
        watch: {
            usePolling: true,
        },
        hmr: {
            clientPort: 8443,
            host: "localhost",
            protocol: "wss",
        },
        fs: {
            strict: false,
        }
    },
    optimizeDeps: {
        esbuildOptions: {
            sourcemap: false
        }
    },
    build: {
        sourcemap: false
    },
    preview: {
        host: true,
        port: 5173,
        strictPort: true
    },
    esbuild: {
        pure: ['console.log', 'console.error', 'console.warn', 'console.debug', 'console.info'],
        drop: ['debugger']
    }
})