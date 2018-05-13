<template>
<div class="friendlist">
  <ul>
    <li v-for="(item, index) in friends" v-bind:key="item.telephone" class="friend-item" :class="{'active': index === currentIndex}" @click="selectToChat(index, item.telephone, item.username)">
      <img class="avatar" src="../../../static/images/1.jpg" :alt="item.username" width="40" height="40">
      <p class="name">{{item.username}}</p>
      <p class="signature" :title="item.signature">个性签名:&nbsp;{{item.signature}}</p>
      <p class="newMsg">{{item.newMsg ? item.newMsg : ''}}</p>
    </li>
  </ul>
</div>
</template>

<script type="text/ecmascript-6">
  import axiosAjax from '../../assets/js/func'
  import module from '../../assets/js/module'
export default {
  data () {
    return {
      friends: [],
      currentIndex: -1
    }
  },
  mounted() {
    this.initFriendList()
    var _this = this
    this.$socket.on('login', () => {
      _this.initFriendList()
    })
    this.$socket.on('logout', () => {
      _this.initFriendList()
    })
    this.$socket.on('u receive private msg', (msgObj) => {
      console.log('你收到了消息')
      console.log(`${msgObj.fromUser}在${msgObj.sendTime}发来了信息：${msgObj.msg}`)
    })
    this.$socket.on('u send private msg', (msgObj) => {
      console.log(`你在${msgObj.sendTime}向${msgObj.toUser}发去了信息：${msgObj.msg}`)
    })
  },
  methods: {
    initFriendList() {
      var _this = this
      axiosAjax.ajaxGet(module.getOnlineFriends, (result) => {
        if (result.data.code === '1') {
          _this.friends = result.data.friends
        }
      })
    },
    selectToChat(index, telephone, username) {
      this.currentIndex = index
      this.$store.commit('updateToUser', telephone)
      this.$store.commit('updateToUserName', username)
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.friendlist
   .friend-item
      padding: 12px 15px
      border-bottom: 1px solid #292C33
      cursor: pointer
      &:hover
          background: rgba(255, 255, 255, 0.03)
      &.active
          background: rgba(255, 255, 255, 0.1)
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
</style>
