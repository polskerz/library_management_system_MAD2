export default {
    template: `
    <div>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
        <div class="container" style="display: flex; justify-content: center; align-items: center;">
            <div class="box" style="font-size: 40px;"><h1>List of Users</h1></div>
            <div class="spacer" style="width : 50px;"></div>
            <div class="box">
                <router-link to="/admin/add_user" class="btn btn-success">
                    <i class="fas fa-plus"></i>
                    <span style="margin-left: 5px;">Add User</span>
                </router-link>
            </div>
        </div>
        <div class="spacer" style="height : 20px;"></div>
        <table class="table table-bordered">
            <thead>
                <tr style="text-align: center; border : 3px solid #8893a2;">
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Active Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.user_id" style="text-align: center; border : 3px solid #c3cdd7;">
                    <td>{{ user.user_id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.active }}</td>
                    <td>
                        <div class="buttons" style="display: flex; flex-direction: row; justify-content: center;">
                            <button @click="editUser(user)" class="btn btn-primary">Edit</button>
                            <div class="button-spacer" style="width: 8px;"></div>
                            <button @click="confirmDelete(user)" class="btn btn-danger">Delete</button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `,
    data() {
            return {
                users: []
            };
        },
        async created() {
            try {
                const response = await fetch('/admin/all_users', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const filter_users = data.users.filter(user => user.role.includes('user'));
                    this.users = filter_users
                } else {
                    alert('Failed to fetch users');
                }
            } catch (error) {
                alert('Error fetching users:', error);
            }
        },
        methods: {
            editUser(user) {
                this.$router.push({ name: 'EditUser', params: { user } });
            },
            async confirmDelete(user) {
                const userId = user.user_id; // Extract user_id from the user object
                console.log(`Attempting to delete user with ID: ${userId}`);
                const confirmed = confirm("Are you sure you want to delete this user?");
                if (confirmed) {
                    try {
                        const response = await fetch(`/admin/delete_user/${userId}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                            }
                        });
    
                        if (response.ok) {
                            alert('User deleted successfully');
                            console.log(`User with ID: ${userId} deleted`);
                            window.location.reload();
                        } else {
                            const error = await response.json();
                            alert(`Failed to delete user: ${error.message}`);
                            console.error(`Error response:`, error);
                        }
                    } catch (error) {
                        console.error('Fetch error:', error);
                        alert(`Error deleting user: ${error.message || error}`);
                    }
                }
            }
        }
    };
