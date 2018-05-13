<template>
    <div class="loginpanel">
      <div class="login-part">
        <h1>用户登录<span class="registerEntry">还没有账号?<a href="#/register">立即注册</a></span></h1>
        <div class="form-wrapper">
          <label for="telephone">
            <input type="text" id="telephone" placeholder="输入手机号" v-model="telephone">
          </label>
          <label for="password">
            <input type="password" id="password" placeholder="输入密码" v-model="password">
          </label>
          <input type="button" value="登录" class="loginBtn" @click="doLogin">
        </div>
      </div>
    </div>
</template>

<script type="text/ecmascript-6">
  import axiosAjax from '../../assets/js/func'
  import md5 from '../../assets/js/md5'
  import reqModule from '../../assets/js/module'
export default {
  data () {
    return {
      telephone: '',
      password: ''
    }
  },
  mounted() {
    this.checkLogin()
  },
  methods: {
    checkLogin() {
      var _this = this
      axiosAjax.ajaxGet(reqModule.getCurrentUser, (result) => {
        if (result.data.code === '1') {
          _this.$router.push('/mychat')
        }
      })
    },
    doLogin() {
      var _this = this
      if (this.telephone && this.password) {
        var formData = new FormData()
        var mdpassword = md5(md5(this.password).substr(4, 7) + md5(this.password))
        formData.append('telephone', this.telephone)
        formData.append('password', mdpassword)
        axiosAjax.ajaxPost(reqModule.doLogin, formData, (result) => {
          if (result.data.code === '1') {
            _this.$store.commit('updateUserTel', result.data.telephone)
            _this.$store.commit('updateUserName', result.data.username)
            _this.$store.commit('updateUserSignature', result.data.signature)
            _this.$socket.emit('new join', result.data.telephone)
            _this.$notify({
              message: result.data.msg,
              type: 'success',
              duration: 2000
            })
            _this.telephone = ''
            _this.password = ''
            _this.$router.push('/mychat')
          } else {
            _this.$notify({
              message: result.data.msg,
              type: 'error',
              duration: 2000
            })
          }
        })
      } else {
        this.$notify({
          message: '请输入账号密码',
          type: 'error',
          duration: 2000
        })
      }
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.loginpanel
   width: 380px
   height: 300px
   background: #fff
   position: absolute
   top: 50%
   left: 50%
   margin-top: -150px
   margin-left: -190px
   border-radius: 3px
   .login-part
      width: 340px
      height: 240px
      margin: 30px auto
      border: 1px solid #d5dce5
      border-radius: 5px
      h1
         font-size: 20px
         color: #4d5e73
         padding: 15px 20px
         position: relative
         .registerEntry
            position: absolute
            right: 20px
            font-size: 12px
            margin-top: 4px
            a
               color: #428bca
      .form-wrapper
         padding: 0 20px
         label
            display: block
            #telephone,#password
               border: 1px solid #d5dce5
               border-radius: 3px
               font-size: 16px
               padding: 10px 0
               margin-bottom: 20px
               display: block
               width: 100%
               text-indent: 20px
               outline: hidden
         .loginBtn
             display: block
             height: 40px
             line-height: 40px
             background: #2e3238
             width: 100%
             color: #fff
             border-radius: 3px
             cursor: pointer
</style>
