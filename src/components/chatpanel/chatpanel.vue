<template>
<div class="chatpanel">
  <div class="sidebar">
    <card @initFriendList="initFriendList"></card>
    <friendlist ref="friendlist"></friendlist>
  </div>
  <div class="main">
    <message></message>
    <mytext></mytext>
  </div>
</div>
</template>

<script type="text/ecmascript-6">
import card from '../card/card.vue'
import axiosAjax from '../../assets/js/func'
import reqModule from '../../assets/js/module'
import friendlist from '../friendlist/friendlist.vue'
import message from '../message/message.vue'
import mytext from '../mytext/mytext.vue'
export default {
  mounted() {
    if (!this.$store.state.telephone) {
      this.checkLogin()
    }
  },
  methods: {
    checkLogin() {
      var _this = this
      axiosAjax.ajaxGet(reqModule.getCurrentUser, (result) => {
         if (result.data.code === '1') {
           _this.$store.commit('updateUserTel', result.data.telephone)
           _this.$store.commit('updateUserName', result.data.username)
           _this.$store.commit('updateUserSignature', result.data.signature)
           _this.$socket.emit('new join', result.data.telephone)
         } else {
           _this.$alert(result.data.msg, {
             confirmButtonText: '确定',
             callback: (action) => {
               _this.$router.push('/login')
             }
           })
         }
      })
    },
    initFriendList() {
      this.$refs.friendlist.initFriendList()
    }
  },
  components: {
    card,
    friendlist,
    message,
    mytext
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .chatpanel
      height: 540px
      width: 800px
      position: absolute
      top: 50%
      left: 50%
      margin-top: -270px
      margin-left: -400px
      overflow: hidden
      border-radius: 3px
      .sidebar,.main
          height: 100%
      .sidebar
          color: #f4f4f4
          float: left
          background: #2e3238
          width: 200px
      .main
          background: #eee
          position: relative
          overflow: hidden
</style>
