const mongoose = require("mongoose");


const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MY_DATABASE_URL);
    } catch (err) {
        console.log(err)
    }
}

module.exports = ConnectDB