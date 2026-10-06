// Source: Developed with guidance from OpenAI ChatGPT
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')  // object destructuring
const authorize = require('../middleware/authorize')

const prisma = new PrismaClient()

// All routes in this file require a valid JWT
router.use(authorize)

// Get notes from the board
router.get('/', async (req, res) => {

    // Board id comes from the query
    const boardId = Number(req.query.board_id)

    // Find the board
    const board = await prisma.boards.findUnique({
        where: { id: boardId }
    })

    // Check if the board exists
    if (!board) {
        return res.status(404).send({
            msg: "Board not found!!!"
        })
    }

    // Check if the logged-in user has access to this board
    if (!board.allowed_users.includes(Number(req.authUser.sub))) {
        return res.status(403).send({
            msg: "Access denied!!!"
        })
    }

    // Get all notes from the board
    const notes = await prisma.notes.findMany({
        where: { board_id: boardId },
        orderBy: { id: 'asc' }
    })

    res.send(notes)
})



// Create new note
router.post('/', async (req, res) => {

    // Board id comes from the request body
    const boardId = Number(req.body.board_id)

    // Find the board
    const board = await prisma.boards.findUnique({
        where: { id: boardId }
    })

    // Check if the board exists
    if (!board) {
        return res.status(404).send({
            msg: "Board not found"
        })
    }

    // Check if the logged-in user has access to the board
    if (!board.allowed_users.includes(Number(req.authUser.sub))) {
        return res.status(403).send({
            msg: "Access denied"
        })
    }

    // Create note
    const note = await prisma.notes.create({
        data: {
            board_id: boardId,
            author_id: Number(req.authUser.sub),
            note: req.body.note,
            color: req.body.color || "yellow",
            position_x: req.body.position_x || 50,
            position_y: req.body.position_y || 50
        }
    })

    res.status(201).send({
        msg: "Note created",
        id: note.id
    })
})



// Update note
router.put('/:id', async (req, res) => {

    const noteId = Number(req.params.id)

    // Find note
    const existingNote = await prisma.notes.findUnique({
        where: { id: noteId }
    })

    // Check if the note exists
    if (!existingNote) {
        return res.status(404).send({
            msg: "Note not found"
        })
    }

    // Find board that contains this note
    const board = await prisma.boards.findUnique({
        where: { id: existingNote.board_id }
    })

    // Check if logged-in user has access to this board
    if (!board.allowed_users.includes(Number(req.authUser.sub))) {
        return res.status(403).send({
            msg: "Access denied"
        })
    }

    // Update note
    const updatedNote = await prisma.notes.update({
        where: { id: noteId },
        data: {
            note: req.body.note,
            color: req.body.color,
            position_x: req.body.position_x,
            position_y: req.body.position_y,
            updated_at: new Date()
        }
    })

    res.send({
        msg: "Note updated",
        id: updatedNote.id,
        updatedNote: updatedNote
    })
})


// Delete note
router.delete('/:id', async (req, res) => {

    const noteId = Number(req.params.id)

    // Find note
    const existingNote = await prisma.notes.findUnique({
        where: { id: noteId }
    })

    // Check if note exists
    if (!existingNote) {
        return res.status(404).send({
            msg: "Note not found"
        })
    }

    // Find board that contains this note
    const board = await prisma.boards.findUnique({
        where: { id: existingNote.board_id }
    })

    // Check if logged-in user has access to this board
    if (!board.allowed_users.includes(Number(req.authUser.sub))) {
        return res.status(403).send({
            msg: "Access denied"
        })
    }

    // Delete note
    const deletedNote = await prisma.notes.delete({
        where: { id: noteId }
    })

    res.send({
        msg: "Note deleted",
        id: deletedNote.id
    })
})

module.exports = router