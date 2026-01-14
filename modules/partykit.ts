import { defineNuxtModule, updateRuntimeConfig, useLogger } from 'nuxt/kit'
import { spawn, type ChildProcess } from 'node:child_process'
import { getPort } from 'get-port-please'

export default defineNuxtModule({
  meta: {
    name: 'partykit-dev',
    configKey: 'partykit',
  },
  defaults: {
    enabled: true,
    port: 1999,
  },
  async setup(options, nuxt) {
    let port = options.port
    if (nuxt.options.dev) {
      port = await getPort({ port: options.port })
    }
    updateRuntimeConfig({
      public: {
        partykit: {
          host: nuxt.options.dev ? `localhost:${port}` : 'pangrum.danielroe.partykit.dev',
        },
      },
    })

    if (!nuxt.options.dev || !options.enabled) return

    const logger = useLogger('partykit')
    let partyProcess: ChildProcess | null = null

    nuxt.hook('listen', () => {
      logger.info(`Starting PartyKit dev server on port ${port}...`)

      partyProcess = spawn('npx', ['partykit', 'dev', '--port', String(port)], {
        cwd: nuxt.options.rootDir,
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          FORCE_COLOR: '1',
        },
      })

      partyProcess.on('error', (err) => {
        logger.error('Failed to start:', err.message)
      })

      partyProcess.on('exit', (code) => {
        if (code !== null && code !== 0) {
          logger.error(`Process exited with code ${code}`)
        }
        partyProcess = null
      })
    })

    function cleanup() {
      if (partyProcess) {
        logger.info('Stopping PartyKit dev server...')
        partyProcess.kill('SIGTERM')
        partyProcess = null
      }
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    nuxt.hook('close', cleanup)
  },
})
