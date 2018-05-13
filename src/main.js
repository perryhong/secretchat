// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import Vuex from 'vuex'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/stylus/index.styl'
import VueSocketio from 'vue-socket.io'
import socketio from 'socket.io-client'
import {formatDate} from './assets/js/date'

Vue.use(VueSocketio, socketio('http://localhost:3000', {'reconnection': true, 'reconnectionDelay': 200, 'force new connection': true, 'autoConnect': true}))

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    telephone: '',
    username: '',
    signature: '',
    toUser: '',
    toUserName: '',
    message: {}
  },
  mutations: {
    updateUserTel(state, telephone) {
      state.telephone = telephone
    },
    updateUserName(state, username) {
      state.username = username
    },
    updateUserSignature(state, signature) {
      state.signature = signature
    },
    updateToUser(state, telephone) {
      state.toUser = telephone
    },
    updateToUserName(state, username) {
      state.toUserName = username
    },
    updateMessage(state, msg) {
      if (state.toUser in state.message) {
        state.message[state.toUser].push({
          content: msg,
          self: true,
          date: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
        })
      } else {
        state.message[state.toUser] = [{
          content: msg,
          self: true,
          date: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
        }]
      }
    }
  }
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
