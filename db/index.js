const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/blog')

const conn = mongoose.connection

conn.on('connected',()=>{
    console.log('数据库连接成功!')
})

module.exports = mongoose