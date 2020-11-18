const mongoose = require('mongoose')

const aboutSchema = mongoose.Schema({
    nickname: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true
    },
    avantar: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
})

const About = mongoose.model('about',aboutSchema)

module.exports = About