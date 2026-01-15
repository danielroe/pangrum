import { execSync } from 'node:child_process'
import { defineNuxtModule, updateRuntimeConfig } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'git-hash',
  },
  setup() {
    updateRuntimeConfig({
      public: {
        commitHash: getGitCommitHash(),
      },
    })
  },
})

function getGitCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  }
  catch {
    return 'dev'
  }
}
