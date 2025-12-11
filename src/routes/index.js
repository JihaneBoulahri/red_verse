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
                        meta: { showSideBar: false }
                    },
                    {
                        path: 'signup',
                        name: 'Signup',
                        component:()=> import('../view/Inscription.vue'),
                        meta: { showNav: false, showSideBar: false }
                    },
                    {
                        path: 'aPropos',
                        name: 'aPropos',
                        component:()=> import('../view/APropos.vue'),
                        meta: { showSideBar: false }
                    },
                    {
                        path: 'contact',
                        name: 'Contact',
                        component:()=> import('../view/Contact.vue'),
                        meta: { showSideBar: false }
                    },
                    {
                        path: 'dashboard',
                        name: 'Dashboard',
                        component:()=> import('../view/Dashboard.vue'),
                    },
                    {
                        path: '/playlist',
                        name: 'Playlist',
                        component: () => import('../view/Playlist.vue'),
                        
                    },
                    {
                        path: '/playlist/:id',
                        name: 'PlaylistDetails',
                        component: () => import('../view/PlaylistDetails.vue'),
                    },
                    {
                        path: '/playlist/create',
                        name: 'CreatePlaylist',
                        component: () => import('../view/CreatePlaylist.vue'),
                    }
                ]
        },
    ]
})

export default router;