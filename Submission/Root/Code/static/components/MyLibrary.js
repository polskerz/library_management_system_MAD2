
// MyLibrary.js
export default {
    template: `
        <div>
            <h1 style="font-size: 50px; display: flex; justify-content: center; align-items: center; margin-bottom: 30px; margin-top: 30px;">{{ pageTitle }}</h1>
            <div v-if="loading">
                <p>Loading...</p>
            </div>
            <div v-else>
                <div v-if="requests.length === 0">
                    <p style="font-size: 30px; display: flex; justify-content: center; align-items: center; margin-top: 60px; margin-bottom: 350px;">No books to display.</p>
                </div>
                <div v-else>
                    <div class="card-container mt-4" style="display: flex; flex-wrap: wrap; justify-content: center; overflow: auto;">
                        <div v-for="request in requests" :key="request.request_id" class="card" style="width: 430px; height: auto; margin: 20px; border-radius: 20px;">
                            <div v-if="pageTitle === 'Current Books' && request.time_remaining !== '0d 0h 0m 0s'">
                                <div class="card-header" style="font-size: 30px; text-align: center;">{{ request.book.title }}</div>
                                <div class="card-body" style="position: relative;">
                                    <div class="card-text">
                                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                            <strong>Author</strong>: {{ request.book.author }} 
                                        </div>
                                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                            <strong>Publisher</strong>: {{ request.book.publisher }} 
                                        </div>
                                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                            <strong>Section</strong>: {{ request.section.name }} 
                                        </div>
                                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                            <strong>Issued On</strong>: {{ formatDateTime(request.issue_date) }} 
                                        </div>
                                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                            <strong>Due On</strong>: {{ formatDateTime(request.due_date) }} 
                                        </div>
                                        <div class="mb-3" style="text-align: left; overflow: auto; height: 60px;">
                                            <strong>Time Remaining</strong>: {{ request.time_remaining}}
                                        </div>
                                    </div>
                                    <div class="buttons"  style="display: flex; justify-content: center; position: absolute; bottom: 10px; left: 0; right: 0;">
                                        <div class="button">
                                            <button @click="viewBook(request.book.book_id)" class="btn btn-success">Read</button>
                                        </div>
                                        <div class="button-spacer" style="width: 20px;"></div>
                                        <div class="button">
                                            <button @click="confirmReturn(request)" class="btn btn-danger">Return</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="spacer" style="height: 10px;"></div>
                            </div>
                            <div v-if="pageTitle === 'Completed Books'">   
                                <div class="card-header" style="font-size: 30px; text-align: center;">{{ request.book.title }}</div>
                                <div class="card-body" style="position: relative;">
                                    <div class="card-text">
                                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                            <strong>Author</strong>: {{ request.book.author }} 
                                        </div>
                                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                            <strong>Publisher</strong>: {{ request.book.publisher }} 
                                        </div>
                                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                            <strong>Section</strong>: {{ request.section.name }} 
                                        </div>
                                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                            <strong>Completed On</strong>: {{ formatDateTime(request.return_date) }} 
                                        </div>
                                        <div class="mb-3" style="text-align: left; overflow: auto; height: 60px;">
                                            <strong>Time Taken</strong>: {{ request.time_taken }}
                                        </div>
                                    </div>
                                    <div class="buttons" style="display: flex; flex-direction: row; justify-content: center; align-items: center; position: absolute; bottom: 10px; left: 0; right: 0;">
                                        <div class="button">
                                            <button @click="seeInfo(request.book_id)" class="btn btn-primary">See Info</button>
                                        </div>
                                        <div class="button-spacer" style="width: 20px;"></div>
                                        <div class="button">
                                            <button @click="confirmRequest(request.section_id, request.book_id)" class="btn btn-success">Request Again</button>
                                        </div>
                                        <div class="button-spacer" style="width: 20px;"></div>
                                        <div class="button">
                                            <button @click="writeFeedback(request.book)" class="btn btn-danger">Write Feedback</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="spacer" style="height: 10px;"></div>
                            </div>
                            <div v-if="pageTitle === 'Overdue Books'">   
                                <div class="card-header" style="font-size: 30px; text-align: center;">{{ request.book.title }}</div>
                                <div class="card-body" style="position: relative;">
                                    <div class="card-text">
                                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                            <strong>Author</strong>: {{ request.book.author }} 
                                        </div>
                                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                                            <strong>Section</strong>: {{ request.section.name }}
                                        </div>
                                        <div class="mb-3" style="text-align: left; overflow: auto; height: 60px;">
                                            <strong>Status</strong>: Revoked
                                        </div>
                                    </div>
                                    <div class="buttons" style="display: flex; justify-content: center; position: absolute; bottom: 10px; left: 0; right: 0;">
                                        <div class="button">
                                            <button class="btn btn-danger">Pay Fine</button>
                                        </div>
                                        <div class="button-spacer" style="width: 20px;"></div>
                                    </div>
                                </div>
                                <div class="spacer" style="height: 10px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            requests: [],
            pageTitle: '',
            pageContent: '',
            loading: true,
            timerInterval: null,
            hasReloaded: false,
            currentSectionId: null,
            currentBookId: null
        };
    },
    async created() {
        const route = this.$route;
        this.pageTitle = this.getPageTitle(this.$route);
        this.pageContent = this.getPageContent(this.$route);
        await this.fetchBooks(this.pageContent);
    },
    methods: {
        getPageTitle(route) {
            switch (route.name) {
                case 'CurrentBooks':
                    return 'Current Books';
                case 'CompletedBooks':
                    return 'Completed Books';
                case 'OverdueBooks':
                    return 'Overdue Books';
                default:
                    return 'My Library';
            }
        },
        writeFeedback(book) {
            this.$router.push({ name: 'WriteFeedback', params: { book } });
        },
        seeInfo(book_id) {
            this.$router.push({ name: 'SeeInfo', params: { book_id } });
        },
        getPageContent(route) {
            switch (route.name) {
                case 'CurrentBooks':
                    return 'current_books';
                case 'CompletedBooks':
                    return 'completed_books';
                case 'OverdueBooks':
                    return 'overdue_books';
                default:
                    return '';
            }
        },
        async fetchBooks(type) {
            try {
                const response = await fetch(`/user/my_library/${type}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    this.requests = data.requests.map(request => {
                        const nowUTC = new Date();
                        const now = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000)); 

                        const issueDate = new Date(request.issue_date).getTime();
                        const returnDate = request.return_date ? new Date(request.return_date).getTime() : now.getTime();

                        const timeDiffMs = returnDate - issueDate;

                        const diffDays = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));
                        const diffHours = Math.floor((timeDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const diffMinutes = Math.floor((timeDiffMs % (1000 * 60 * 60)) / (1000 * 60));
                        const diffSeconds = Math.floor((timeDiffMs % (1000 * 60)) / 1000);

                        request.time_taken = `${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`;

                        return request;
                    });
                } else {
                    console.error('Error fetching requests:', response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                this.loading = false;
            }
        },
        async viewBook(bookId) {
            try {
                const response = await fetch(`/user/my_library/${bookId}/content`, {
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
                    const error = await response.json();
                    alert('Failed to fetch book content : ' + error.message);
                }
            } catch (error) {
                console.error('Error fetching book content:', error);
                alert('Error fetching book content');
            }
        },
        async confirmReturn(request) {
            if (confirm('Are you sure you want to return this book?')) {
                await this.returnBook(request);
            }
        },
        async returnBook(request) {
            try {
                const request_id = request.request_id;
                const response = await fetch(`/user/my_library/return/${request_id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Content-Type': 'application/json'
                    },
                });
                if (response.ok) {
                    alert('Book returned successfully.');
                    this.$router.push({ name: 'CompletedBooks' });
                } else {
                    const error = await response.json();
                    alert('Failed to return book: ' + error.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error occurred while returning the book.');
            }
        },
        async confirmRequest(sectionID, bookID) {
            const confirmed = confirm("Do you want to request this book again?");
            if (confirmed) {
                this.currentBookId = bookID;
                this.currentSectionId = sectionID;
                console.log(this.currentSectionId, this.currentBookId + " : section, book id");
                await this.request_confirmation();
            }
        },
        async request_confirmation() {
            try{
                const response = await fetch(`/user/${this.currentSectionId}/${this.currentBookId}/request_confirmation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    alert(data.message);
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.error || 'An error occurred'}`);
                }
            } 
            catch (error) {
                    alert(`Error: ${error.message}`);
            }
            finally {
                    this.currentBookId = null;
            }
        },
        formatDateTime(dateString) {
            const options = { weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC', };
            return new Date(dateString).toLocaleDateString('en-IN', options);
        },
        updateTimeRemaining() {
            this.requests = this.requests.map(request => {
                if (request && request.due_date) {
                    const dueDate = new Date(request.due_date).getTime();
                    const nowUTC = new Date();
                    const now = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000)); // Adjusting for time zone
                    const timeRemainingMs = dueDate - now.getTime();
        
                    if (timeRemainingMs <= 0) {
                        request.time_remaining = 'Expired';
                    } else {
                        // Calculate time remaining
                        const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);
                        request.time_remaining = `${days}d ${hours}h ${minutes}m ${seconds}s`;
                    }
                } else {
                    request.time_remaining = 'Data unavailable';
                }
                return request;
            });
        
            if (!this.hasReloaded) {
                this.timerId = requestAnimationFrame(this.updateTimeRemaining.bind(this));
            }
        }  
        
    },
    watch: {
        async '$route'(to, from) {
            this.pageTitle = this.getPageTitle(to);
            this.pageContent = this.getPageContent(to);
            this.requests = [];
            this.loading = true;
            await this.fetchBooks(this.pageContent);
        }
    },
    mounted() {
        this.updateTimeRemaining();
      },
      beforeDestroy() {
        if (this.timerId) {
          cancelAnimationFrame(this.timerId);
        }
      },
};
