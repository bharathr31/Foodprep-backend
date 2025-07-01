const express = require("express")
const app = express()
const connectDB = require('./config/dbConn')

const port = process.env.PORT || 4000;

//middlware
app.use(express.json())
const cors = require('cors')
app.use(cors())
require("dotenv").config()
app.use("/image",express.static('uploads'))


//routes
//api endpoints
app.use("/api/food",require('./routes/foodRouter'))
app.use("/api/user",require('./routes/userRouter'))
app.use("/api/cart",require('./routes/cartRouter'))
app.use("/api/order",require('./routes/orderRouter'))

connectDB()


app.get('/',(req,res)=>
{
    res.send("API WORKING")
})

app.listen(port,()=>{
    console.log(`server started on http://localhost:${port}`)
})