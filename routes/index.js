const express = require('express')
const router = express.Router()
const md5 = require('blueimp-md5')

const User = require('../models/user')

//登录接口
router.post('/login', function(req, res) {
  const {username,password} = req.body
  User.findOne({
    username,
    password: md5(md5(password))
  },
  {
    password: 0,
    __v: 0
  }
  ,(err,user)=>{
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    if(!user){
      return res.send({code: 1,msg: '用户名或密码错误'})
    }
    res.cookie('_id',user._id,{maxAge: 1000*60*60*24})
    res.send({code: 0,data: user})
  })
})

//自动登录接口
router.get('/user',function(req,res){
  const _id = req.cookies._id
  if(!_id){
    return res.send({code: 1,msg: '请先登录'})
  }
  User.findOne(
    {
      _id
    },
    {
      password: 0,
      __v: 0
    },
    (err,user) => {
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    res.cookie('_id',user._id,{maxAge: 1000*60*60*24})
    res.send({code: 0,data: user})
  })
})

module.exports = router
