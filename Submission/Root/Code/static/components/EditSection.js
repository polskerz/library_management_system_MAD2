
export default {
    template: `
    <div class="container">
        <div class="row justify-content-center mt-3">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header" style="font-size: 30px; text-align: center;">Edit Section</div>
                    <div class="card-body">
                        <form @submit.prevent="editSection">
                            <div class="mb-3">
                                <label for="name" class="form-label">Edit Name</label>
                                <input type="text" class="form-control" name="name" id="name" v-model="name" required>
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label">Edit Description</label>
                                <textarea class="form-control" name="description" id="description" v-model="description" required></textarea>
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
            section_id: null,
            name: '',
            description: '',
        };
    },
    methods: {
        async editSection() {
            try {
                const response = await fetch(`/admin/edit_section/${this.section_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: JSON.stringify({
                        name: this.name,
                        description: this.description
                    })
                });

                if (response.ok) {
                    alert('Section updated successfully');
                    this.$router.push('/admin');
                } else {
                    const error = await response.json();
                    alert(`Failed to update user: ${error.message}`);
                }
            } catch (error) {
                alert('Error updating user:', error);
            }
        },
        goBack() {
            this.$router.push('/admin');
        }
    },
    created() {
        const section = this.$route.params.section;
        this.section_id = section.section_id;
        this.name = section.name;
        this.description = section.description;
    }
};

