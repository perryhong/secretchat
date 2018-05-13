/**
 * Created by hpq on 2018/4/28.
 */
var sqlmap = {
  user: {
    selectUser: 'select * from user where telephone = ?',
    searchUser: 'select telephone,username,signature,status from user where telephone = ?',
    doLogin: 'update user set status = 1 where telephone = ?',
    doLogout: 'update user set status = 0 where telephone = ?',
    doRegister: 'insert into user(telephone,password,username,status) values(?,?,?,0)',
    getOnlineFriends: 'select u.telephone,u.username,u.signature,u.status from relation r join user u where r.fromUser = ? && r.toUser = u.telephone && u.status = 1',
    addFriends: 'insert into relation(fromUser, toUser) values(?,?)'
  }
}

module.exports = sqlmap
