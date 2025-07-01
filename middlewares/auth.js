const jwt = require("jsonwebtoken")

const authMiddleware = async(req,res,next)=>{
    const {token} = req.headers;
    if(!token) 
        res.status(401).json({"message":"token missing"})
    try {
        const token_decode = jwt.verify(
            token,
            process.env.JWT_TOKEN_SECRET
        )
        req.userId = token_decode.id;
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({"message":"token is invalid"})
    }
}
module.exports = authMiddleware