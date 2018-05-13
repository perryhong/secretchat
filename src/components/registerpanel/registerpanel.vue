<template>
  <div class="registerpanel">
    <div class="register-part">
      <h1>用户注册<a href="#/login" class="loginEntry">立即登录</a></h1>
      <div class="form-wrapper">
        <label for="telephone">
          <input type="text" id="telephone" placeholder="输入手机号" v-model="telephone">
        </label>
        <label for="username">
          <input type="text" id="username" placeholder="输入用户名" v-model="username">
        </label>
        <label for="password">
          <input type="password" id="password" placeholder="设置密码" v-model="password">
        </label>
        <label for="comfirm_password">
          <input type="password" id="comfirm_password" placeholder="确认密码" v-model="c_password">
        </label>
        <input type="button" value="注册" class="registerBtn" @click="doRegister">
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
      username: '',
      password: '',
      c_password: ''
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
     doRegister() {
       var _this = this
       if (this.password === this.c_password) {
         var mdpassword = md5(md5(this.password).substr(4, 7) + md5(this.password))
         var formData = new FormData()
         formData.append('telephone', this.telephone)
         formData.append('password', mdpassword)
         formData.append('username', this.username)
         axiosAjax.ajaxPost(reqModule.doRegister, formData, (result) => {
           if (result.data.code === '1') {
             _this.$notify({
               message: result.data.msg,
               type: 'success',
               duration: 2000
             })
             axiosAjax.ajaxPost(reqModule.createTable, {telephone: _this.telephone}, (result) => {})
             _this.telephone = ''
             _this.password = ''
             _this.c_password = ''
             _this.username = ''
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
           message: '两次密码输入不一致，请重新输入',
           type: 'error',
           duration: 2000
         })
       }
     }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .registerpanel
      width: 380px
      height: 420px
      background: #fff
      position: absolute
      top: 50%
      left: 50%
      margin-top: -210px
      margin-left: -190px
      border-radius: 3px
      .register-part
          width: 340px
          height: 360px
          margin: 30px auto
          border: 1px solid #d5dce5
          border-radius: 5px
          h1
              font-size: 20px
              color: #4d5e73
              padding: 15px 20px
              position: relative
              .loginEntry
                  position: absolute
                  right: 20px
                  font-size: 12px
                  margin-top: 4px
                  color: #428bca
          .form-wrapper
              padding: 0 20px
              label
                  display: block
                  #telephone,#username,#password,#comfirm_password
                      border: 1px solid #d5dce5
                      border-radius: 3px
                      font-size: 16px
                      padding: 10px 0
                      margin-bottom: 20px
                      display: block
                      width: 100%
                      text-indent: 20px
                      outline: hidden
              .registerBtn
                  display: block
                  height: 40px
                  line-height: 40px
                  background: #2e3238
                  width: 100%
                  color: #fff
                  border-radius: 3px
                  cursor: pointer
</style>
