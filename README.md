# 🌍 Primordium

**Primordium** is an interactive game inspired by the book *How to Invent Everything*. The goal is to combine primitive elements and technologies to unlock scientific discoveries, rebuild civilization from scratch, and explore the evolution of human knowledge.

This project is built with React, D3, Matter.js, and supports multiple languages via i18next. It is also PWA-compatible and production-ready with Docker.

## 🚀 Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode.  
Open [`http://localhost:3000`](http://localhost:3000) to view it in the browser.

### `npm run build`
Builds the app for production into the `build/` folder.

### `npm test`
Runs tests using React Testing Library.

### `npm run eject`
Ejects all CRA config and dependencies. Use with caution.

## 🧱 Tech Stack

- **React 19**
- **D3.js** for interactive visualizations
- **Matter.js** for physics simulation
- **i18next** for multilanguage support (`en`, `pt`)
- **PWA** support
- **Docker** with Nginx for production

## 🐳 Run with Docker

Build and start the container:

```bash
docker compose up --build
```

Then access it at `http://localhost:3052` (or your configured port).

## 🌐 Deployment

For production, use the Docker image and configure a reverse proxy (e.g., Nginx) to point to the container port.

## 📚 Inspired by

[How to Invent Everything](https://www.howtoinventeverything.com/)

## 📖 License

MIT
