export default {
    template: `
    <div class="container">
        <div class="row justify-content-center mt-3">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header" style="font-size: 30px; text-align: center;">Add Section</div>
                    <div class="card-body">
                        <form @submit.prevent="addSection">
                            <div class="mb-3">
                                <label for="name" class="form-label">Section Name</label>
                                <input type="text" class="form-control" name="name" id="name" v-model="name" required>
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label">Description</label>
                                <textarea class="form-control" name="description" id="description" v-model="description" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="date_created" class="form-label">Date of Creation</label>
                                <input type="date" class="form-control" name="date_created" id="date_created" v-model="dateCreated" required>
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
    </div>
    `,
    data() {
        return {
            name: '',
            description: '',
            dateCreated: new Date().toISOString().substring(0, 10) // Set today's date as default
        };
    },
    methods: {
        async addSection() {
            try {
                const response = await fetch('/admin/add_section', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: JSON.stringify({
                        name: this.name,
                        description: this.description,
                        date_created: this.dateCreated
                    })
                });

                if (response.ok) {
                    alert('Section added successfully');
                    this.$router.push('/admin'); // Redirect to admin home after adding section
                } else {
                    const error = await response.json();
                    alert(`Failed to add section: ${error.message}`);
                }
            } catch (error) {
                console.error('Error adding section:', error);
                alert('An unexpected error occurred. Please try again.');
            }
        },
        goBack() {
            this.$router.push('/admin'); // Redirect to admin home
        }
    }
};
