const mongoose = require('../db')

const tagSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    create_time: {
        type: Date,
        default: Date.now
    }
})

const Tag = mongoose.model('tag',tagSchema)

module.exports = Tag