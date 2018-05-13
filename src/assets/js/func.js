/**
 * Created by hpq on 2018/4/26.
 */
import axios from 'axios'

export default {
  ajaxGet(api, cb) {
    axios.get(api)
      .then(cb)
      .catch(err => {
        console.log(err)
      })
  },
  ajaxPost(api, post, cb) {
    axios.post(api, post)
      .then(cb)
      .catch(err => {
        console.log(err)
      })
  }
}
