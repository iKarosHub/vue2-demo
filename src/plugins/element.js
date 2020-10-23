import Vue from 'vue'
import { Button, 
         Form, 
         FormItem, 
         Input,
         Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form).use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message
