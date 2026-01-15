import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineNuxtModule, useLogger } from 'nuxt/kit'
import Beasties from 'beasties'

export default defineNuxtModule({
  meta: {
    name: 'beasties',
  },
  setup(_options, nuxt) {
    const logger = useLogger('beasties')

    nuxt.hook('nitro:build:public-assets', async (nitro) => {
      const outputDir = nitro.options.output.publicDir

      const beasties = new Beasties({
        path: outputDir,
        publicPath: '/',
        reduceInlineStyles: true,
        preload: 'swap-low',
        inlineFonts: true,
      })

      const htmlFiles = await findHtmlFiles(outputDir)

      for (const file of htmlFiles) {
        try {
          const html = await readFile(file, 'utf-8')
          const processed = await beasties.process(html)
          await writeFile(file, processed)
          logger.info(`Inlined CSS for ${file.replace(outputDir, '')}`)
        }
        catch (error) {
          logger.warn(`Failed to inline CSS for ${file}:`, error)
        }
      }
    })
  },
})

async function findHtmlFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await findHtmlFiles(fullPath))
    }
    else if (entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }

  return files
}
