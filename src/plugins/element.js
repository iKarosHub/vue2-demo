import Vue from 'vue'
import { Button, 
        Form, 
        FormItem, 
        Input,
        Message,
        Container,
        Header,
        Aside,
        Main,
        Menu,
        Submenu,
        MenuItem,
         } from 'element-ui'

Vue.use(Button)
Vue.use(Form).use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu).use(MenuItem)
Vue.use(Submenu)
Vue.prototype.$message = Message
