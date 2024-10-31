
export default {
    template: `
    <div class="container">
        <div class="row justify-content-center mt-3">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header" style="font-size: 30px; text-align: center;">Edit Profile</div>
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
                                <label for="password" class="form-label">Edit Password</label>
                                <input type="password" class="form-control" id="password" v-model="password">
                                <small class="form-text text-muted">Leave blank to keep the current password</small>
                            </div>
                            <div class="mb-3">
                                <label for="old_password" class="form-label">Enter old password to confirm changes</label>
                                <input type="password" class="form-control" id="old_password" v-model="old_password" required>
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
            username: '',
            email: '',
            name: '',
            password: '',
            old_password: '',
        };
    },
    methods: {
        async loadUserData() {
            try {   
                const response = await fetch(`/admin/profile/${this.$route.params.user_id}`,{
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                  });
                if (response.ok) {
                    const data = await response.json();
                    this.username = data.username;
                    this.email = data.email;
                    this.name = data.name;
                }else{
                    alert('Error fetching admin data');
                }
            } catch (error) {
                alert('Error fetching admin data:', error);
            } 
        },
        async editUser() {
            try {    
                const response = await fetch(`/admin/edit_admin/${this.$route.params.user_id}`, {
                    method: 'PUT',  
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: JSON.stringify({
                        username: this.username,
                        email: this.email,
                        name: this.name,
                        password: this.password,
                        old_password: this.old_password
                    }),
                });
        
                if (response.ok) {
                    alert('Admin edited successfully');
                    this.$router.go(-1);
                } else {
                    const errorData = await response.json();
                    alert(`Error editing admin: ${errorData.message}`);
                }
            } catch (error) {
                alert(`Error editing admin: ${error}`);
            }
        },
        goBack() {
            this.$router.go(-1);
        }
    },
    created() {
        this.loadUserData();
    }
};

