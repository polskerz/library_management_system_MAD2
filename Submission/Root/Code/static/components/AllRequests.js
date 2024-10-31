
export default {
    template: `
    <div>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
        <div class="container" style="display: flex; justify-content: center; align-items: center;">
            <div class="box" style="font-size: 40px;"><h1>List of Requests</h1></div>
            <div class="spacer" style="width : 50px;"></div>
            <div class="box">
                <button @click="addRequest" class="btn btn-success">
                    <i class="fas fa-plus"></i>
                    <span style="margin-left: 5px;">Add Request</span>
                </button>
            </div>
        </div>
        <div class="spacer" style="height : 20px;"></div>
        
        <div v-if="requests.length === 0" style="text-align: center; font-size: 20px; color: #888; margin-bottom:400px;">
            <p>No requests available</p>
        </div>
        
        <table v-else class="table table-bordered" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: center; border : 3px solid #8893a2;">
                    <th>Request ID</th>
                    <th>User</th>
                    <th>Book</th>
                    <th>Section</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="request in requests" :key="request.request_id" style="text-align: center; border : 3px solid #c3cdd7;">
                    <td>{{ request.request_id }}</td>
                    <td>{{ request.user.username }}</td>
                    <td>{{ request.book.title }}</td>
                    <td>{{ request.section.name }}</td>
                    <td>{{ formatDateTime(request.issue_date) }}</td>
                    <td>{{ formatDateTime(request.due_date) }}</td>
                    <td>{{ formatDateTime(request.return_date) }}</td>
                    <td>{{ request.is_revoked ? 'Revoked' : 'Active' }}</td>
                    <td>
                        <div class="buttons" style="display: flex; flex-direction: row; justify-content: center;">
                            <button @click="editRequest(request.request_id)" class="btn btn-primary">Edit</button>
                            <div class="button-spacer" style="width: 8px;"></div>
                            <button @click="confirmDelete(request)" class="btn btn-danger">Delete</button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `,
    data() {
        return {
            requests: []
        };
    },
    async created() {
        try {
            const response = await fetch('/admin/all_requests', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                this.requests = data.requests;
            } else {
                alert('Failed to fetch requests');
            }
        } catch (error) {
            alert('Error fetching requests:', error);
        }
    },
    methods: {
        formatDateTime(dateTime) {
            if (!dateTime) return 'N/A';
            const options = { weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC', };
            return new Date(dateTime).toLocaleDateString('en-IN', options);
        },
        addRequest() {
            this.$router.push({ name: 'AddRequest' });
        },
        
        editRequest(request_id) {
            this.$router.push({ name: 'EditRequest', params: { request_id } });
        },
        async confirmDelete(request) {
            const requestId = request.request_id; // Extract request_id from the request object
            console.log(`Attempting to delete request with ID: ${requestId}`);
            const confirmed = confirm("Are you sure you want to delete this request?");
            if (confirmed) {
                try {
                    const response = await fetch(`/admin/delete_request/${requestId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    });
    
                    if (response.ok) {
                        alert('Request deleted successfully');
                        console.log(`Request with ID: ${requestId} deleted`);
                        window.location.reload();
                    } else {
                        const error = await response.json();
                        alert(`Failed to delete request: ${error.message}`);
                        console.error(`Error response:`, error);
                    }
                } catch (error) {
                    console.error('Fetch error:', error);
                    alert(`Error deleting request: ${error.message || error}`);
                }
            }
        }
    }
};
