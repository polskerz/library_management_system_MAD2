export default {
    template: `
    <div class="container">
        <div class="row justify-content-center mt-3">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header" style="font-size: 30px; text-align: center;">Edit Book</div>
                    <div class="card-body">
                        <form @submit.prevent="editBook">
                            <div class="mb-3">
                                <label for="title" class="form-label">Edit Title</label>
                                <input type="text" class="form-control" name="title" id="title" v-model="title" required>
                            </div>
                            <div class="mb-3">
                                <label for="author" class="form-label">Edit Author</label>
                                <input type="text" class="form-control" name="author" id="author" v-model="author" required>
                            </div>
                            <div class="mb-3">
                                <label for="publisher" class="form-label">Edit Publisher</label>
                                <input type="text" class="form-control" name="publisher" id="publisher" v-model="publisher" required>
                            </div>
                            <div class="mb-3">
                                <label for="published_date" class="form-label">Edit Published Date</label>
                                <input type="date" class="form-control" name="published_date" id="published_date" v-model="published_date" required>
                            </div>
                            <div class="mb-3">
                                <label for="content" class="form-label">Upload New Content (PDF)</label>
                                <input type="file" class="form-control" name="content" id="content" @change="handleFileUpload">
                                <small class="form-text text-muted">Leave blank to keep the current book content</small>
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
            book_id: null,
            title: '',
            author: '',
            publisher: '',
            published_date: '',
            content : null
        };
    },
    methods: {
        handleFileUpload(event) {
            this.content = event.target.files[0];
        },
        async editBook() {
            try {
                const formData = new FormData();
                formData.append('title', this.title);
                formData.append('author', this.author);
                formData.append('publisher', this.publisher);
                formData.append('published_date', this.published_date);

                if (this.content) {
                    formData.append('content', this.content);
                }

                const response = await fetch(`/admin/${this.section_id}/edit_book/${this.book_id}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: formData
                });

                if (response.ok) {
                    alert('Book updated successfully');
                    this.$router.push(`/admin/${this.section_id}/view_section`);
                } else {
                    const error = await response.json();
                    alert(`Failed to update book : ` + error.message);
                }
            } catch (error) {
                alert(`Error updating book : ` + error);
            }
        },
        goBack() {
            this.$router.push(`/admin/${this.section_id}/view_section`);
        }
    },
    created() {
        this.section_id = this.$route.params.section_id;
        const book = this.$route.params.book;
        this.book_id = book.book_id;
        this.title = book.title;
        this.author = book.author;
        this.publisher = book.publisher;
        this.published_date = new Date(book.published_date).toISOString().slice(0, 10);
    }
};
