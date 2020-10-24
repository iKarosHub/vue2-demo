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
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  Tooltip, 
  Pagination,
  Dialog,
  MessageBox,
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
Vue.use(Breadcrumb).use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row).use(Col)
Vue.use(Table).use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
