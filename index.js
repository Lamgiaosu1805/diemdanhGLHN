const express = require('express')
const app = express()
const route = require('./src/routes')
const morgan = require('morgan')
const db = require('./src/config/connectdb')
const cors = require('cors');

const dotenv = require('dotenv');

dotenv.config();

app.use(cors());

//use middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

//routing
route(app);

//connectdb
db.connect()

const port = process.env.PORT

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})