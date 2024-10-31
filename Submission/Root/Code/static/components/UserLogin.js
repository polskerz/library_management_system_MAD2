export default {
    template: `
    <div class="container" style="margin-bottom: 180px;">
        <div class="row justify-content-center mt-5">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header" style="font-size: 40px; text-align: center;">Login</div>
                    <div class="card-body">
                        <div class="mb-2"></div>
                        <form @submit.prevent="login">
                            <div class="mb-3">
                                <label for="username" class="form-label">Username</label>
                                <input type="text" class="form-control" v-model="info.username" id="username" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" class="form-control" v-model="info.password" id="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Login</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    `,
    data() {
        return {
            info: {
                username: '',
                password: '',
            },
        };
    },
    methods: {
        async login() {
            try {
                const res = await fetch('/user_login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.info),
                });
        
                // Handle server response
                if (res.ok) {
                    const data_json = await res.json();
                    await this.handleLoginSuccess(data_json);
                } else {
                    const data_json = await res.json();
                    this.showErrorMessage(data_json.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                this.showErrorMessage('An unexpected error occurred. Please try again.');
            }
        },
        async handleLoginSuccess(data) {
            localStorage.setItem('auth_token', data.token); // Store token in local storage
            console.log('Login successful');
            const token = localStorage.getItem('auth_token');
            try {
                // Fetch user role by decoding the token
                const response = await fetch('/decode_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ token: token })
                });
                
                if (response.ok) {
                    const decodedData = await response.json();
                    const userRole = decodedData.roles[0]; // Assumes the role is included in the token payload
                    console.log('User role:', userRole);
                    // Redirect based on user role
                    if (userRole === 'admin') {
                        this.$router.push({ path: '/admin' }); // Redirect to admin
                    } 
                    if (userRole === 'user') {
                        this.$router.push({ path: '/user' }); // Redirect to user
                    }
                } else {
                    console.error('Failed to decode token');
                    this.showErrorMessage('Login failed: unable to determine user role');
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                this.showErrorMessage('Login failed: unable to determine user role');
            }
        },
        
        showErrorMessage(message) {
            alert(message); // Display error message in a dialog box
        }
    },
};
