
export default {
    template: `
    <div>
        <div class="container" style="display: flex; justify-content: center; align-items: center;">
            <div class="box" style="font-size: 60px;">{{ section_name }}</div>
            <div class="spacer" style="width: 50px;"></div>
            <div class="box">
                <router-link :to="'/admin/' + section_id + '/add_book'" class="btn btn-success">
                    <i class="fas fa-plus"></i>
                    <span style="margin-left: 5px;">Add Book</span>
                </router-link>
            </div>
        </div>
        <div class="spacer" style="height: 20px;"></div>
            <div class="card-container mt-4" style="display: flex; flex-wrap: wrap; justify-content: center; overflow: auto;">
                <div v-for="book in books" :key="book.book_id" class="card" style="width: 370px; height: auto; margin: 20px; border-radius: 20px; <!--box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);-->">
                    <div class="card-header" style="font-size: 30px; text-align: center;">{{ book.title }}</div>
                    <div class="card-body" style="position: relative;">
                        <div class="card-text">
                            <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                <strong>Book ID</strong>: {{ book.book_id }} 
                            </div>
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
                                <button @click="viewBook(book.book_id)" class="btn btn-primary">View</button>
                            </div>
                            <div class="button-spacer" style="width: 20px;"></div>
                            <div class="button">
                                <button @click="editBook(section_id, book)" class="btn btn-warning">Edit</button>
                            </div>
                            <div class="button-spacer" style="width: 20px;"></div>
                            <div class="button">
                                <button @click="seeInfo(book.book_id)" class="btn btn-success">Info</button>
                            </div>
                            <div class="button-spacer" style="width: 20px;"></div>
                            <div class="button">
                                <button class="btn btn-danger" @click="confirmDelete(book.book_id)">Delete</button>
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
            section_id: null,
            section_name: '',
            book_ID : ''
        };
    },
    
    methods: {
        
        editBook(section_id, book) {
            this.$router.push({ name: 'EditBook', params: { section_id, book} });
        },
        seeInfo(book_id) {
            this.$router.push({ name: 'AdminSeeInfo', params: { book_id } });
        },
        async viewBook(bookId) {
            try {
                const response = await fetch(`/admin/books/${bookId}/content`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
    
                    // Open the PDF in a new tab
                    window.open(url, '_blank');
                } else {
                    alert('Failed to fetch book content');
                }
            } catch (error) {
                console.error('Error fetching book content:', error);
                alert('Error fetching book content');
            }
        },
        async fetchBooks() {
            try {
                const response = await fetch(`/admin/${this.section_id}/view_section`, {
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
                }
            } catch (error) {
                console.error('Error fetching books:', error);
                alert('Error fetching books');
                this.$router.push({ name: 'AdminHome' });
            }
        },
        async fetchSectionDetails() {
            try {
                const response = await fetch(`/admin/${this.section_id}/get_section`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    this.section_name = data.name; // Update section_name
                } else {
                    alert('Failed to fetch section details');
                }
            } catch (error) {
                console.error('Error fetching section details:', error);
                alert('Error fetching section details');
            }
        },
        async confirmDelete(bookId) {
            const confirmed = confirm("Are you sure you want to delete this book?");
            if (confirmed) {
                this.book_ID = bookId;
                try {
                    const response = await fetch(`/admin/delete_book/${this.book_ID}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    });
    
                    if (response.ok) {
                        alert('Book deleted successfully');
                        window.location.reload(); 
                    } else {
                        const error = await response.json();
                        alert(`Failed to delete book: ${error.message}`);
                    }
                } catch (error) {
                    alert(`Error deleting book: ${error.message || error}`);
                }
            }
        },
        formatDate(dateString) {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC', };
            return new Date(dateString).toLocaleDateString('en-IN', options);
        }
    },
    created() {
        this.section_id = this.$route.params.section_id;
        this.fetchSectionDetails(); // Fetch section details on component creation
        this.fetchBooks();
    }
};
