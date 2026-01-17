<p align="center">
  <a href="https://pangrum.com/">
    <img width="80" src="https://pangrum.com/logo.svg" alt="Pangrum logo">
  </a>
</p>

<h1 align="center">pangrum</h1>

<p align="center">
  A daily word puzzle game.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/nuxt-4-00DC82?logo=nuxt.js" alt="Nuxt 4">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License">
  <a href="https://page-speed.dev/pangrum.com"><img src="https://page-speed.dev/badge/pangrum.com" alt="Core Web Vitals"></a>
</p>

<p align="center">
  <a href="https://pangrum.com/">
    <img height="400" alt="Pangrum mobile screenshot" src="https://github.com/user-attachments/assets/bd32f0ec-0db4-46ab-9fce-3b7b08b49279" />
  </a>
  &nbsp;&nbsp;
  <a href="https://pangrum.com/">
    <img height="400" alt="Pangrum desktop screenshot" src="https://github.com/user-attachments/assets/59559065-5fc8-4984-870e-c35073910ec3" />
  </a>
</p>

<p align="center">
  <a href="https://pangrum.com/"><strong>👉 Play now</strong></a>
</p>

## Features

- 🇺🇸🇬🇧🇩🇪🇳🇱🇫🇷🇪🇸 Play in multiple languages
- 🔄 Cross-device progress sync (no login required)
- 🏆 Social sharing of your results
- 📲 Use offline (+ install as a PWA)
- 🟢 Streak tracking
- 🌒 Light and dark mode

## Tech Stack

- [Nuxt](https://nuxt.com/) - of course!
- [Nitro](https://nuxt.com/docs/guide/concepts/server-engine#server-engine) - server engine
- [PartyKit](https://partykit.io/) - real-time cross-device sync
- [Hunspell](https://hunspell.github.io/) - word lists
- [`@vite-pwa/nuxt`](https://github.com/vite-pwa/nuxt/) - PWA support
- [`@nuxtjs/color-mode`](https://color-mode.nuxtjs.org/) - theme switching
- [`@nuxtjs/i18n`](https://i18n.nuxtjs.org/) - UI internationalisation (EN, DE, ES, FR, NL)
- [Upstash](https://upstash.com/) - KV storage for persistent data
- [Vercel](https://vercel.com/) - hosting

## 🚧 Roadmap

- [ ] Keyboard shortcuts on desktop
- [ ] Mobile app (using [Capacitor](https://capacitorjs.com/))

## Try it out locally

### Setup

```bash
# install dependencies
corepack enable
pnpm install

# serve in dev mode, with hot reload at localhost:3000
pnpm dev

# build for production
pnpm build

# preview in production mode
pnpm preview
```

### Testing

```bash
# run all tests
pnpm test

# run tests in watch mode
pnpm test:watch

# run e2e tests
pnpm test:e2e
```

## License

Made with ❤️

Published under [MIT License](./LICENSE).
