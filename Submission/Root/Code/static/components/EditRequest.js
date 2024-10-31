export default {
    template: `
      <div class="container">
        <div class="row justify-content-center mt-1">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header" style="font-size: 30px; text-align: center;">Edit Request</div>
              <div class="card-body">
                <form @submit.prevent="editRequest">
                  <div class="mb-3 text-center" style="display: flex; justify-content: center; align-items: center; flex-direction: row;">
                    <h4>User:</h4> <div class="spacer" style="width: 10px;"></div>
                    <h4>{{ request.user.username }}</h4>
                  </div>
                  <div class="mb-3 text-center" style="display: flex; justify-content: center; align-items: center; flex-direction: row;">
                    <h4>Book:</h4> <div class="spacer" style="width: 10px;"></div>
                    <h4>{{ request.book.title }}</h4>
                  </div>
                  <div v-if="request.return_date === null">
                    <div class="mb-3">
                        <label for="due_date" class="form-label">Due Date</label>
                        <input type="datetime-local" class="form-control" name="due_date" id="due_date" v-model="request.due_date" required>
                    </div>
                  </div>
                    <div class="mb-3">
                        <label for="is_revoked" class="form-label">Status</label>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="is_revoked" v-model="request.is_revoked" :style="{
                                    backgroundColor: request.is_revoked ? '#dc3545' : '#28a745',
                                    borderColor: request.is_revoked ? '#dc3545' : '#28a745'}">
                            <label class="form-check-label" for="is_revoked">
                                {{ request.is_revoked ? 'Revoked' : 'Active' }}
                            </label>
                        </div>
                    </div>
                  <div class="button-yes-no" style="display: flex; justify-content: center;">
                    <div class="button">
                      <button type="submit" class="btn btn-success">Save</button>
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
        request: {
          user: { username: '' },
          book: { title: '' },
          due_date: '',
          return_date: null,
          is_revoked: false
        }
      };
    },
    created() {
      this.loadRequestData();
    },
    methods: {
      async loadRequestData() {
        try {
          const response = await fetch(`/admin/request/${this.$route.params.request_id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            this.request = {
              user: data.user,
              book: data.book,
              due_date: new Date(data.due_date).toISOString().slice(0, 16), // 'YYYY-MM-DDTHH:MM'
              return_date: data.return_date ? new Date(data.return_date).toISOString().slice(0, 16) : null,
              is_revoked: data.is_revoked
            };
          } else {
            alert('Failed to fetch request data');
          }
        } catch (error) {
          alert('Error fetching request data:', error);
        }
      },
      async editRequest() {
        try {
          const response = await fetch(`/admin/edit_request/${this.$route.params.request_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(this.request)
          });
          if (response.ok) {
            alert('Request updated successfully');
            this.$router.push('/admin/all_requests');
          } else {
            alert('Failed to update request');
          }
        } catch (error) {
          alert('Error updating request:', error);
        }
      },
      goBack() {
        this.$router.go(-1);
      }
    }
  };
  