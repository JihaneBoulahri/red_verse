import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layout/MainLayout.vue';
import Playlists from '../view/Playlist.vue'
import CreatePlaylist from '../view/CreatePlaylist.vue'

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
                        meta: { showSidebar: false }
                    },
                    {
                        path: 'signup',
                        name: 'Signup',
                        component:()=> import('../view/Inscription.vue'),
                        meta: { showNav: false, showSidebar: false }
                    },
                    {
                        path: 'aPropos',
                        name: 'aPropos',
                        component:()=> import('../view/APropos.vue'),
                        meta: { showSidebar: false }
                    },
                    {
                        path: 'contact',
                        name: 'Contact',
                        component:()=> import('../view/Contact.vue'),
                        meta: { showSidebar: false }
                    },
                    {
                        path: '/dashboard',
                        name: 'Dashboard',
                        component:()=> import('../view/Dashboard.vue'),
                        meta: { requiresAuth: true, showSidebar: true }
                    },
                    {
                        path: '/favorites',
                        name: 'Favorites',
                        component: () => import('../view/Favorites.vue'),
                        meta: { showSidebar: true }
                    },
                    {
                        path: '/playlist',
                        name: 'Playlist',
                        component: () => import('../view/Playlist.vue'),
                        meta: { showSidebar: true }
                        
                    },
                    {
                        path: '/playlist/create',
                        name: 'CreatePlaylist',
                        component: () => import('../view/CreatePlaylist.vue'),
                        meta: { showSidebar: true }
                    },
                    {
                        path: '/album/:id',
                        name: 'AlbumDetails',
                        component: () => import('../view/AlbumDetails.vue'),
                        meta: { showSidebar: true }
                        }
                ]
        },
    ]
})


export default router;