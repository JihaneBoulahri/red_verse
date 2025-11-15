import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layout/MainLayout.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: MainLayout,
            children: 
                [
                    { 
                        path: '', 
                        name: 'Home', 
                        component:()=> import('../view/Home.vue'),
                    },
                    {
                        path: 'signup',
                        name: 'Signup',
                        component:()=> import('../view/Inscription.vue'),
                        meta: { showNav: false }
                    }
                ]
        },
    ]
})

export default router;