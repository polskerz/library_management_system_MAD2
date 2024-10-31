export default {
    template: `
    <div class="container">
        <div class="row justify-content-center mt-3">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header" style="font-size: 30px; text-align: center;">Add Book</div>
                    <div class="card-body">
                        <form @submit.prevent="addBook" enctype="multipart/form-data">
                            <div class="mb-3">
                                <label for="title" class="form-label">Title</label>
                                <input type="text" class="form-control" name="title" id="title" v-model="title" required>
                            </div>
                            <div class="mb-3">
                                <label for="author" class="form-label">Author</label>
                                <input type="author" class="form-control" name="author" id="author" v-model="author" required>
                            </div>
                            <div class="mb-3">
                                <label for="publisher" class="form-label">Publisher</label>
                                <input type="publisher" class="form-control" name="publisher" id="publisher" v-model="publisher" required>
                            </div>
                            <div class="mb-3">
                                <label for="published_date" class="form-label">Date of Publication</label>
                                <input type="date" class="form-control" name="published_date" id="published_date" v-model="published_date" required>
                            </div>
                            <div class="mb-3">
                                <label for="content" class="form-label">PDF Content</label>
                                <input type="file" class="form-control" name="content" id="content" @change="handleFileUpload" required>
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
            title: '',
            author: '',
            publisher: '',
            published_date: new Date().toISOString().substring(0, 10), // Set today's date as default
            section_id: null,
            content: null  // Add a data property for the file
        };
    },
    created(){
        this.section_id = this.$route.params.section_id;
    },
    methods: {
        handleFileUpload(event) {
            this.content = event.target.files[0];  // Capture the file
        },
        async addBook() {
            const formData = new FormData();
            formData.append('title', this.title);
            formData.append('author', this.author);
            formData.append('publisher', this.publisher);
            formData.append('published_date', this.published_date);
            formData.append('content', this.content);  // Add the file to the form data
            try {
                const response = await fetch(`/admin/${this.section_id}/add_book`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: formData
                });

                if (response.ok) {
                    alert('Book added successfully');
                    this.$router.go(-1);
                } else {
                    const error = await response.json();
                    alert(`Failed to add book: ${error.message}`);
                }
            } catch (error) {
                console.error('Error adding book:', error);
                alert('An unexpected error occurred. Please try again.');
                this.$router.push('/admin');
            }
        },
        goBack() {
            this.$router.push('/admin'); // Redirect to admin home
        }
    }
};
