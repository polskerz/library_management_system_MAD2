export default {
    template: `
        <div class="container">
            <div class="row justify-content-center mt-1">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header" style="font-size: 30px; text-align: center;">Add User Details</div>
                        <div class="card-body">
                            <form @submit.prevent="addUser">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Username</label>
                                    <input type="text" class="form-control" name="username" id="username" v-model="username" required>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="text" class="form-control" name="email" id="email" v-model="email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="name" class="form-label">Name</label>
                                    <input type="text" class="form-control" name="name" id="name" v-model="name">
                                </div>
                                <div class="mb-3">
                                    <label for="password" class="form-label">Password</label>
                                    <input type="password" class="form-control" name="password" id="password" v-model="password" required>
                                </div>
                                <div class="mb-3">
                                    <label for="role" class="form-label">Role</label>
                                    <select class="form-select" name="role" id="role" v-model="role" required>
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="active_status" class="form-label">Active Status</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="active_status" id="active_status" v-model="activeStatus">
                                        <label class="form-check-label" for="active_status">Active</label>
                                    </div>
                                </div>
                                <div class="button-yes-no" style="display: flex; justify-content: center;">
                                    <div class="button">
                                        <button type="submit" class="btn btn-success">Add</button>
                                    </div>
                                    <div class="spacer" style="width: 30px;"></div>
                                    <div class="button">
                                        <button type="button" class="btn btn-danger" @click="goBack">Go Back</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
        </div>
    `,
    data() {
        return {
            username: '',
            name: '',
            password: '',
            email: '',
            role: 'user',
            activeStatus: true,
            errorMessage: ''
        };
    },
    methods: {
        async addUser() {
            try {
                const response = await fetch('/admin/add_user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: JSON.stringify({
                        username: this.username,
                        name: this.name,
                        password: this.password,
                        email: this.email,
                        role: this.role,
                        active: this.activeStatus
                    })
                });

                if (response.ok) {
                    this.$router.push('/admin/all_users');
                    alert('User added successfully');
                    
                } else {
                    const error = await response.json();
                    this.errorMessage = error.message; // Set error message
                    alert(`Failed to add user: ${this.errorMessage}`);
                }
            } catch (error) {
                this.errorMessage = 'Error adding user';
                alert(this.errorMessage);
            }
        },
        goBack() {
            this.$router.push('/admin/all_users');
        }
    }
};
