export default{
    template: `
    <div class="container">
      <div class="row justify-content-center mt-1">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header" style="font-size: 30px; text-align: center;">Add Request</div>
            <div class="card-body">
              <form @submit.prevent="submitRequest">
                <div class="mb-3">
                  <label for="user_id" class="form-label">User ID</label>
                  <input type="text" class="form-control" name="user_id" id="user_id" v-model="request.user_id" required>
                </div>
                <div class="mb-3">
                  <label for="book_id" class="form-label">Book ID</label>
                  <input type="text" class="form-control" name="book_id" id="book_id" v-model="request.book_id" required>
                </div>
                <div class="mb-3">
                  <label for="request_date" class="form-label">Request Date</label>
                  <input type="datetime-local" class="form-control" name="request_date" id="request_date" v-model="request.request_date" required>
                </div>
                <div class="mb-3">
                  <label for="due_date" class="form-label">Due Date</label>
                  <input type="datetime-local" class="form-control" name="due_date" id="due_date" v-model="request.due_date" required>
                </div>
                <div class="button-yes-no" style="display: flex; justify-content: center;">
                  <div class="button">
                    <button type="submit" class="btn btn-success">Add</button>
                  </div>
                  <div class="spacer" style="width: 30px;"></div>
                  <div class="button">
                    <router-link :to="{ name: 'AllRequests' }" class="btn btn-danger">Go Back</router-link>
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
          request: {
            user_id: '',
            book_id: '',
            request_date: '',
            due_date: ''
          }
        };
      },
      created() {
        this.setDefaultDates();
      },
      methods: {
        setDefaultDates() {
            const now = new Date();
            const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Add 7 days in milliseconds
        
            // Convert to IST
            const ISTOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
            const ISTNow = new Date(now.getTime() + ISTOffset);
            const ISTSevenDaysLater = new Date(sevenDaysLater.getTime() + ISTOffset);
        
            this.request.request_date = this.formatToISOString(ISTNow); // 'YYYY-MM-DDTHH:MM'
            this.request.due_date = this.formatToISOString(ISTSevenDaysLater); // 'YYYY-MM-DDTHH:MM'
          },
          formatToISOString(date) {
            const pad = num => (num < 10 ? '0' + num : num);
            const year = date.getUTCFullYear();
            const month = pad(date.getUTCMonth() + 1);
            const day = pad(date.getUTCDate());
            const hours = pad(date.getUTCHours());
            const minutes = pad(date.getUTCMinutes());
            
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          },
        async submitRequest() {
          try {
            const response = await fetch('/requests/add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              },
              body: JSON.stringify(this.request)
            });
            if (response.ok) {
              alert('Request added successfully');
              this.$router.push('/admin/all_requests');

            } else {
                const error = await response.json();
              alert('Failed to add request: ' + error.message);
            }
          } catch (error) {
            alert('Error adding request:', error);
          }
        }
      }
}