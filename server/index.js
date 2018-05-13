/**
 * Created by hpq on 2018/4/28.
 */
var http = require('http')
var express = require('express')
var app = express()
var server = http.Server(app)
var path = require('path')
var bodyParser = require('body-parser')
var session = require('express-session')
var userApi = require('./api/userApi')
var db = require('./db').mysql
var mysql = require('mysql')
var $sql = require('./sqlmap')

var pool = mysql.createPool(db)

app.use(express.static(path.join(__dirname, '../static')))
app.use(bodyParser.json())
app.use(session({
  secret: ' secret chat hpq', // 对session id 相关的cookie 进行签名
  resave: false,
  saveUninitialized: false, // 是否保存未初始化的会话
  cookie: {
    maxAge: 1000 * 60 * 60 // 设置 session 的有效时间，单位毫秒
  }
}))
// app.use((req, res, next) => {
//   if (req.session.login) {
//     next()
//   } else {
//     if (req.originalUrl === '/api/user/doLogin' || req.originalUrl === '/api/user/doRegister' || req.originalUrl === '/api/user/getCurrentUser') {
//       next()
//     } else {
//       res.json({
//         code: '5000',
//         msg: '还未登录，请先登录'
//       })
//     }
//   }
// })

app.use('/api/user', userApi)

server.listen(3000, function () {
  console.log('the server is running at port 3000')
})

var io = require('socket.io')(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
})
var usocket = {}
var friends = []
var addFriendMsg = {}
var addMsgs = []
var agreeFriendMsg = {}
var agreeMsgs = []
var disagreeFriendMsg = {}
var disagreeMsgs = []
var cleanSocketTimer = null
io.on('connection', (socket) => {
  console.log('客户端连接成功')
  socket.on('new join', (telephone) => {
     cleanSocketTimer = setTimeout(() => {
       if (telephone in usocket) {
         delete usocket[telephone]
       }
       clearTimeout(cleanSocketTimer)
     }, 1000 * 60 * 60.1)
     console.log(telephone + '用户发起聊天')
     if (telephone in usocket) {
       delete usocket[telephone]
     }
     socket.telephone = telephone
     usocket[telephone] = socket
     pool.getConnection((err, conn) => {
       var sql = $sql.user.getOnlineFriends
       conn.query(sql, telephone, (err, result) => {
         if (err) {
           throw err
         }
         friends = result
         for (var i = 0; i < friends.length; i++) {
             usocket[friends[i].telephone].emit('login')
         }
         conn.release()
       })
     })
     if (telephone in addFriendMsg) {
       for (var i = 0; i < addFriendMsg[telephone].length; i++) {
         usocket[telephone].emit('receive addfriend', addFriendMsg[telephone][i])
       }
       addFriendMsg[telephone] = []
     }
     if (telephone in agreeFriendMsg) {
       for (var j = 0; j < agreeFriendMsg[telephone].length; j++) {
         usocket[telephone].emit('agree your addfriend', agreeFriendMsg[telephone][j])
       }
       agreeFriendMsg[telephone] = []
     }
    if (telephone in disagreeFriendMsg) {
      for (var k = 0; k < disagreeFriendMsg[telephone].length; k++) {
        usocket[telephone].emit('disagree your addfriend', disagreeFriendMsg[telephone][k])
      }
      disagreeFriendMsg[telephone] = []
    }
  })
  socket.on('user left', (telephone) => {
    console.log('用户退出')
    if (cleanSocketTimer) {
      clearTimeout(cleanSocketTimer)
    }
    if (telephone in usocket) {
      delete usocket[telephone]
    }
    pool.getConnection((err, conn) => {
      var sql = $sql.user.getOnlineFriends
      conn.query(sql, telephone, (err, result) => {
        if (err) {
          throw err
        }
        friends = result
        for (var i = 0; i < friends.length; i++) {
          if (friends[i].telephone in usocket) {
            usocket[friends[i].telephone].emit('logout')
          }
        }
        conn.release()
      })
    })
  })
  socket.on('send private msg', (msg, toUser, fromUser) => {
     console.log('收到客户端发来的信息')
     pool.getConnection((err, conn) => {
       var telTail1 = fromUser.substr(7)
       var sql1 = 'insert into ch' + telTail1 +
         '(fromUser, toUser, content, sendTime) values(?,?,?,?)'
       var sendTime = new Date()
       conn.query(sql1, [fromUser, toUser, msg, sendTime], (err, result) => {
         if (err) {
           throw err
         }
         if (result.affectedRows > 0) {
           if (fromUser in usocket) {
             console.log('向发送的客户端发送消息')
             usocket[fromUser].emit('u send private msg', {msg: msg, toUser: toUser, sendTime: sendTime})
           }
           var telTail2 = toUser.substr(7)
           var sql2 = 'insert into ch' + telTail2 +
             '(fromUser, toUser, content, sendTime) values(?,?,?,?)'
           conn.query(sql2, [fromUser, toUser, msg, sendTime], (err, result) => {
             if (err) {
               throw err
             }
             if (result.affectedRows > 0) {
               if (toUser in usocket) {
                 console.log('向接收的客户端发送消息')
                 usocket[toUser].emit('u receive private msg', {msg: msg, fromUser: fromUser, sendTime: sendTime})
               }
             }
           })
         }
         conn.release()
       })
     })
  })
  socket.on('addfriend', (toUser, fromUser, fromUserName, sendTime) => {
     console.log('收到客户端发来的好友邀请')
     if (toUser in usocket) {
       console.log('向客户端发送好友邀请')
       usocket[toUser].emit('receive addfriend', {fromUser: fromUser, fromUserName: fromUserName, sendTime: sendTime})
     } else {
       var addMsg = {
         toUser: toUser,
         fromUser: fromUser,
         fromUserName: fromUserName,
         sendTime: sendTime
       }
       addMsgs.push(addMsg)
       addFriendMsg[toUser] = addMsgs
     }
  })

  socket.on('agree addfriend', (fromUser, agreeUser, agreeUserName, sendTime) => {
    console.log('收到客户端同意了好友邀请')
    if (fromUser in usocket) {
      console.log('向客户端发送好友邀请已通过')
      usocket[fromUser].emit('agree your addfriend', {fromUser: fromUser, agreeUser: agreeUser, agreeUserName: agreeUserName, sendTime: sendTime})
    } else {
      var agreeMsg = {
        fromUser: fromUser,
        agreeUser: agreeUser,
        agreeUserName: agreeUserName,
        sendTime: sendTime
      }
      agreeMsgs.push(agreeMsg)
      agreeFriendMsg[fromUser] = agreeMsgs
    }
  })
  socket.on('disagree addfriend', (fromUser, disagreeUser, disagreeUserName, sendTime) => {
    console.log('收到客户端不同意好友邀请')
    if (fromUser in usocket) {
      console.log('向客户端发送好友邀请没有通过')
      usocket[fromUser].emit('disagree your addfriend', {fromUser: fromUser, disagreeUser: disagreeUser, disagreeUserName: disagreeUserName, sendTime: sendTime})
    } else {
      var disagreeMsg = {
        fromUser: fromUser,
        disagreeUser: disagreeUser,
        disagreeUserName: disagreeUserName,
        sendTime: sendTime
      }
      disagreeMsgs.push(disagreeMsg)
      disagreeFriendMsg[fromUser] = disagreeMsgs
    }
  })
  socket.on('init friendlist', (agreeUser) => {
    console.log('初始化对方的好友列表')
    if (agreeUser in usocket) {
      console.log('初始化好友列表')
      usocket[agreeUser].emit('let u init friendlist')
    }
  })
  socket.on('disconnect', () => {
     console.log('客户端断开连接')
     if (socket.telephone in usocket) {
       delete usocket[socket.telephone]
     }
  })
})
