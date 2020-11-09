const express = require('express')
const router = express.Router()
const md5 = require('blueimp-md5')

const User = require('../models/user')
const Tag = require('../models/tag')
const Blog = require('../models/blog')

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
  Blog.find(function(err,blogs){
    blogs.forEach(blog=>{
      const {tags} = blog
      if(tags.indexOf(tagId)!==-1 && tags.length!==1){
        tags.splice(tags.findIndex(tag=>tag===tagId),1)
        new Blog(blog).save()
      }else if(tags.indexOf(tagId)!==-1 && tags.length===1){
        Blog.findByIdAndDelete(blog._id,function(err,data){
          
        })
      }
    })
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
      return res.send({code: 500,msg: '服务器错误'})
    }
    if(data){
      res.send({code: 3,msg: '标签已存在'})
    }else{
      Tag.findByIdAndUpdate(tagId,{name},function(err,data){
        if(err){
          return res.send({code: 500,msg: '服务器错误'})
        }
        if(!data){
          return res.send({code: 2,msg: '标签不存在'})
        }
        res.send({code: 0,msg: '更新成功'})
      })
    }
  })
})

//搜索标签接口
router.get('/searchTag',function(req,res){
  const {searchText} = req.query
  Tag.find({name: eval(`/${searchText}/i`)},function(err,tags){
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    res.send({code: 0,data: tags})
  })
})

//添加博客接口
router.post('/addBlog',function(req,res){
  const _id = req.cookies._id
  if(!_id){
    return res.send({code: 1,msg: '请先登录'})
  }
  new Blog(req.body).save(function(err,blog){
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    res.send({code: 0,data: blog})
  })
})

//获取博客列表接口
router.get('/getBlog',function(req,res){
  const {tagId} = req.query
  if(!tagId){
    Blog.find(function(err,blogs){
      if(err){
        return res.send({code: 500,msg: '服务器错误'})
      }
      res.send({code: 0,data: blogs})
    })
  }else{
    Blog.find(function(err,blogs){
      if(err){
        return res.send({code: 500,msg: '服务器错误'})
      }
      res.send({code: 0,data: blogs.filter(blog=>blog.tags.indexOf(tagId)!==-1)})
    })
  }
})

//设置博客置顶
router.post('/setBlogTop',function(req,res){
  const _id = req.cookies._id
  if(!_id){
    return res.send({code: 1,msg: '请先登录'})
  }
  const {blogId,isTop} = req.body
  Blog.findByIdAndUpdate(blogId,{isTop},function(err,blog){
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    if(!blog){
      return res.send({code: 2,msg: '博客不存在'})
    }
    res.send({code: 0,data: '置顶成功'})
  })

})

//删除博客
router.post('/deleteBlog',function(req,res){
  const _id = req.cookies._id
  if(!_id){
    return res.send({code: 1,msg: '请先登录'})
  }
  const {blogId} = req.body
  Blog.findByIdAndDelete(blogId,function(err,data){
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    if(!data){
      return res.send({code: 2,msg: '博客不存在'})
    }
    res.send({code: 0,msg: '删除成功'})
  })
})

//搜索博客接口
router.get('/searchBlog',function(req,res){
  const {searchText} = req.query
  Blog.find({title: eval(`/${searchText}/i`)},function(err,blogs){
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    res.send({code: 0,data: blogs})
  })
})

//更新博客接口
router.post('/updateBlog',function(req,res){
  const _id = req.cookies._id
  if(!_id){
    return res.send({code: 1,msg: '请先登录'})
  }
  const blogId = req.body._id
  Blog.findByIdAndUpdate(blogId,req.body,function(err,blog){
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    if(!blog){
      return res.send({code: 2,msg: '博客不存在'})
    }
    res.send({code: 0,msg: '更新成功'})
  })
})

//获取文章详情
router.get('/getBlogDetail',function(req,res){
  const id = req.query.id
  Blog.findById(id,function(err,detail){
    if(err){
      return res.send({code: 500,msg: '服务器错误'})
    }
    if(!detail){
      return res.send({code: 2,msg: '博客不存在'})
    }
    res.send({code: 0,data: detail})
  })
})

module.exports = router
