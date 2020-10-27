import Vue from 'vue'
import VueRouter from 'vue-router'

// 路由懒加载
const Login = () => import("../components/Login.vue");
const Home = () => import("../components/Home.vue");
const Welcome = () => import("../components/Welcome.vue");
const User = () => import("../components/users/User.vue");
const Rights = () => import("../components/power/Rights.vue");
const Roles = () => import("../components/power/Roles.vue");
const Cate = () => import("../components/goods/Cate.vue");
const Params = () => import("../components/goods/Params.vue");

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
    ]
  }
]

const router = new VueRouter({
  routes
})

// 为路由对象，添加beforeEach 导航守卫
router.beforeEach((to, from, next) => {
  // to: 将要访问的路径
  // from: 代表从哪里路径跳转而来
  // next：是一个函数，表示方形
  //        next() 放行    next('/login') 强制跳转

  // 如果用户访问登录页，直接放行
  if (to.path === '/login') return next();

  // 从sessionStorage中获取到保存的token值
  const tokenStr = window.sessionStorage.getItem('token');
  // 没有token,强制跳转到登录页
  if (!tokenStr) return next('/login');
  next();
})
export default router
