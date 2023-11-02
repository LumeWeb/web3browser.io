import { defineConfig } from 'astro/config'

import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import optimizer from 'vite-plugin-optimizer'
import * as fs from 'node:fs'

// https://astro.build/config
export default defineConfig({
    output: 'static',
    integrations: [react(), tailwind({ applyBaseStyles: false })],
    vite: {
        server:
            process.env.MODE === 'development'
                ? {
                    https: {
                        cert: fs.readFileSync('./.local-ssl/localhost.pem'),
                        key: fs.readFileSync('./.local-ssl/localhost-key.pem'),
                    },
                }
                : {},
        build: {
            minify: false,
        },
        plugins: [
            optimizer({
                'node-fetch':
                    'const e = undefined; export default e;export {e as Response, e as FormData, e as Blob};',
            }),
        ],
    },
})
