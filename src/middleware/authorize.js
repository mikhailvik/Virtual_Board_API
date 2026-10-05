const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    console.log(`Authorize JWT`)

    try {
        // Get the token from the Authorization header
        const authHeader = req.headers['authorization'] || ''
        const token = authHeader.split(' ')[1]
        console.log(`token: ${token}`)

        // Verify the token using the same secret as Authentication API!
        const user = jwt.verify(token, process.env.JWT_SECRET)
        // And save authenticated user information for the next routes
        req.authUser = user

        console.log(`Token valid for user ${user.sub} ${user.name}`)
        
        next()

    } catch (error) {
        console.log(error)

        return res.status(401).json({
            msg: "Authorization failed",
            error: error.message
        })
    }
}