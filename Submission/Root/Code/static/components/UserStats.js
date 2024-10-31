export default {
    template: `
    <div>
        <h1 style="text-align: center;">User Statistics - Codexify</h1>
        <div class="chart-cont" style="padding: 50px; display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
            <!-- Container for book status pie chart -->
            <div class="chart-container" style="width: 400px; height: 400px; margin: 10px;">
                <canvas id="book-status-pie-chart" style="display: block; box-sizing: border-box; height: 100%; width: 100%;"></canvas>
            </div>
            <div class="spacer" style="width: 100px;"></div>
            <!-- Container for completed books by section chart -->
            <div class="chart-container" style="width: 400px; height: 400px; max-width: 800px; margin: 10px;">
                <canvas id="completed-books-by-section-chart" style="display: block; box-sizing: border-box; height: 100%; width: 100%;"></canvas>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            bookStatusData: null,
            completedBooksData: null
        };
    },
    methods: {
        async fetchStats() {
            try {
                const response = await fetch(`/user/stats`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.bookStatusData = data.book_status_pie_chart;
                this.completedBooksData = data.completed_books_by_section_chart;

                this.renderCharts();
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        },
        renderCharts() {
            if (this.bookStatusData) {
                new Chart(document.getElementById('book-status-pie-chart').getContext('2d'), {
                    type: 'doughnut', // Change the type to 'doughnut'
                    data: {
                        labels: this.bookStatusData.labels,
                        datasets: [{
                            data: this.bookStatusData.data,
                            backgroundColor: ['#BF5B30', '#D4A373', '#C07C38']  
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Book Status Distribution'
                            },
                            legend: {
                                position: 'bottom', // Position of the legend
                                labels: {
                                    usePointStyle: true
                                }
                            }
                        },
                        cutoutPercentage: 50 // Adjusts the size of the hole. 50% means half of the radius.
                    }
                });
            }

            if (this.completedBooksData) {
                new Chart(document.getElementById('completed-books-by-section-chart').getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: this.completedBooksData.labels,
                        datasets: [{
                            label: 'Completed Books',
                            data: this.completedBooksData.data,
                            backgroundColor: ['#1E90FF', '#00CED1', '#3CB371', '#20B2AA', '#4682B4']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Completed Books By Section'
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Sections'
                                }
                            },
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Number of Books'
                                }
                            }
                        }
                    }
                });
            }
        }
    },
    created() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => this.fetchStats();
        document.head.appendChild(script);
    }
};
