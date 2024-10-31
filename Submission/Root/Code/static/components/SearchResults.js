export default {
  template: `
    <div class="container mt-4">
      <div>
          <button @click="goBack" class="btn btn-danger" style="width: 110px; height: 40px;">
              <i class="fas fa-arrow-left"></i>
              <span style="margin-left: 5px;">Go Back</span>
          </button>
      </div>
      <h1 style="text-align: center; margin-bottom: 30px;">Search Results for "{{ query }}" in {{ filter }}</h1>
      <div v-if="results.length === 0" class="mt-3" style="text-align: center; margin-bottom: 300px;">
        <h5>No results found.</h5>
      </div>
      <div v-else class="mt-3">

        <!-- Book Filter -->
        <ul v-if="filter === 'books'" style="list-style-type: none; padding: 0;">
          <div class="card-container mt-4" style="display: flex; flex-wrap: wrap; justify-content: center; overflow: auto;">
            <div v-for="book in results" :key="book.book_id" class="card" style="width: 370px; height: auto; margin: 20px; border-radius: 20px; <!--box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);-->">
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
                            <a class="btn btn-success" @click="confirmRequest(book.book_id, book.section_id)">Request</a>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </ul>

        <!-- Author Filter -->
        <ul v-else-if="filter === 'authors'" style="list-style-type: none; padding: 0; display: flex; flex-wrap: wrap; flex-direction: row; justify-content: space-evenly; height: auto;">
          <div class="card-container mt-4" style="display: flex; flex-wrap: wrap; justify-content: center; overflow: auto;">
            <div v-for="author in results" :key="author.book_id" class="card" style="width: 370px; height: auto; margin: 20px; border-radius: 20px; <!--box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);-->">
                <div class="card-header" style="font-size: 30px; text-align: center;">{{ author.author }}</div>
                <div class="card-body" style="position: relative;">
                    <div class="card-text">
                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                            <strong>Book</strong>: {{ author.title }} 
                        </div>
                        <div class="mb-2" style="text-align: left; overflow: auto; max-height: 50px;">
                            <strong>Publisher</strong>: {{ author.publisher }} 
                        </div>
                        <div class="mb-3" style="text-align: left; overflow: auto; height: 60px;">
                            <strong>Date of Publication</strong>: {{ formatDate(author.published_date) }} 
                        </div>
                    </div>
                    <div class="buttons" style="display: flex; justify-content: center; position: absolute; bottom: 10px; left: 0; right: 0;">
                        <div class="button">
                            <a @click="seeInfo(author.book_id)" class="btn btn-primary">See Info</a>
                        </div>
                        <div class="button-spacer" style="width: 20px;"></div>
                        <div class="button">
                            <a class="btn btn-success" @click="confirmRequest(author.book_id, author.section_id)">Request</a>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </ul>

        <!-- Sections Filter -->
        <ul v-else-if="filter === 'sections'" style="list-style-type: none; padding: 0; display: flex; flex-wrap: wrap; flex-direction: row; justify-content: space-evenly; height: auto; margin-top: 50px;">
          <li v-for="section in results" :key="section.section_id" style="margin-bottom: 20px;" v-if="section.books && section.books.length > 0">
              <div class="card" style="border: 2px solid #ccc; border-radius: 20px; padding: 5px; width: 520px; margin: 10px; height: auto;">
              <div class="card-header" style="font-size: 30px; display: flex; align-items: center; justify-content: space-between;">
                <strong style="font-size: 35px;">{{ section.name }}</strong>
                <button @click="userViewSection(section.section_id)" class="btn btn-danger " style="font-size: 17px; height: 40px; width: 90px;"> <i class="fas fa-eye"></i> View</button>
              </div>
              <div class="card-body" style="display: flex; justify-content: flex-start; align-content: center; align-items: center; height: auto; position: relative;">
                <div v-for="(book, index) in section.books.slice(0, 2)" :key="book.book_id" class="slide" style="display: inline-block; width: 180px; height: auto; border-radius: 10px; padding: 20px; border: 1px solid #ccc; background-color: #f9f9f9; margin-right: 25px;">
                  <div class="book-details-1" style="display: flex; flex-direction: column; justify-content: center; align-items: center; overflow-y: auto; height: 270px;">
                    <div class="book-name" style="font-size: 22px; margin-bottom: 5px;"><strong>{{ book.title }}</strong></div>
                  </div>
                  <div class="book-details-2" style="display: flex; flex-direction: column; justify-content: row; align-items: flex-start; overflow: auto; height: 100px;">
                    <div class="book-author" style="font-size: 15px; margin-bottom: 5px;">Author: {{ book.author }}</div>
                    <div class="book-publisher" style="font-size: 15px; opacity: 0.7; margin-bottom: 15px;">Publisher: {{ book.publisher }}</div>
                  </div>
                  <div class="buttons mt-4" style="display: flex; flex-direction: column; align-items: center;">
                    <div class="buttons">
                      <button @click="seeInfo(book.book_id)" class="btn btn-primary">See Info</button >
                    </div>
                    <div class="button-spacer" style="height: 10px;"></div>
                    <div class="buttons">
                      <a class="btn btn-success" @click="confirmRequest(section.section_id, book.book_id)">Request</a>
                    </div>
                  </div>
                </div>
                <div v-if="section.books.length > 3" class="more" style="float: inline-end;"> +{{ section.books.length - 2 }} more</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  data() {
    return {
      query: this.$route.query.q || '',
      filter: this.$route.query.filter || 'books',
      results: [],
      currentBookId: null,
      section_id: null,
    };
  },
  created() {
    this.performSearch();
  },
  methods: {
    confirmRequest(bookID, sectionID) {
      const confirmed = confirm("Do you want to request this book?");
      if (confirmed) {
          this.currentBookId = bookID;
          this.section_id = sectionID;
          this.request_confirmation();
      }
  },
  seeInfo(book_id) {
      this.$router.push({ name: 'SeeInfo', params: { book_id } });
  },
  userViewSection(section_id) {
    this.$router.push({ name: 'UserViewSection', params: { section_id } });
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
              this.$router.push({ name: 'UserHome' });
      }
      finally {
              this.currentBookId = null;
      }
  },
  goBack() {
    this.$router.push({ name: 'UserHome' });
  },
    async performSearch() {
      try {
        const response = await fetch(`/user/search/${this.query}/${this.filter}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();  
          this.results = data.results;
        } else {
          const error_msg = await response.json();
          alert('Failed to search: ' + error_msg.message);
          this.$router.go(-1);
        }
      } catch (error) {
        console.error(error);
        alert('Failed to search: ' + error.message);
      }
    },
    formatDate(dateString) {
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', };
      return new Date(dateString).toLocaleDateString('en-IN', options);
  }
  }
};
