const express = require('express')
const router = express.Router()
const md5 = require('blueimp-md5')

const User = require('../models/user')
const Tag = require('../models/tag')

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

// 添加标签接口
router.post('/addTag',function(req,res){
  const _id = req.cookies._id
  if(!_id){
    return res.send({code: 1,msg: '请先登录'})
  }
  const {name} = req.body
  Tag.findOne({name},(err,data)=>{
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    if(data){
      return res.send({code: 2,msg: '标签已存在'})
    }else{
      new Tag(req.body).save((err,tag)=>{
        if(err){
          return res.send({code: 500,msg: '服务器错误'})
        }
        res.send({code: 0,data: tag})
      })
    }
  })
})

// 获取标签接口
router.get('/getTag',function(req,res){
  const _id = req.cookies._id
  if(!_id){
    return res.send({code: 1,msg: '请先登录'})
  }
  Tag.find(function(err, tags){
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    res.send({code: 0,data: tags})
  })
})

//删除标签接口
router.post('/deleteTag',function(req,res){
  const _id = req.cookies._id
  if(!_id){
    return res.send({code: 1,msg: '请先登录'})
  }
  const tagId = req.body.id
  Tag.findByIdAndDelete(tagId,function(err,data){
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    if(!data){
      return res.send({code: 2,msg: '标签不存在'})
    }
    res.send({code: 0,msg: '删除成功'})
  })
})

//更新标签接口
router.post('/updateTag',function(req,res){
  const _id = req.cookies._id
  if(!_id){
    return res.send({code: 1,msg: '请先登录'})
  }
  const tagId = req.body.id
  const name = req.body.name
  Tag.findOne({name},(err,data)=>{
    if(err){
      res.send({code: 500,msg: '服务器错误'})
    }
    if(data){
      res.send({code: 3,msg: '标签已存在'})
    }else{
      Tag.findByIdAndUpdate(tagId,{name},function(err,data){
        if(err){
          res.send({code: 500,msg: '服务器错误'})
        }
        if(!data){
          res.send({code: 2,msg: '标签不存在'})
        }
        res.send({code: 0,msg: '更新成功'})
      })
    }
  })
})

//搜索标签接口
router.get('/searchTag',function(req,res){
  const _id = req.cookies._id
  if(!_id){
    return res.send({code: 1,msg: '请先登录'})
  }
  const {searchText} = req.query
  Tag.find({name: eval(`/${searchText}/i`)},function(err,tags){
    if(err){
      res.send({code: 500,msg: '服务器错误'})
    }
    res.send({code: 0,data: tags})
  })
})

module.exports = router
