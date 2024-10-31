export default {
    template: `
        <div class="container">
            <div class="row justify-content-center mt-3">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header" style="font-size: 40px; text-align: center;">Sign Up</div>
                        <div class="card-body">
                            <form @submit.prevent="signUp">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Username</label>
                                    <input type="text" class="form-control" v-model="info.username" id="username" required>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" v-model="info.email" id="email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="name" class="form-label">Name</label>
                                    <input type="text" class="form-control" v-model="info.name" id="name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="password" class="form-label">Password</label>
                                    <input type="password" class="form-control" v-model="info.password" id="password" required>
                                </div>
                                <button type="submit" class="btn btn-primary">Sign Up</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            info: {
                username: '',
                email: '',
                name: '',
                password: ''
            },
            error: null
        };
    },
    methods: {
        async signUp() {
            try {
                const res = await fetch('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.info)
                });
                const response = await res.json();
                if (res.ok) {
                    alert('Sign up successful!');
                    this.$router.push('/user_login'); // Redirect to login page
                } else {
                    alert(response.message);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }
};
