export default {
    template: `
    <div class="container" style="display: flex; justify-content: center; align-items: center; margin-top: 50px; margin-bottom: 180px;">
        <div class="card" style="width: 800px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div class="card-header" style="font-size: 40px; text-align: center; width: 100%; margin-bottom: 20px;">
                <h1>Profile</h1>
            </div>
            <div class="card-body" style="width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <p v-if="user_info" style="font-size: 30px;">Username: {{ user_info.username }}</p>
                <p v-if="user_info" style="font-size: 30px; margin-bottom: 20px;">Name: {{ user_info.name }}</p>
                <p v-if="!user_info" style="font-size: 30px; color: red;">User information not available</p>
            </div>
            <div class="button-edits" style="display: flex; justify-content: center; margin-bottom: 40px;">
                <div class="button">
                    <button type="submit" @click="editProfile(user_info.user_id)" class="btn btn-danger">Edit Profile</button>
                </div>
                <div class="spacer" style="width: 30px;"></div>
                <div class="spacer" style="width: auto;">
                    <button @click="createReport(user_info.user_id)" class="btn btn-primary">Get Monthly Report</button>
                </div>
            </div>
        </div>
        <div v-if="isWaiting" class="popup" style="position: fixed; top: 80%; z-index: 1000; background-color: white; padding: 20px; border: 1px solid #ccc; text-align: center; width: 200px; border-radius: 8px;">
        <p style="font-size: 18px; margin-bottom: 10px;">Please wait...</p>
            <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            user_info: null,
            isWaiting: false
        }
    },
    created() {
        this.getUser();
    },
    methods: {
        editProfile(user_id){
            this.$router.push({ name: 'EditUserProfile', params : { user_id }});
        },
        async getUser() {
            try {
                const response = await fetch('/user/info', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    this.user_info = data;  
                } else {
                    alert('Failed to fetch user');
                    console.error('Fetch failed with status:', response.status);
                }
            } catch (error) {
                alert('Error fetching user:', error.message);
                console.error('Error:', error);
            }
        },
        async createReport(user_id){
            this.isWaiting = true
            const response = await fetch(`/user/${user_id}/monthly_report`)
            const data = await response.json()
            if (response.ok) {
                const taskId = data['task-id']
                const int_period = setInterval(async () => {
                  const csv_res = await fetch(`/user/${user_id}/monthly_report/${taskId}`)
                  if (csv_res.ok) {
                    this.isWaiting = false
                    clearInterval(int_period)
                    window.location.href = `/user/${user_id}/monthly_report/${taskId}`
                  }
                }, 1000)
              }
        },
    }
}
