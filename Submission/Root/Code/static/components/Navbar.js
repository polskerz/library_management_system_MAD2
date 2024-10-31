export default {
    template: `
    <div class="navbar">
    <nav class="navbar navbar-expand-lg bg-body-tertiary" style="height: 80px; width: 100%; padding: 0; margin: 0; background-color: #f8f9fa;">
        <div class="spacer" style="width: 50px;"></div>
            <a class="navbar-brand" style="font-size: 45px; margin-left: 20px; flex-shrink: 0; background: linear-gradient(to left, #d35400, #f39c12); color: transparent; -webkit-background-clip: text; background-clip: text;">
                <img src="/static/codexify_logo.png" alt="Logo" style="height: 45px; width: auto; margin-bottom: 5px; background-color: #f8f9fa; border-radius: 4px; padding: 5px;">
                Codexify
            </a>
        <div class="spacer" style="width: 20px;"></div>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item" v-if="!isAuthenticated">
                    <router-link class="nav-link" to="/user_login" style="font-size: 18px; line-height: 80px; color: #000000">Login</router-link>
                </li>
                <div class="spacer" style="width: 5px;"></div>
                <li class="nav-item" v-if="!isAuthenticated">
                    <router-link class="nav-link" to="/signup" style="font-size: 18px; line-height: 80px; color: #000000">Register</router-link>
                </li>
                <li class="nav-item" v-if="isAuthenticated && role === 'user'">
                    <router-link class="nav-link" to="/user" style="font-size: 18px; line-height: 80px; color: #000000">Dashboard</router-link>
                </li>
                <div class="spacer" style="width: 5px;"></div>
                <li class="nav-item dropdown" v-if="isAuthenticated && role === 'user'">
                    <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="font-size: 18px; line-height: 80px; color: #000000">
                        My Library
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li>
                        <router-link :to="{ name: 'CurrentBooks' }" class="dropdown-item">Current Books</router-link>
                        </li>
                        <li>
                        <router-link :to="{ name: 'CompletedBooks' }" class="dropdown-item">Completed Books</router-link>
                        </li>
                        <li>
                        <router-link :to="{ name: 'OverdueBooks' }" class="dropdown-item">Overdue Books</router-link>
                        </li>
                    </ul>
                </li>
                <div class="spacer" style="width: 5px;"></div>
                <li class="nav-item" v-if="isAuthenticated && role === 'user'">
                    <router-link class="nav-link" to="/user/profile" style="font-size: 18px; line-height: 80px; color: #000000">Profile</router-link>
                </li>
                <div class="spacer" style="width: 5px;"></div>
                <li class="nav-item" v-if="isAuthenticated && role === 'user'">
                    <router-link class="nav-link" to="/user/stats" style="font-size: 18px; line-height: 80px; color: #000000">Stats</router-link>
                </li>
                <div class="spacer" style="width: 5px;"></div>
                <li class="nav-item" v-if="isAuthenticated && role === 'user'">
                    <a class="nav-link" href="#" @click="confirmLogout" style="font-size: 18px; line-height: 80px; color: #000000">Logout</a>
                </li>
                <li class="nav-item" v-if="isAuthenticated && role === 'admin'">
                    <router-link class="nav-link" to="/admin" style="font-size: 18px; line-height: 80px; color: #000000">Dashboard</router-link>
                </li>
                <div class="spacer" style="width: 5px;"></div>
                <li class="nav-item" v-if="isAuthenticated && role === 'admin'">
                    <router-link class="nav-link" to="/admin/all_users" style="font-size: 18px; line-height: 80px; color: #000000">Users</router-link>
                </li>
                <div class="spacer" style="width: 5px;"></div>
                <li class="nav-item" v-if="isAuthenticated && role === 'admin'">
                    <router-link class="nav-link" to="/admin/all_requests" style="font-size: 18px; line-height: 80px; color: #000000">Requests</router-link>
                </li>
                <div class="spacer" style="width: 5px;"></div>
                <li class="nav-item" v-if="isAuthenticated && role === 'admin'">
                    <router-link class="nav-link" to="/admin/profile" style="font-size: 18px; line-height: 80px; color: #000000">Profile</router-link>
                </li>
                <div class="spacer" style="width: 5px;"></div>
                <li class="nav-item" v-if="isAuthenticated && role === 'admin'">
                    <router-link class="nav-link" to="/admin/stats" style="font-size: 18px; line-height: 80px; color: #000000">Stats</router-link>
                </li>
                <div class="spacer" style="width: 5px;"></div>
                <li class="nav-item" v-if="isAuthenticated && role === 'admin'">
                    <a class="nav-link" href="#" @click="confirmLogout" style="font-size: 18px; line-height: 80px; color: #000000">Logout</a>
                </li>
            </ul>
        </div>
    </nav>
</div>

    `,

    data() {
        return {
            role: null,
            isAuthenticated: localStorage.getItem('auth_token') !== null,
            userDetails: null,
            user: null,
        };
    },

    watch: {
        // Watch for changes in localStorage and update the component's state
        '$route'(to, from) {
            this.updateAuthStatus();
        }
    },

    methods: {
        async fetchUserDetails() {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const response = await fetch('/decode_token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ token }),
                    });
                    if (response.ok) {
                        const data = await response.json();
                        this.role = data.roles[0];
                        this.userDetails = data;
                        this.user = data.user_id

                    } else {
                        console.error('Failed to decode token');
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            }
        },
        confirmLogout() {
            const confirmed = confirm("Are you sure you want to log out?");
            if (confirmed) {
                this.logout();
            }
        },

        logout() {
            // Clear local storage
            localStorage.removeItem('auth_token');

            // Redirect to login page
            this.$router.push('/user_login');

            // Update navbar immediately
            this.updateAuthStatus();
        },

        async updateAuthStatus() {
            await this.fetchUserDetails();
            this.isAuthenticated = localStorage.getItem('auth_token') !== null;
        }
    },

    created() {
        // Update auth status on component creation
        this.updateAuthStatus();
    }
};
