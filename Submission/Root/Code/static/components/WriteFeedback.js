export default {
    template: `
    <div class="container">
        <div class="row justify-content-center mt-3">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header" style="font-size: 30px; text-align: center;">
                        Write Feedback
                        <br><p style="font-size: 25px">Book : {{ book.title }}</p>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="writeFeedback">
                            <div class="mb-3">
                                <label for="feedback" class="form-label">Feedback</label>
                                <textarea class="form-control" name="feedback" id="feedback" v-model="feedback" required></textarea>
                            </div>
                            <div class="button-yes-no" style="display: flex; justify-content: center;">
                                <button type="submit" class="btn btn-success">Submit Feedback</button>
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
            book : null,
            book_id: null,
            feedback: '',
        };
    },
    methods: {
        async writeFeedback() {
            try {
                const response = await fetch(`/user/my_library/${this.book_id}/write_feedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: JSON.stringify({
                        feedback: this.feedback
                    })
                });

                if (response.ok) {
                    alert('Feedback submitted successfully');
                    this.$router.push({ name: 'CompletedBooks' });
                } else {
                    const error = await response.json();
                    alert(`Failed to submit feedback: ${error.message}`);
                }
            } catch (error) {
                alert('Error submitting feedback:', error);
            }
        },
        goBack() {
            this.$router.push({ name: 'CompletedBooks' });
        }
    },
    created(){
        this.book = this.$route.params.book;
        this.book_id = this.book.book_id;
    },
};
