export default {
    template: `
    <div>
        <div class="container" style="display: flex; justify-content: center; align-items: center;">
            <div class="box" style="font-size: 50px;">Admin Dashboard</div>
            <div class="spacer" style="width: 50px;"></div>
            <div class="box">
                <router-link to="/admin/add_section" class="btn btn-success">
                    <i class="fas fa-plus"></i>
                    <span style="margin-left: 5px;">Add Section</span>
                </router-link>
            </div>
        </div>
        <div class="spacer" style="height: 20px;"></div>
        <div class="card-container mt-4" style="display: flex; flex-wrap: wrap; justify-content:center; align-items: column; padding: 10px;">
            <div v-for="section in sections" :key="section.section_id" class="card" style="border: 2px solid #ccc; border-radius: 20px; <!--box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);-->
            padding: 5px; width: 400px; margin: 10px; height: auto; display: flex; flex-direction: column; justify-content: center;">
                <div class="card-header" style="font-size: 35px; text-align: center;">{{ section.name }}</div>
                <div class="card-body" style="position: relative;">
                    <div class="card-text">
                        <div style="text-align: center;">
                            <strong>Section ID : {{ section.section_id }} </strong>
                        </div>
                        <div class="mb-3" style="text-align: center;">
                            <strong>Created on : {{ formatDate(section.date_created) }} </strong>
                        </div>
                        <div class="mb-5" style="text-align: center; font-size: 20px; overflow: auto; height: 100px;">
                            {{ section.description }}
                        </div>
                    </div>
                    <div class="buttons" style="display: flex; justify-content: center; position: absolute; bottom: 10px; left: 0; right: 0;">
                        <div class="buttons">
                            <button @click="viewSection(section.section_id)" class="btn btn-primary">View</button>
                        </div>
                        <div class="button-spacer" style="width: 20px;"></div>
                        <div class="buttons">
                            <button @click="editSection(section)" class="btn btn-warning">Edit</button>
                        </div>
                        <div class="button-spacer" style="width: 20px;"></div>
                        <div class="buttons">
                            <button @click="addBook(section.section_id)" class="btn btn-success">Add Book</button>
                        </div>
                        <div class="button-spacer" style="width: 20px;"></div>
                        <div class="buttons">
                            <button class="btn btn-danger" @click="confirmDelete(section.section_id)">Delete</button>
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
            sections: [],
            section_ID : ''
        }
    },
    created() {
        this.fetchSections();
    },
    methods: {
        editSection(section) {
            this.$router.push({ name: 'EditSection', params: { section } });
        },
        addBook(section_id) {
            this.$router.push({ name: 'AddBook', params: { section_id } });
        },
        viewSection(section_id) {
            this.$router.push({ name: 'ViewSection', params: { section_id } });
        },
        async confirmDelete(sectionId) {
            const confirmed = confirm("Are you sure you want to delete this section?");
            if (confirmed) {
                this.section_ID = sectionId;
                console.log(this.section_ID);
                try {
                    const response = await fetch(`/admin/delete_section/${this.section_ID}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    });

                    if (response.ok) {
                        alert('Section deleted successfully');
                        window.location.reload(); // Adjust to your route
                    } else {
                        const error = await response.json();
                        alert(`Failed to delete section: ${error.message}`);
                    }
                } catch (error) {
                    alert(`Error deleting section: ${error.message}`);
                }
            }
        },
        async fetchSections() {
            try {
                const response = await fetch('/admin/all_sections', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    this.sections = data.sections;
                } else {
                    alert('Failed to fetch sections');
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
                alert('Error fetching sections');
            }
        },
        formatDate(dateString) {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
            return new Date(dateString).toLocaleDateString('en-IN', options);
        }
    }
}

