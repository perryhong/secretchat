<template>
  <div class="message">
    <div class="toUser" v-if="username">{{username}}</div>
    <ul v-if="username">
      <li v-for="item in chatHistory" class="history-item">
        <p class="time">
          <span>{{item.date}}</span>
        </p>
        <div class="main" :class="{'self': item.self}">
          <img class="avatar" width="30" height="30" src="../../../static/images/1.jpg" />
          <div class="text">{{item.content}}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  computed: {
    username() {
      return this.$store.state.toUserName
    },
    chatHistory() {
      console.log(this.$store.state.message[this.$store.state.toUser])
      return this.$store.state.message[this.$store.state.toUser]
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.message
   height: 440px
   padding: 10px 15px
   scroll-y: scroll
   .toUser
      padding: 10px 15px
      text-align: center
      border-bottom: 1px solid #ddd
   .history-item
      margin-bottom: 15px
      .time
         margin: 7px 0
         text-align: center
         &>span
            display: inline-block
            padding: 0 18px
            font-size: 12px
            color: #fff
            border-radius: 2px
            background: #dcdcdc
      .main
         &>.avatar
            float: left
            margin: 0 10px 0 0
            border-radius: 3px
         &>.text
            display: inline-block
            position: relative
            padding: 0 10px
            min-height: 30px
            line-height: 2.5
            font-size: 12px
            text-align: left
            word-break: break-all
            background: #fafafa
            border-radius: 4px
            &:before
               content: " "
               position: absolute
               top: 9px
               right: 100%
               border: 6px solid transparent
               border-right-color: #fafafa

         &.self
            text-align: right
            &>.avatar
                float: right
                margin: 0 0 0 10px
            &>.text
                background: #b2e281
                &:before
                  right: inherit
                  left: 100%
                  border-right-color: transparent
                  border-left-color: #b2e281
</style>
