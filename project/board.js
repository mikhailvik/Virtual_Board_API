// Virtual Board API
const API_URL = 'http://localhost:3001'

// Get JWT saved after login
const token = localStorage.getItem('token')

// Board that we are currently using
const boardId = 1

// Load all notes from the board------------------------------

async function loadNotes() {

    try {
        const response = await fetch(
            `${API_URL}/notes?board_id=${boardId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )

        if (!response.ok) {
            console.log('Could not load notes')
            return
        }

        const notes = await response.json()
        console.log('Notes:', notes)

// Show notes on the board-------------------------------------------

        const board = document.getElementById('board')

// Clear old notes before showing them again---------------------------
        board.innerHTML = ''

        notes.forEach(note => {

            // Create note element
            const noteElement = document.createElement('div')

            noteElement.className = 'note'
            /*noteElement.textContent = note.note*/

            // Note text
            const noteText = document.createElement('div')
            noteText.textContent = note.note
            noteElement.appendChild(noteText)

//Color button note------------------------------------

            // Color button
            const colorButton = document.createElement('button')
            colorButton.textContent = 'Color'
            colorButton.className = 'color-button'
            noteElement.appendChild(colorButton)

            // Change note color
            colorButton.addEventListener('click', async (event) => {

            event.stopPropagation()

            // Change between yellow and pink
            let newColor = 'pink'

            if (noteElement.style.backgroundColor === 'pink') {
                newColor = 'yellow'
            }

            noteElement.style.backgroundColor = newColor

            // Save new color in database
            const response = await fetch(`${API_URL}/notes/${note.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    note: note.note,
                    color: newColor,
                    position_x: noteElement.offsetLeft,
                    position_y: noteElement.offsetTop
                })
            })

        if (response.ok) {
            console.log('Color updated')
        }
    })

//Edit button note------------------------------------

            // Edit button
            const editButton = document.createElement('button')
            editButton.textContent = 'Edit'
            editButton.className = 'edit-button'
            noteElement.appendChild(editButton)

            // Do not drag the note when clicking Edit
            editButton.addEventListener('mousedown', (event) => {
                event.stopPropagation()
            })

            editButton.addEventListener('click', async (event) => {

                event.stopPropagation()

                // Change note text
                noteText.contentEditable = true
                noteText.focus()
                editButton.textContent = 'Save'

                editButton.onclick = async () => {

                    const newText = noteText.textContent

                    const response = await fetch(`${API_URL}/notes/${note.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            note: newText,
                            color: note.color,
                            position_x: noteElement.offsetLeft,
                            position_y: noteElement.offsetTop
                        })
                    })

                    if (response.ok) {
                        noteText.contentEditable = false
                        editButton.textContent = 'Edit'
                        console.log('Note updated')
                    }
                }
            })

//Delete button note------------------------------------

            // Delete button
            const deleteButton = document.createElement('button')
            deleteButton.textContent = 'Delete'
            deleteButton.className = 'delete-button'
            noteElement.appendChild(deleteButton)

                // Delete note
                deleteButton.addEventListener('click', async (event) => {

                    event.stopPropagation()

                    const response = await fetch(`${API_URL}/notes/${note.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })

                    if (response.ok) {
                        console.log('Note deleted')
                        loadNotes()
                    }
                })



            // Set note position
            noteElement.style.left = `${note.position_x}px`
            noteElement.style.top = `${note.position_y}px`

            // Set note color
            noteElement.style.backgroundColor = note.color

                //Var1 move note with the mouse
                /*let isDragging = false

                noteElement.addEventListener('mousedown', () => {
                    isDragging = true
                })

                document.addEventListener('mousemove', (event) => {
                    if (isDragging) {
                        noteElement.style.left = event.clientX + 'px'
                        noteElement.style.top = event.clientY + 'px'
                    }
                })

                document.addEventListener('mouseup', () => {
                    isDragging = false
                })*/

                // Move note with the mouse
                noteElement.addEventListener('mousedown', (event) => {

                    if (event.target.tagName === 'BUTTON') {
                        return
                    }

                    const startX = event.clientX
                    const startY = event.clientY

                    const startLeft = noteElement.offsetLeft
                    const startTop = noteElement.offsetTop

                    function moveNote(event) {
                        noteElement.style.left =
                            `${startLeft + event.clientX - startX}px`

                        noteElement.style.top =
                            `${startTop + event.clientY - startY}px`
                    }

                    /*function stopMoving() {
                        document.removeEventListener('mousemove', moveNote)
                        document.removeEventListener('mouseup', stopMoving)
                    }*/

                    async function stopMoving() {

                        document.removeEventListener('mousemove', moveNote)
                        document.removeEventListener('mouseup', stopMoving)

                        // Save new position in database
                        await fetch(`${API_URL}/notes/${note.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                note: note.note,
                                color: note.color,
                                position_x: noteElement.offsetLeft,
                                position_y: noteElement.offsetTop
                            })
                        })

                        console.log(
                            'New position saved:',
                            noteElement.offsetLeft,
                            noteElement.offsetTop
                        )
                    }

                    document.addEventListener('mousemove', moveNote)
                    document.addEventListener('mouseup', stopMoving)

                })

            


            // Add note to the board
            board.appendChild(noteElement)
        })

    } catch (error) {
        console.error('Error loading notes:', error)
    }
}

// Load notes when the board page opens
loadNotes()


// Add new note button
const addNoteButton = document.getElementById('add-note-button')

addNoteButton.addEventListener('click', async () => {

    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                board_id: boardId,
                note: 'New note',
                position_x: 80,
                position_y: 80,
                color: 'yellow'
            })
        })

        if (!response.ok) {
            console.log('Could not create note!!!')
            return
        }

        const data = await response.json()
        console.log('Yes, note created:', data)

        // Reload notes after creating a new one
        loadNotes()

    } catch (error) {
        console.error('Error!!! creating note:', error)
    }
})

// Reload notes every 5 seconds
    setInterval(loadNotes, 15000)