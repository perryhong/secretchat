/**
 * Created by hpq on 2018/4/28.
 */
var db = require('../db').mysql
var express = require('express')
var router = express.Router()
var mysql = require('mysql')
var formidable = require('formidable')
var $sql = require('../sqlmap')
var session = require('express-session')

var pool = mysql.createPool(db)

// 注册验证账号是否存在
router.post('/checkNewUser', (req, res) => {
  var params = req.body
  pool.getConnection((err, conn) => {
    var sql = $sql.user.searchUser
    conn.query(sql, params.telephone, (err, result) => {
      if (err) {
        throw err
      }
      if (result.length > 0) {
        res.json({
          code: '-1',
          msg: '账号已存在'
        })
      } else {
        res.json({
          code: '1',
          msg: '账号可用'
        })
      }
      conn.release()
    })
  })
  return
})

router.post('/doRegister', (req, res) => {
  var form = new formidable.IncomingForm()
  form.parse(req, (err, fields, files) => {
    var telephone = fields.telephone
    var password = fields.password
    var username = fields.username
    pool.getConnection((err, conn) => {
      var sql = $sql.user.doRegister
      conn.query(sql, [telephone, password, username], (err, result) => {
        if (err) {
          throw err
        }
        if (result.affectedRows > 0) {
          res.json({
            code: '1',
            msg: '注册成功'
          })
        } else {
          res.json({
            code: '-1',
            msg: '注册失败'
          })
        }
        conn.release()
      })
    })
  })
  return
})

router.post('/doLogin', (req, res) => {
  var form = new formidable.IncomingForm()
  form.parse(req, (err, fileds, files) => {
    var telephone = fileds.telephone
    var password = fileds.password
    pool.getConnection((err, conn) => {
      var sql1 = $sql.user.selectUser
      conn.query(sql1, telephone, (err1, result1) => {
        if (err1) {
          throw err1
        }
        if (result1.length > 0) {
          if (result1[0].password === password) {
            var sql2 = $sql.user.doLogin
            conn.query(sql2, telephone, (err2, result2) => {
              if (err2) {
                throw err2
              }
              if (result2.affectedRows > 0) {
                req.session.login = true
                req.session.telephone = result1[0].telephone
                req.session.username = result1[0].username
                req.session.signature = result1[0].signature
                sessionListener(result1[0].telephone)
                res.json({
                  code: '1',
                  telephone: result1[0].telephone,
                  username: result1[0].username,
                  signature: result1[0].signature,
                  msg: '登录成功'
                })
              } else {
                res.json({
                  code: '-1',
                  msg: '登录失败'
                })
              }
            })
          } else {
            res.json({
              code: '-1',
              msg: '登录失败，密码错误'
            })
          }
        } else {
          res.json({
            code: '-1',
            msg: '不存在该账号，请先注册'
          })
        }
        conn.release()
      })
    })
  })
  return
})

function sessionListener(telephone) {
  var logoutUser = telephone
  var timer = setTimeout(() => {
    pool.getConnection((err, conn) => {
      var sql = $sql.user.doLogout
      conn.query(sql, logoutUser, (err, result) => {
        if (err) {
          throw err
        }
        clearTimeout(timer)
      })
    })
  }, 1000 * 60 * 60.1)
}

router.get('/doLogout', (req, res) => {
  var telephone = req.query.telephone
  pool.getConnection((err, conn) => {
    var sql = $sql.user.doLogout
    conn.query(sql, telephone, (err, result) => {
      if (err) {
        throw err
      }
      if (result.affectedRows > 0) {
        req.session.destroy((err) => {
          if (err) {
            res.json({
              code: '-1',
              msg: '退出登录失败'
            })
            return
          }
          res.json({
            code: '1',
            msg: '退出登录成功'
          })
        })
      } else {
        res.json({
          code: '-1',
          msg: '退出登录失败'
        })
      }
    })
    conn.release()
  })
  return
})

router.get('/getCurrentUser', (req, res) => {
  if (req.session.login) {
    res.json({
      code: '1',
      telephone: req.session.telephone,
      username: req.session.username,
      signature: req.session.signature,
      msg: '已登录'
    })
  } else {
    res.json({
      code: '-1',
      msg: '还未登录，请先登录'
    })
  }
  return
})

router.get('/searchUser', (req, res) => {
  var telephone = req.query.telephone
  pool.getConnection((err, conn) => {
    var sql = $sql.user.searchUser
    conn.query(sql, telephone, (err, result) => {
      if (err) {
        throw err
      }
      if (result.length > 0) {
        res.json({
          code: '1',
          user: result[0]
        })
      } else {
        res.json({
          code: '-1',
          msg: '查询不到用户'
        })
      }
      conn.release()
    })
  })
  return
})

router.get('/getOnlineFriends', (req, res) => {
  if (req.session.login) {
    var telephone = req.session.telephone
    pool.getConnection((err, conn) => {
      var sql = $sql.user.getOnlineFriends
      conn.query(sql, telephone, (err, result) => {
        if (err) {
          throw err
        }
        res.json({
          code: '1',
          friends: result
        })
        conn.release()
      })
    })
  }
  return
})

router.post('/addfriends', (req, res) => {
  var params = req.body
  var friend1 = params.friend1
  var friend2 = params.friend2
  pool.getConnection((err, conn) => {
    var sql = $sql.user.addFriends
    conn.query(sql, [friend1, friend2], (err, result) => {
      if (err) {
        throw err
      }
      if (result.affectedRows > 0) {
        res.json({
          code: '1',
          msg: '添加成功'
        })
      } else {
        res.json({
          code: '-1',
          msg: '添加失败'
        })
      }
      conn.release()
    })
  })
  return
})

router.post('/createTable', (req, res) => {
  var params = req.body
  var telTail = params.telephone.substr(7)
  pool.getConnection((err, conn) => {
    var sql = 'create table ch' + telTail + '(' +
    'hisid int(11) primary key auto_increment not null,' +
    'fromUser varchar(255) not null,' +
    'toUser varchar(255) not null,' +
    'content varchar(10000) not null,' +
    'sendTime datetime not null)'
    conn.query(sql, (err, result) => {
      if (err) {
        throw err
      }
      conn.release()
    })
  })
})

module.exports = router
