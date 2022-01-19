import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "about" */ '../views/HomeView.vue'),
  },
  {
    path: '/Hashrate',
    name: 'hashrate',
    component: () => import(/* webpackChunkName: "about" */ '../views/Hashrate.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/Reward',
    name: 'reward',
    component: () => import(/* webpackChunkName: "about" */ '../views/Reward.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/payout',
    name: 'payout',
    component: () => import(/* webpackChunkName: "about" */ '../views/DataTable.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue'),
  },
  { 
    path: '/*', redirect: '/login' 
  }
]


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
router.beforeEach((to,from,next) => {
  if (to.path === '/login') {
    next();
  } else {
    let token = localStorage.getItem('Authorization');
    if (token === null || token === '') {
      next('/login');
    } else {
      next();
    }
  }
});


export default router
