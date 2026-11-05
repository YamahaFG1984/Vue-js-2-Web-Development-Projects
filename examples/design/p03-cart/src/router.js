import { createRouter, createWebHistory } from 'vue-router'
import { useCartStore } from './stores/cart'
import ProductList from './views/ProductList.vue'
import ProductDetail from './views/ProductDetail.vue'
import CartView from './views/CartView.vue'
import CheckoutView from './views/CheckoutView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: ProductList },
    // props: true 把路由参数 id 作为 prop 传给组件，组件不必知道自己被路由使用
    { path: '/product/:id', name: 'product', component: ProductDetail, props: true },
    { path: '/cart', name: 'cart', component: CartView },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
      // 路由守卫：没有可结算的商品就不让进，类似 Django 视图开头的 redirect
      beforeEnter: () => {
        const cart = useCartStore()
        if (!cart.checkoutLines.length) return { name: 'cart' }
      },
    },
  ],
})
