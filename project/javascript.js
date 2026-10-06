// Authentication API
//const AUTH_API = 'http://localhost:8080'
const AUTH_API = 'https://virtual-board-authentication.onrender.com'

// Login form get elements
const loginForm = document.getElementById('login-form')
const loginMessage = document.getElementById('login-message')

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    // Get email and password from the form
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value


    try {
        // Send login request to Authentication API
        const response = await fetch(`${AUTH_API}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })

        const data = await response.json()

        if (!response.ok) {
            loginMessage.textContent = data.msg || 'Login failed!'
            return
        }

        // Save JWT token for requests to Virtual Board API
        localStorage.setItem('token', data.jwt)

        /*loginMessage.textContent = 'Login successful!'

        console.log('Logged in user:', data.id)*/


        // Open the Virtual Board page
        window.location.href = 'board.html'

    } catch (error) {
        console.error(error)
        loginMessage.textContent = 'Could not connect to Authentication API!'
    }
})