import { calculateFillWidth, formatShareText, type ShareData } from '../utils/share'

export function useShare() {
  const isShareSupported = computed(() => {
    if (!import.meta.client) return false
    return !!navigator.share && !!navigator.canShare
  })

  async function generateShareImage(data: ShareData): Promise<Blob> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    // Image dimensions (good for social sharing)
    const width = 600
    const height = 400
    canvas.width = width
    canvas.height = height

    // Background
    ctx.fillStyle = '#0f0f0f'
    ctx.fillRect(0, 0, width, height)

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    // Brand
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = '500 16px system-ui, sans-serif'
    ctx.letterSpacing = '0.1em'
    ctx.fillText('pangrum', 32, 40)

    // Date
    const dateStr = new Date(data.date).toLocaleDateString('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '400 14px system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(dateStr, width - 32, 40)

    // Reset text align
    ctx.textAlign = 'left'

    // Letters display (centre letter highlighted)
    const centreLetter = data.letters[2]
    const outerLetters = data.letters.filter((_, i) => i !== 2)
    const displayLetters = [
      ...outerLetters.slice(0, 3),
      centreLetter,
      ...outerLetters.slice(3),
    ]

    const letterY = 100
    const letterSpacing = 50
    const lettersStartX = (width - (displayLetters.length * letterSpacing)) / 2 + letterSpacing / 2

    displayLetters.forEach((letter, i) => {
      const x = lettersStartX + i * letterSpacing
      const isCentre = i === 3

      if (isCentre) {
        // Glow effect for centre letter
        ctx.shadowColor = 'rgba(20, 184, 166, 0.6)'
        ctx.shadowBlur = 20
        ctx.fillStyle = '#14b8a6'
      }
      else {
        ctx.shadowBlur = 0
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      }

      ctx.font = `bold ${isCentre ? 36 : 28}px ui-monospace, monospace`
      ctx.textAlign = 'center'
      ctx.fillText(letter!, x, letterY)
    })

    // Reset shadow
    ctx.shadowBlur = 0
    ctx.textAlign = 'left'

    // Score (large, with gradient simulation)
    ctx.fillStyle = '#14b8a6'
    ctx.font = 'bold 72px ui-monospace, monospace'
    ctx.textAlign = 'center'
    ctx.fillText(data.score.toString(), width / 2, 200)

    // Status
    ctx.fillStyle = '#fafafa'
    ctx.font = '500 24px system-ui, sans-serif'
    ctx.fillText(data.status, width / 2, 240)

    // Stats row
    const statsY = 300
    ctx.font = '400 16px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'

    // Words found
    ctx.textAlign = 'center'
    ctx.fillText(`${data.wordsFound} / ${data.totalWords} words`, width / 2 - 100, statsY)

    // Pangrams (with stars)
    if (data.totalPangrams > 0) {
      const pangramText = `${data.pangrams} / ${data.totalPangrams}`
      ctx.fillText(pangramText, width / 2 + 100, statsY)

      // Draw stars
      const starSize = 12
      const starY = statsY + 20
      const starsStartX = width / 2 + 100 - ((data.totalPangrams * (starSize + 4)) / 2)

      for (let i = 0; i < data.totalPangrams; i++) {
        const starX = starsStartX + i * (starSize + 4)
        ctx.fillStyle = i < data.pangrams ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)'
        drawStar(ctx, starX, starY, starSize / 2, 5)
      }
    }

    // Progress bar
    const barY = 350
    const barWidth = width - 100
    const barHeight = 8
    const barX = 50
    const percentage = calculatePercentage(data.score, data.maxScore)
    const fillWidth = calculateFillWidth(percentage)

    // Background bar
    ctx.fillStyle = '#333333'
    ctx.beginPath()
    ctx.roundRect(barX, barY, barWidth, barHeight, 4)
    ctx.fill()

    // Progress fill
    const fillPixelWidth = barWidth * (fillWidth / 100)
    const gradient = ctx.createLinearGradient(barX, 0, barX + fillPixelWidth, 0)
    gradient.addColorStop(0, '#14b8a6')
    gradient.addColorStop(1, 'rgba(20, 184, 166, 0.4)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(barX, barY, fillPixelWidth, barHeight, 4)
    ctx.fill()

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to generate image'))
      }, 'image/png')
    })
  }

  function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, points: number) {
    const outerRadius = radius
    const innerRadius = radius * 0.5
    const step = Math.PI / points

    ctx.beginPath()
    for (let i = 0; i < 2 * points; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius
      const angle = i * step - Math.PI / 2
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()
  }

  async function shareResults(data: ShareData) {
    const blob = await generateShareImage(data)
    const file = new File([blob], `pangrum-${data.date}.png`, { type: 'image/png' })

    const shareData = {
      title: 'Pangrum',
      text: formatShareText(data),
      files: [file],
    }

    if (navigator.canShare?.(shareData)) {
      await navigator.share(shareData)
      return { shared: true }
    }

    // Fallback: download the image
    return { shared: false, blob, file }
  }

  async function downloadImage(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function copyTextToClipboard(data: ShareData) {
    await navigator.clipboard.writeText(formatShareText(data))
  }

  async function copyImageToClipboard(blob: Blob): Promise<boolean> {
    try {
      // ClipboardItem with image/png is supported in modern browsers
      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])
      return true
    }
    catch {
      // Fallback: not supported (e.g., Firefox, some mobile browsers)
      return false
    }
  }

  const isClipboardImageSupported = computed(() => {
    if (!import.meta.client) return false
    return typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write
  })

  return {
    isShareSupported,
    isClipboardImageSupported,
    generateShareImage,
    shareResults,
    downloadImage,
    copyTextToClipboard,
    copyImageToClipboard,
  }
}
