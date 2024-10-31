
export default {
    template: `
    <div>
        <div class="container" style="display: flex; justify-content: center; align-items: center;">
            <div class="box" style="font-size: 60px;">{{ section_name }}</div>
            <div class="spacer" style="width: 50px;"></div>
            <div class="box">
                <button @click="goBack" class="btn btn-danger">
                    <i class="fas fa-arrow-left"></i>
                    <span style="margin-left: 5px;">Back</span>
                </button>
            </div>
        </div>
        <div class="section-description mt-4" style="display: flex; justify-content: center; font-size: 25px; font-style: oblique; opacity: 0.7;">
            <p>{{ section_description }}</p>
        </div>
        <div class="card-container mt-4" style="display: flex; flex-wrap: wrap; justify-content: center; overflow: auto;">
            <div v-for="book in books" :key="book.book_id" class="card" style="width: 370px; height: auto; margin: 20px; border-radius: 20px; <!--box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);-->">
                <div class="card-header" style="font-size: 30px; text-align: center;">{{ book.title }}</div>
                <div class="card-body" style="position: relative;">
                    <div class="card-text">
                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                            <strong>Author</strong>: {{ book.author }} 
                        </div>
                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                            <strong>Publisher</strong>: {{ book.publisher }} 
                        </div>
                        <div class="mb-3" style="text-align: left; overflow: auto; height: 60px;">
                            <strong>Date of Publication</strong>: {{ formatDate(book.published_date) }} 
                        </div>
                    </div>
                    <div class="buttons" style="display: flex; justify-content: center; position: absolute; bottom: 10px; left: 0; right: 0;">
                        <div class="button">
                            <a @click="seeInfo(book.book_id)" class="btn btn-primary">See Info</a>
                        </div>
                        <div class="button-spacer" style="width: 20px;"></div>
                        <div class="button">
                            <a class="btn btn-success" @click="confirmRequest(book.book_id)">Request</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <style>
    .spacer {
        width : 50px;
    }
    .button-spacer {
        width : 20px;
    }
    </style>
    `,
    data() {
        return {
            books: [],
            currentBookId: null,
            section_id: null,
            section_name: '',
            section_description: '',
        };
    },
    
    methods: {
        confirmRequest(bookID) {
            const confirmed = confirm("Do you want to request this book?");
            if (confirmed) {
                this.currentBookId = bookID;
                this.request_confirmation();
            }
        },
        seeInfo(book_id) {
            this.$router.push({ name: 'SeeInfo', params: { book_id } });
        },
        async request_confirmation() {
            try{
                const response = await fetch(`/user/${this.section_id}/${this.currentBookId}/request_confirmation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                const param_section_id = this.section_id;
                if (response.ok) {
                    const data = await response.json();
                    alert(data.message);
                    this.$router.push({ name: 'CurrentBooks' });
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.error || 'An error occurred'}`);
                }
            } 
            catch (error) {
                    alert(`Error: ${error.message}`);
                    const param_section_id = this.section_id;
                    this.$router.push({ name: 'UserHome' });
            }
            finally {
                    this.currentBookId = null;
            }
        },
        goBack() {
            this.$router.go(-1);
        },
        async fetchBooks() {
            try {
                const response = await fetch(`/user/${this.section_id}/all_books`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    this.books = data.books;
                } else {
                    const error = await response.json();
                    alert('Failed to fetch books : ' + error.message);
                    this.$router.push({ name: 'AdminHome' });
                }
            } catch (error) {
                console.error('Error fetching books:', error);
                alert('Error fetching books');
            }
        },
        async fetchSectionDetails() {
            try {
                const response = await fetch(`/user/${this.section_id}/get_section`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    this.section_name = data.name; 
                    this.section_description = data.description;
                } else {
                    alert('Failed to fetch section details');
                }
            } catch (error) {
                console.error('Error fetching section details:', error);
                alert('Error fetching section details');
            }
        },
        formatDate(dateString) {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', };
            return new Date(dateString).toLocaleDateString('en-IN', options);
        }
    },
    created() {
        this.section_id = this.$route.params.section_id;
        this.fetchSectionDetails(); // Fetch section details on component creation
        this.fetchBooks();
    }
};
