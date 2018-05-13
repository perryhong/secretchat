import Vue from 'vue'
import Router from 'vue-router'
import chatpanel from '../components/chatpanel/chatpanel.vue'
import loginpanel from '../components/loginpanel/loginpanel.vue'
import registerpanel from '../components/registerpanel/registerpanel.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'loginpanel',
      component: loginpanel
    },
    {
      path: '/register',
      name: 'registerpanel',
      component: registerpanel
    },
    {
      path: '/mychat',
      name: 'chatpanel',
      component: chatpanel
    }
  ]
})
