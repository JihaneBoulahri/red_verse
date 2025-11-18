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
                        name: 'Accueil', 
                        component:()=> import('../view/Accueil.vue'),
                    },
                    {
                        path: 'signup',
                        name: 'Signup',
                        component:()=> import('../view/Inscription.vue'),
                        meta: { showNav: false }
                    },
                    {
                        path: 'aPropos',
                        name: 'aPropos',
                        component:()=> import('../view/APropos.vue'),
                    },
                    {
                        path: 'contact',
                        name: 'Contact',
                        component:()=> import('../view/Contact.vue'),
                    }
                ]
        },
    ]
})

export default router;