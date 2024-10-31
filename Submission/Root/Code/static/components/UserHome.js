export default {
    template: `
      <div>
        <div class="container mt-4 mb-4">
          <form @submit.prevent="performSearch" class="d-flex align-items-center justify-content-center">
            <div style="width: 50%">
              <input type="text" class="form-control" v-model="query" placeholder="Search" style="height: 40px; width: 100%;" required>
            </div>
            <div style="margin-left: 10px;">
              <select class="form-select" v-model="filter" style="height: 40px;">
                <option value="books">Books</option>
                <option value="authors">Authors</option>
                <option value="sections">Sections</option>
              </select>
            </div>
            <div style="margin-left: 10px;">
              <button type="submit" class="btn btn-primary" style="height: 40px;">
                <i class="fas fa-search"></i> <span> Search </span>
              </button>
            </div>
          </form>
        </div>
        <h1 style="font-size: 50px; display: flex; justify-content: center; align-items: center; margin-bottom: 45px; margin-top: 10px;">Home</h1>
        <div class="h3" style="display: flex; justify-content: center; align-items: center;">
          <h3>Browse sections to discover books! Click on View to expand each section.</h3>
        </div>
        <div class="subcontainer mt-5" style="padding-left: 50px; padding-right: 50px; padding-bottom: 25px; display: flex; flex-wrap: wrap; flex-direction: row; justify-content: space-evenly; height: auto;">
          <div v-for="section in sections" :key="section.section_id" v-if="section.books && section.books.length > 0">
            <div class="card" style="border: 2px solid #ccc; border-radius: 20px; padding: 5px; width: 650px; margin: 10px; height: auto; display: flex; flex-direction: column; justify-content: center;">
              <div class="card-header" style="font-size: 30px; display: flex; align-items: center; justify-content: space-between;">
                <strong style="font-size: 35px;">{{ section.name }}</strong>
                <button @click="userViewSection(section.section_id)" class="btn btn-danger " style="font-size: 17px; height: 40px; width: 90px;"> <i class="fas fa-eye"></i> View</button>
              </div>
              <div class="card-body" style="display: flex; justify-content: flex-start; align-content: center; align-items: center; height: auto; position: relative;">
                <div v-for="(book, index) in section.books.slice(0, 3)" :key="book.book_id" class="slide" style="display: inline-block; width: 190px; height: auto; border-radius: 10px; padding: 20px; border: 1px solid #ccc; background-color: #f9f9f9; margin-right: 25px;">
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
                <div v-if="section.books.length > 3" class="more" style="float: inline-end;"> +{{ section.books.length - 3 }} more</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        sections: [],
        currentBookId: null,
        currentSectionId: null,
        query: '',
        filter: 'books', 
      };
    },
    created() {
      this.fetchSections();
    },
    methods: {
    confirmRequest(sectionID, bookID) {
        const confirmed = confirm("Do you want to request this book?");
        if (confirmed) {
            this.currentBookId = bookID;
            this.currentSectionId = sectionID;
            this.request_confirmation();
        }
    },
    seeInfo(book_id) {
      this.$router.push({ name: 'SeeInfo', params: { book_id } });
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
                this.$router.push({ name: 'CurrentBooks' });
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
        userViewSection(section_id) {
            this.$router.push({ name: 'UserViewSection', params: { section_id } });
        },
      async fetchSections() {
        try {
          const response = await fetch('/user/all_sections', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            this.sections = data.sections.map(section => ({
              ...section,
              books: [] // Initialize books as an empty array
            }));
            await this.fetchBooks();
          } else {
            alert('Failed to fetch sections');
          }
        } catch (error) {
          console.error('Error fetching sections:', error);
          alert('Error fetching sections');
        }
      },
      async fetchBooks() {
        try {
          for (let section of this.sections) {
            const response = await fetch(`/user/${section.section_id}/all_books`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              section.books = data.books;
            } else {
              section.books = [];
            }
          }
        } catch (error) {
          alert('Error fetching books');
        }
      },
      performSearch() {
        this.$router.push({ 
          name: 'SearchResults', 
          query: { q: this.query, filter: this.filter }
        });
      },
      formatDate(dateString) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC', };
        return new Date(dateString).toLocaleDateString('en-IN', options);
      }
    }
  };
  