const mongoose = require('mongoose')
const connect = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("DB connected");
    } catch (error) {
        console.log("Connect failure", error);
    }
}

module.exports = { connect }