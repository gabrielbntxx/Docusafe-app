const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const port = parseInt(process.env.PORT || '3000', 10)
const hostname = '0.0.0.0' // Always bind to 0.0.0.0 for Railway
const dev = process.env.NODE_ENV !== 'production'

console.log(`Environment PORT: ${process.env.PORT}`)
console.log(`Using port: ${port}`)
console.log(`Binding to: ${hostname}`)

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, hostname, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
