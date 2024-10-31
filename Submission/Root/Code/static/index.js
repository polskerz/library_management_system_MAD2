import router from './router.js'
import Navbar from './components/Navbar.js'

new Vue({
    el : '#app',
    template : `<div>
    <Navbar />
    <div class="spacer" style="height: 10px;"></div>
    <router-view />
    
    </div>`,
    router,
    components : {
        Navbar
    }
})