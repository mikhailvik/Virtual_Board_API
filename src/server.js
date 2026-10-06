const cors = require('cors')
const express = require('express')
const app = express()
require('dotenv').config()

const PORT = process.env.PORT || 8080

console.log(`Node.js ${process.version}`)

// Allow the API to receive JSON
app.use(express.json())

// Allow requests from the frontend
app.use(cors())

// Serve frontend files
app.use(express.static('project'))

// Test route
app.get('/', (req, res) => {
    res.json({
        msg: "Virtual Board API",
        version: "0.1"
    })
})


const notesRouter = require('./routes/notes')
app.use('/notes', notesRouter)

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`)
})