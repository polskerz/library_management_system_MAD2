
export default {
    template: `
    <div class="container">
        <div class="row justify-content-center mt-3">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header" style="font-size: 30px; text-align: center;">Edit User Details</div>
                    <div class="card-body">
                        <form @submit.prevent="editUser">
                            <div class="mb-3">
                                <label for="username" class="form-label">Edit Username</label>
                                <input type="text" class="form-control" id="username" v-model="username" required>
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Edit Email</label>
                                <input type="email" class="form-control" id="email" v-model="email" required>
                            </div>
                            <div class="mb-3">
                                <label for="name" class="form-label">Edit Name</label>
                                <input type="text" class="form-control" id="name" v-model="name" required>
                            </div>
                            <div class="mb-3">
                                <label for="role" class="form-label">Change Role</label>
                                <select class="form-select" id="role" v-model="role" required>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Edit Password</label>
                                <input type="password" class="form-control" id="password" v-model="password">
                                <small class="form-text text-muted">Leave blank to keep the current password</small>
                            </div>
                            <div class="mb-3">
                                <label for="active_status" class="form-label">Change Active Status</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="active_status" v-model="activeStatus">
                                    <label class="form-check-label" for="active_status">Active</label>
                                </div>
                            </div>
                            <div class="button-yes-no" style="display: flex; justify-content: center;">
                                <button type="submit" class="btn btn-success">Save Changes</button>
                                <div class="spacer" style="width: 30px;"></div>
                                <button type="button" class="btn btn-danger" @click="goBack">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            userId: null,
            username: '',
            email: '',
            name: '',
            role: 'user',
            password: '',
            activeStatus: true
        };
    },
    methods: {
        async editUser() {
            try {
                const response = await fetch(`/admin/edit_user/${this.userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: JSON.stringify({
                        username: this.username,
                        email: this.email,
                        name: this.name,
                        role: this.role,
                        password: this.password,  // Include password in the request
                        active: this.activeStatus
                    })
                });

                if (response.ok) {
                    alert('User updated successfully');
                    this.$router.push('/admin/all_users');
                } else {
                    const error = await response.json();
                    alert(`Failed to update user: ${error.message}`);
                }
            } catch (error) {
                alert('Error updating user:', error);
            }
        },
        goBack() {
            this.$router.push('/admin/all_users');
        }
    },
    created() {
        const user = this.$route.params.user;
        this.userId = user.user_id;
        this.username = user.username;
        this.email = user.email;
        this.name = user.name;
        this.role = user.role;
        this.activeStatus = user.active;
    }
};

