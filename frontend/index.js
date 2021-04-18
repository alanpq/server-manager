const express = require('express')
const app = express()
const port = process.env.PORT || 80

app.set('view engine', 'pug')
app.use(express.static("static"))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/server', (req, res) => {
  res.render('server')
})

app.listen(port, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`)
})