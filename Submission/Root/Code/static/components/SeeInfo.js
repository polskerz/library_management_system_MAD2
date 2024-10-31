export default {
    template: `
    <div class="cont-container" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div button style="width: 88%;">
            <button @click="goBack" class="btn btn-danger" style="width: 130px; height: 40px;">
                <i class="fas fa-home"></i>
                <span style="margin-left: 5px;">Go Home</span>
            </button>
        </div>
        <div class="header-container" style="display: flex; flex-direction: row; align-items: center;">
            <div class="box" style="font-size: 60px; display: flex; align-items: center">{{ book.title }}</div>  
        </div>

        
        <div class="section-description mt-5" style="font-size: 25px; font-style: oblique; opacity: 0.7;">
          <p>Author : {{ book.author }}</p>
        </div>
        <div class="section-description mt-2" style="font-size: 25px; font-style: oblique; opacity: 0.7;">
          <p>Publisher : {{ book.publisher }}</p>
        </div>
        <div class="section-description mt-3">
          <button class="btn btn-success" href="#" @click="confirmRequest(book.book_id)">
          <i class="fas fa-plus"></i><span style="margin-left: 10px;">Request</span>
          </button>
        </div>
  
        <div class="card-container" style="padding: 20px; width: 100%;">
          <div class="feedback-title" style="font-size: 30px; text-align: left; margin-left: 15px; margin-bottom: 10px;">
            Feedbacks
          </div>
          <div class="feedback-body" style="border: 2px solid #ccc; border-radius: 20px; padding:20px;">
            <div v-if="feedbacks.length > 0">
              <div v-for="feedback in feedbacks" :key="feedback.feedback_id" class="feedback-table" style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; padding:20px;">
                <div class="card" style="width: 100%; height : auto; border-radius: 20px;">
                  <div class="card-header" style="text-align: left; font-size: 20px;">
                    <i class="far fa-user" style="margin-right: 5px;"></i>
                    <strong>{{ feedback.user.username }}</strong>
                  </div>
                  <div class="card-body">
                    <div class="card-text">
                      <div class="text" style="text-align: left; font-size: 20px;">
                        <p style="overflow: auto; max-height: 120px;">{{ feedback.feedback }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <div class="feedback-table" style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; padding:20px;">
                <p style="font-size: 20px;">No Feedbacks Yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </style>
    `,
    data() {
      return {
        bookID: null,
        book: {},
        user_role: null,
        feedbacks: [],
        currentBookId: null,
      };
    },
    created() {
      this.bookID = this.$route.params.book_id;
      this.fetchBookAndFeedbacks();
    },
    methods: {
      async fetchBookAndFeedbacks() {
        try {
          // Fetch book details
          let response = await fetch(`/user/my_library/book/${this.bookID}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
          if (response.ok) {
            this.book = await response.json();
            console.log(this.book);
          } else {
            console.error('Failed to fetch book details');
          }
  
          // Fetch feedbacks
          response = await fetch(`/user/${this.bookID}/see_info`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
          if (response.ok) {
            const data = await response.json();
            this.feedbacks = data.feedback;
            this.user_role = data.user_role;
          } else {
            console.error('Failed to fetch feedbacks');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      },
      confirmRequest(bookID) {
        const confirmed = confirm("Do you want to request this book?");
        if (confirmed) {
            this.currentBookId = bookID;
            this.request_confirmation();
        }
    },
    async request_confirmation() {
        try{
            const section_id = this.book.section_id
            const response = await fetch(`/user/${section_id}/${this.currentBookId}/request_confirmation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                this.$router.push({ name: 'CurrentBooks' });
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'An error occurred'}`);
                this.$router.push({ name: 'UserHome' });
            }
        } 
        catch (error) {
                alert(`Error: ${error.message}`);
                this.$router.push({ name: 'UserHome' });
                
        }
        finally {
                this.currentBookId = null;
        }
    },

      goBack() {
        this.$router.push({ name: 'UserHome' });
      },
      requestBook() {
        // Add your logic for requesting a book here
      }
    }
  };
  