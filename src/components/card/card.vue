<template>
<div class="card">
  <div class="header">
    <img class="avatar" src="../../../static/images/1.jpg" :alt="username" width="40" height="40">
    <p class="name">{{username}}</p>
    <p class="signature" :title="signature">个性签名:&nbsp;{{signature}}</p>
  </div>
  <div class="mainBtn">
    <i class="icon-exit" @click="doLogout"></i><i class="icon-add-friend" @click="toSearch"></i><i class="icon-message" v-if="friendInvitationMsgs.length !== 0 " @click="openInvitationModel"></i>
  </div>
  <div class="footer">
    <input class="search-friend" type="text" placeholder="search friend...">
  </div>
  <div class="friend-invitation-model" v-if="hasFriendInvitation">
    <i class="icon-close" @click="closeFIModel"></i>
    <div class="model-main">
      <div class="title">收到的好友邀请</div>
      <ul>
        <li v-for="(item, index) in friendInvitationMsgs" class="friendInvitation">
          <img class="avatar" src="../../../static/images/1.jpg" :alt="item.fromUserName" width="40" height="40">
          <p class="name">{{item.fromUserName}}</p>
          <div class="btnGroup">
            <el-button type="success" icon="el-icon-check" circle size="mini" @click="agreeAddFriend(index, item.fromUser)"></el-button>
            <el-button type="danger" icon="el-icon-close" circle size="mini" @click="disagreeAddFriend(index, item.fromUser) "></el-button>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <div class="search-user-model" v-if="showFlag">
    <i class="icon-close" @click="closeSUModel"></i>
    <div class="model-main">
      <div class="searchBox">
        <div class="input-wrapper">
          <input class="search-user" type="text" placeholder="search user..." v-model="searchTel">
        </div>
        <div class="btn-wrapper">
          <el-button icon="el-icon-search" circle @click.stop="doSearch"></el-button>
        </div>
      </div>
      <div class="userinfo-wrapper" v-if="searchRes">
        <div class="userinfo">
          <img class="avatar" src="../../../static/images/1.jpg" :alt="searchedUser.username" width="40" height="40">
          <p class="name">{{searchedUser.username}}</p>
          <p class="signature" :title="searchedUser.signature">个性签名:&nbsp;{{searchedUser.signature}}</p>
        </div>
        <div class="addBtn">
          <span class="text" @click="addFriend(searchedUser.telephone)">添加好友</span>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script type="text/ecmascript-6">
  import axiosAjax from '../../assets/js/func'
  import reqModule from '../../assets/js/module'
export default {
  data() {
    return {
      showFlag: false,
      searchTel: '',
      searchedUser: {
        username: '',
        signature: '',
        telephone: ''
      },
      searchRes: false,
      hasFriendInvitation: false,
      friendInvitationMsgs: []
    }
  },
  computed: {
    username() {
      return this.$store.state.username
    },
    signature() {
      return this.$store.state.signature ? this.$store.state.signature : ''
    }
  },
  mounted() {
    var _this = this
    this.$socket.on('receive addfriend', (addObj) => {
      _this.friendInvitationMsgs.push(addObj)
      console.log(`${addObj.fromUserName}在${addObj.sendTime}给你发来了好友邀请`)
    })
    this.$socket.on('agree your addfriend', (agreeObj) => {
      console.log(`${agreeObj.agreeUserName}在${agreeObj.sendTime}同意了你的好友邀请`)
      _this.$notify({
        message: `${agreeObj.agreeUserName}同意了你的好友邀请`,
        type: 'success',
        duration: 0
      })
      var params1 = {
        friend1: agreeObj.fromUser,
        friend2: agreeObj.agreeUser
      }
      axiosAjax.ajaxPost(reqModule.addFriends, params1, (result1) => {
        if (result1.data.code === '1') {
          var params2 = {
            friend1: agreeObj.agreeUser,
            friend2: agreeObj.fromUser
          }
          axiosAjax.ajaxPost(reqModule.addFriends, params2, (result2) => {
            if (result2.data.code === '1') {
              _this.$emit('initFriendList')
              _this.$socket.emit('init friendlist', agreeObj.agreeUser)
            } else {
              _this.$notify({
                message: result2.data.msg,
                type: 'error',
                duration: 0
              })
            }
          })
        } else {
          _this.$notify({
            message: result1.data.msg,
            type: 'error',
            duration: 0
          })
        }
      })
    })
    this.$socket.on('disagree your addfriend', (disagreeObj) => {
      console.log(`${disagreeObj.disagreeUserName}在${disagreeObj.sendTime}不同意你的好友邀请`)
      _this.$notify({
        message: `${disagreeObj.disagreeUserName}不同意你的好友邀请`,
        type: 'error',
        duration: 0
      })
    })
    this.$socket.on('let u init friendlist', () => {
      console.log('对方要你初始化好友列表')
      _this.$emit('initFriendList')
    })
  },
  methods: {
    doLogout() {
      var _this = this
      this.$confirm('确认退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var telephone = _this.$store.state.telephone
        axiosAjax.ajaxGet(reqModule.doLogout + '?telephone=' + telephone, (result) => {
          if (result.data.code === '1') {
            _this.$socket.emit('user left', telephone)
            _this.$notify({
              message: result.data.msg,
              type: 'success',
              duration: 2000
            })
            _this.$store.commit('updateUserTel', '')
            _this.$store.commit('updateUserName', '')
            _this.$store.commit('updateUserSignature', '')
            _this.$store.commit('updateToUser', '')
            _this.$store.commit('updateToUserName', '')
            _this.$router.push('/login')
          } else {
            _this.$notify({
              message: result.data.msg,
              type: 'error',
              duration: 2000
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    toSearch() {
      this.showFlag = true
    },
    closeSUModel() {
      this.showFlag = false
      this.searchTel = ''
      this.searchRes = false
    },
    doSearch() {
       var _this = this
       axiosAjax.ajaxGet(reqModule.searchUser + '?telephone=' + this.searchTel, (result) => {
         if (result.data.code === '1') {
           _this.searchedUser.telephone = result.data.user.telephone
           _this.searchedUser.username = result.data.user.username
           _this.searchedUser.signature = result.data.user.signature ? result.data.user.signature : ''
           _this.searchRes = true
         } else {
           _this.$notify({
             message: result.data.msg,
             type: 'error',
             duration: 2000
           })
           _this.searchRes = false
         }
       })
    },
    addFriend(telephone) {
      var sendTime = new Date()
      this.$socket.emit('addfriend', telephone, this.$store.state.telephone, this.$store.state.username, sendTime)
      this.$notify({
        message: '好友邀请已发送',
        type: 'success',
        duration: 1000
      })
      this.searchRes = false
      this.searchTel = ''
    },
    openInvitationModel() {
      this.hasFriendInvitation = true
    },
    closeFIModel() {
      this.hasFriendInvitation = false
    },
    agreeAddFriend(index, fromUser) {
      var sendTime = new Date()
      this.$socket.emit('agree addfriend', fromUser, this.$store.state.telephone, this.$store.state.username, sendTime)
      this.friendInvitationMsgs.splice(index, 1)
    },
    disagreeAddFriend(index, fromUser) {
      var sendTime = new Date()
      this.$socket.emit('disagree addfriend', fromUser, this.$store.state.telephone, this.$store.state.username, sendTime)
      this.friendInvitationMsgs.splice(index, 1)
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.card
   padding: 12px
   border-bottom: 1px solid #24272c
   .header
      .avatar,.name
         vertical-align: middle
      .avatar
         border-radius: 2px
      .name
         display: inline-block
         font-size: 16px
         margin: 0 0 0 15px
      .signature
         padding: 10px 0 5px 0
         font-size: 12px
         overflow: hidden
         white-space: nowrap
         text-overflow: ellipsis
   .mainBtn
      margin-top: 5px
      &:after
          content: '.'
          display: block
          height: 0
          line-height: 0
          visibility: hidden
          clear: both
      .icon-message
          color: yellow
          font-weight: 700
          cursor: pointer
          -webkit-animation twinkling 1s infinite ease-in-out
          animation twinkling 1s infinite ease-in-out
      .icon-add-friend,.icon-exit
          float: right
          font-size: 16px
          cursor: pointer
      .icon-add-friend
          margin-right: 10px
   .footer
      margin-top: 10px
      .search-friend
         padding: 0 10px
         width: 100%
         font-size: 12px
         color: #fff
         height: 30px
         line-height: 30px
         border: solid 1px #3a3a3a
         border-radius: 4px
         outline: none
         background: #26292E
   .search-user-model
      position: fixed
      width: 100%
      height: 100%
      top: 0
      left: 0
      z-index: 999
      background: rgba(7,17,27,0.5)
      &>.icon-close
         position: fixed
         top: 30px
         right: 30px
         cursor: pointer
      &>.model-main
         width: 210px
         height: 40px
         position: fixed
         top: 40%
         left: 50%
         margin-top: -20px
         margin-left: -105px
         &>.searchBox
             &>.input-wrapper,&>.btn-wrapper
                display: inline-block
             &>.input-wrapper
                .search-user
                    width: 160px
                    padding: 0 10px
                    height: 40px
                    border: solid 1px #dcdfe6
                    border-radius: 5px
                    outline: none
         &>.userinfo-wrapper
             padding: 10px
             background: #fff
             border-radius: 5px
             color: #2e3238
             margin-top: 10px
             &>.userinfo
                .avatar,.name
                    vertical-align: middle
                .avatar
                    border-radius: 2px
                .name
                    display: inline-block
                    font-size: 16px
                    margin: 0 0 0 15px
                .signature
                    padding: 10px 0 5px 0
                    font-size: 12px
                    overflow: hidden
                    white-space: nowrap
                    text-overflow: ellipsis
             &>.addBtn
                margin-top: 10px
                text-align: center
                &>.text
                    background: #ddd
                    display: block
                    padding: 10px 0
                    cursor: pointer
                    &:hover
                        background: #7e8c8d
   .friend-invitation-model
      position: fixed
      width: 100%
      height: 100%
      top: 0
      left: 0
      z-index: 999
      background: rgba(7,17,27,0.5)
      &>.icon-close
         position: fixed
         top: 30px
         right: 30px
         cursor: pointer
      &>.model-main
         width: 300px
         height: 300px
         position: fixed
         top: 50%
         left: 50%
         margin-top: -150px
         margin-left: -150px
         background: #fff
         &>.title
             text-align: center
             font-size: 16px
             font-weight: 700
             color: #24272c
             height: 35px
             line-height: 35px
             border-bottom: 1px solid #7e8c8d
         ul
             display: block
             height: 265px
             overflow-y: scroll
             &>.friendInvitation
                 display: block
                 padding: 5px 10px
                 color: #7e8c8d
                 border-bottom: 1px solid #ddd
                 &:after
                    height: 0
                    line-height: 0
                    content: '.'
                    clear: both
                    visibility: hidden
                    display: block
                 .avatar,.name
                    vertical-align: middle
                 .avatar
                    border-radius: 2px
                 .name
                    display: inline-block
                    font-size: 16px
                    margin: 0 0 0 15px
                 .btnGroup
                    float: right
@keyframes twinkling
   0%
      opacity: 0.5
   100%
      opacity: 1
@-webkit-keyframes twinkling
   0%
      opacity: 0.5
   100%
      opacity: 1
</style>
