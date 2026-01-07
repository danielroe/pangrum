// https://gist.github.com/zverok/c574b7a9c42cc17bdc2aa396e3edd21a

import { readFile } from 'node:fs/promises'

interface AffixRule {
  flag: string
  crossproduct: boolean
  strip: string
  add: string
  condition: RegExp
  flags?: string[]
}

interface WordEntry {
  stem: string
  flags: string[]
}

interface AffData {
  PFX: Map<string, AffixRule[]>
  SFX: Map<string, AffixRule[]>
  NEEDAFFIX?: string
  FORBIDDENWORD?: string
  FLAG: 'short' | 'long' | 'num' | 'UTF-8'
}

async function parseAffixFile(affPath: string): Promise<AffData> {
  const content = await readFile(affPath, 'utf-8')
  const lines = content.split('\n')

  const aff: AffData = {
    PFX: new Map(),
    SFX: new Map(),
    FLAG: 'short', // default
  }

  let _currentType: 'PFX' | 'SFX' | null = null
  let currentFlag: string | null = null
  const crossproductMap = new Map<string, boolean>()

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const parts = trimmed.split(/\s+/)
    const directive = parts[0]

    if (directive === 'FLAG') {
      if (parts[1] === 'long') aff.FLAG = 'long'
      else if (parts[1] === 'num') aff.FLAG = 'num'
      else if (parts[1] === 'UTF-8') aff.FLAG = 'UTF-8'
    }
    else if (directive === 'NEEDAFFIX') {
      aff.NEEDAFFIX = parts[1]
    }
    else if (directive === 'FORBIDDENWORD') {
      aff.FORBIDDENWORD = parts[1]
    }
    else if (directive === 'PFX' || directive === 'SFX') {
      const flag = parts[1]
      if (!flag) continue

      if (parts.length === 3 || parts.length === 4) {
        const crossproduct = parts[2] === 'Y'
        _currentType = directive
        currentFlag = flag
        crossproductMap.set(`${directive}:${flag}`, crossproduct)
        if (!aff[directive].has(flag)) {
          aff[directive].set(flag, [])
        }
      }
      else if (parts.length >= 5 && currentFlag === flag) {
        const crossproduct = crossproductMap.get(`${directive}:${flag}`) || false
        const strip = parts[2] === '0' ? '' : parts[2] || ''
        const add = parts[3] === '0' ? '' : parts[3] || ''
        const conditionStr = parts[4] || '.'

        // Convert Hunspell condition to regex
        let regexStr = conditionStr
        if (!regexStr.startsWith('^') && !regexStr.startsWith('.')) {
          regexStr = (directive === 'PFX' ? '^' : '') + regexStr + (directive === 'SFX' ? '$' : '')
        }

        try {
          const condition = new RegExp(regexStr)
          const ruleFlags = parts[5] ? parseFlags(parts[5], aff.FLAG) : []

          aff[directive].get(flag)!.push({
            flag,
            crossproduct,
            strip,
            add,
            condition,
            flags: ruleFlags,
          })
        }
        catch {
          // Skip invalid regex patterns
        }
      }
    }
  }

  return aff
}

function parseFlags(flagStr: string, flagType: AffData['FLAG']): string[] {
  if (!flagStr || flagStr === '0') return []

  if (flagType === 'long') {
    // Two-character flags
    const flags: string[] = []
    for (let i = 0; i < flagStr.length; i += 2) {
      flags.push(flagStr.slice(i, i + 2))
    }
    return flags
  }
  else if (flagType === 'num') {
    // Comma-separated numbers
    return flagStr.split(',')
  }
  else {
    // Short (single character) or UTF-8
    return flagStr.split('')
  }
}

async function parseDictionaryFile(dicPath: string, flagType: AffData['FLAG']): Promise<WordEntry[]> {
  const content = await readFile(dicPath, 'utf-8')
  const lines = content.split('\n')

  const words: WordEntry[] = []

  // Skip first line (word count)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim()
    if (!line) continue

    const [stem, flagsStr] = line.split('/')
    if (!stem) continue

    const flags = flagsStr ? parseFlags(flagsStr, flagType) : []

    words.push({ stem: stem.trim(), flags })
  }

  return words
}

function unmunchWord(word: WordEntry, aff: AffData): Set<string> {
  const result = new Set<string>()

  // Skip forbidden words
  if (aff.FORBIDDENWORD && word.flags.includes(aff.FORBIDDENWORD)) {
    return result
  }

  // Add the base word unless it requires an affix
  if (!(aff.NEEDAFFIX && word.flags.includes(aff.NEEDAFFIX))) {
    result.add(word.stem)
  }

  // Get applicable suffixes
  const suffixes: AffixRule[] = []
  for (const flag of word.flags) {
    const rules = aff.SFX.get(flag) || []
    for (const rule of rules) {
      if (rule.condition.test(word.stem)) {
        suffixes.push(rule)
      }
    }
  }

  // Get applicable prefixes
  const prefixes: AffixRule[] = []
  for (const flag of word.flags) {
    const rules = aff.PFX.get(flag) || []
    for (const rule of rules) {
      if (rule.condition.test(word.stem)) {
        prefixes.push(rule)
      }
    }
  }

  // Apply suffixes
  for (const suffix of suffixes) {
    const root = suffix.strip ? word.stem.slice(0, -suffix.strip.length) : word.stem
    const suffixed = root + suffix.add

    if (!(aff.NEEDAFFIX && suffix.flags?.includes(aff.NEEDAFFIX))) {
      result.add(suffixed)
    }

    // Apply secondary suffixes
    if (suffix.flags) {
      for (const flag of suffix.flags) {
        const secondarySuffixes = aff.SFX.get(flag) || []
        for (const suffix2 of secondarySuffixes) {
          if (suffix2.condition.test(suffixed)) {
            const root2 = suffix2.strip ? suffixed.slice(0, -suffix2.strip.length) : suffixed
            result.add(root2 + suffix2.add)
          }
        }
      }
    }
  }

  // Apply prefixes
  for (const prefix of prefixes) {
    const root = prefix.strip ? word.stem.slice(prefix.strip.length) : word.stem
    const prefixed = prefix.add + root

    if (!(aff.NEEDAFFIX && prefix.flags?.includes(aff.NEEDAFFIX))) {
      result.add(prefixed)
    }

    // Apply suffixes to prefixed words if crossproduct
    if (prefix.crossproduct) {
      const additionalSuffixes: AffixRule[] = []
      if (prefix.flags) {
        for (const flag of prefix.flags) {
          const rules = aff.SFX.get(flag) || []
          for (const rule of rules) {
            if (rule.crossproduct && !suffixes.includes(rule) && rule.condition.test(prefixed)) {
              additionalSuffixes.push(rule)
            }
          }
        }
      }

      for (const suffix of [...suffixes, ...additionalSuffixes]) {
        const root2 = suffix.strip ? prefixed.slice(0, -suffix.strip.length) : prefixed
        const suffixed = root2 + suffix.add
        result.add(suffixed)

        // Apply secondary suffixes
        if (suffix.flags) {
          for (const flag of suffix.flags) {
            const secondarySuffixes = aff.SFX.get(flag) || []
            for (const suffix2 of secondarySuffixes) {
              if (suffix2.crossproduct && suffix2.condition.test(suffixed)) {
                const root3 = suffix2.strip ? suffixed.slice(0, -suffix2.strip.length) : suffixed
                result.add(root3 + suffix2.add)
              }
            }
          }
        }
      }
    }
  }

  return result
}

/**
 * Unmunch an entire Hunspell dictionary
 */
export async function unmunch(dicPath: string, affPath: string): Promise<string[]> {
  const aff = await parseAffixFile(affPath)
  const words = await parseDictionaryFile(dicPath, aff.FLAG)

  const result = new Set<string>()

  for (const word of words) {
    const expanded = unmunchWord(word, aff)
    for (const w of expanded) {
      result.add(w)
    }
  }

  return Array.from(result).sort()
}
