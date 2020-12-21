const express = require('express')
const app = express()
const port = 5111

app.use('/bs',express.static('experiement.json'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})