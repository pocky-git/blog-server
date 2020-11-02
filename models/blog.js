const mongoose = require('../db')

const blogSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    tags:{
        type: Array,
        require: true
    },
    isTop:{
        type: Boolean,
        default: false
    },
    create_time:{
        type: Date,
        default: Date.now
    }
})

const Blog = mongoose.model('blog',blogSchema)

module.exports = Blog