export default {
    template: `
    <div class="cont-container" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div button style="width: 88%;">
            <button @click="goBack" class="btn btn-danger" style="width: 120px; height: 40px;">
                <i class="fas fa-arrow-left"></i>
                <span style="margin-left: 5px;">Go Back</span>
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
  
        <div class="card-container" style="padding: 20px; width: 100%;">
          <div class="feedback-title" style="font-size: 30px; text-align: left; margin-left: 15px; margin-bottom: 10px;">
            Feedbacks
          </div>
          <div class="feedback-body" style="border: 2px solid #ccc; border-radius: 20px; padding:20px;">
            <div v-if="feedbacks.length > 0">
              <div v-for="feedback in feedbacks" :key="feedback.feedback_id" class="feedback-table" style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; padding:20px;">
                <div class="card" style="width: 100%; height : auto; border-radius: 20px;">
                  <div class="card-header" style="text-align: left; font-size: 20px;">
                    <div class="feedback" style="display: flex; flex-direction: row; align-items: center;">
                        <i class="far fa-user" style="margin-right: 5px;"></i>
                        <strong>{{ feedback.user.username }}</strong>
                        <div class="spacer" style="flex: 1 1 auto;"></div>
                        <button @click="deleteFeedback(feedback.feedback_id)" class="btn btn-danger"><i class="fas fa-trash"></i><span style="margin-left: 10px;">Delete</span></button>
                    </div>
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
        feedback_ID: null
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
          let response = await fetch(`/admin/book/${this.bookID}`, {
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
          response = await fetch(`/admin/${this.bookID}/see_info`, {
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
      async deleteFeedback(feedbackId) {
        const confirmed = confirm("Are you sure you want to delete this feedback?");
        if (confirmed) {
          this.feedback_ID = feedbackId;
          try {
            const response = await fetch(`/admin/${this.feedback_ID}/delete_feedback`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              }
            });
    
            if (response.ok) {
              alert('Feedback deleted successfully');
              window.location.reload();
            } else {
              const error = await response.json();
              alert(`Failed to delete feedback: ${error.message}`);
            }
          } catch (error) {
            alert(`Error deleting feedback: ${error.message}`);
          }
        }
      },

      goBack() {
        this.$router.go(-1);
      },

    },
  };
  