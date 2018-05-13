<template>
  <div class="mytext" v-if="this.$store.state.toUser">
    <textarea placeholder="按 Ctrl + Enter 发送" v-model="content" @keyup="onKeyup"></textarea>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  data() {
    return {
      content: ''
    }
  },
  methods: {
    onKeyup(e) {
      if (e.ctrlKey && e.keyCode === 13 && this.content.length) {
        this.sendMessage(this.content)
        this.content = ''
      }
    },
    sendMessage(msg) {
       var toUser = this.$store.state.toUser
       var fromUser = this.$store.state.telephone
       this.$socket.emit('send private msg', msg, toUser, fromUser)
       this.$store.commit('updateMessage', msg)
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.mytext
   height: 100px
   border-top: 1px solid #ddd
   textarea
      padding: 10px
      height: 100%
      width: 100%
      border: none
      outline: none
      font-family: "Micrsofot Yahei"
      resize: none
</style>
