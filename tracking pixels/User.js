const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email : {
        type: String, 
        required: true
    },

    counter: {
        type: Number,
        default: 0
    },
    ip: {
        type: String,
    },
    location: {
        type: String
    },
    openedDate: {
        type: Date
    }
})


const User = mongoose.model('User', UserSchema);

module.exports = User;