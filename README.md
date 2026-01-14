# pangrum

> A daily word puzzle game.

[👉 &nbsp;Play now](https://pangrum.com/)

## Features

- 🇺🇸🇬🇧🇩🇪🇳🇱🇫🇷🇪🇸 Play in multiple languages
- 🔄 Cross-device progress sync (no login required)
- 🏆 Social sharing of your results
- 📲 Use offline (+ install as a PWA)
- 🌒 Light and dark mode

## Tech Stack

- [Nuxt](https://nuxt.com/) - of course!
- [Nitro](https://nuxt.com/docs/guide/concepts/server-engine#server-engine) - server engine
- [PartyKit](https://partykit.io/) - real-time cross-device sync
- [Hunspell](https://hunspell.github.io/) - word lists
- [`@vite-pwa/nuxt`](https://github.com/vite-pwa/nuxt/) - PWA support
- [`@nuxtjs/color-mode`](https://color-mode.nuxtjs.org/) - theme switching
- [Upstash](https://upstash.com/) - KV storage for persistent data
- [Vercel](https://vercel.com/) - hosting

## 🚧 Roadmap

- [ ] Streak tracking
- [ ] Keyboard shortcuts
- [ ] Internationalisation

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
