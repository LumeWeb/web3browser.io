import { defineConfig } from 'astro/config'

import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import optimizer from 'vite-plugin-optimizer'

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind({ applyBaseStyles: false, })],
  vite: {
    build:{
      minify: false
    },
    plugins: [
      optimizer({
        'node-fetch':
          'const e = undefined; export default e;export {e as Response, e as FormData, e as Blob};',
      }),
    ]
  }
})
