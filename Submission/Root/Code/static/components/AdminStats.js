export default {
    template: `
    <div>
        <h1 style="text-align: center;">Statistics - Codexify</h1>
        <div class="chart-cont" style="padding: 50px; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; ">
            <div class="spacer" style="width: 100px;"></div>
            <!-- Container for bar chart -->
            <div class="chart-container" style="width: 400px; height:400; margin: 10px;">
                <canvas id="bar-chart" style="display: block; box-sizing: border-box; height: 400px; width: 400px;"></canvas>
            </div>
            <div class="spacer" style="width: 100px;"></div>
            <!-- Container for pie chart -->
            <div class="chart-container" style="width: 450px; height:450; margin: 10px;">
                <canvas id="requests-pie-chart" style="display: block; box-sizing: border-box; height: 400px; width: 400px;"></canvas>
            </div>
            <div class="spacer" style="width: 100px;"></div>
        </div>
        <div class="chart-cont" style="padding: 50px; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; ">
            <!-- Container for section books chart -->
            <div class="chart-container" style="width: 1000px; height:400; margin: 10px;">
                <canvas id="section-books-chart" style="display: block; box-sizing: border-box; height: 400px; width: 1000px;"></canvas>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            barChartData: null,
            pieChartData: null,
            sectionBooksData: null
        };
    },
    methods: {
        async fetchStats() {
            try {
                const response = await fetch('/admin/stats', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.barChartData = data.bar_chart;
                this.pieChartData = data.requests_pie_chart;
                this.sectionBooksData = data.section_books_chart;

                this.renderCharts();
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        },
        renderCharts() {
            if (this.barChartData) {
                new Chart(document.getElementById('bar-chart'), {
                    type: 'bar',
                    data: {
                        labels: this.barChartData.labels,
                        datasets: [{
                            label: 'Count',
                            data: this.barChartData.data,
                            backgroundColor: ['#1E90FF', '#00CED1', '#3CB371', '#20B2AA', '#4682B4']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Number of Users vs. Number of Admins'
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'User Type'
                                }
                            },
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Count'
                                }
                            }
                        }
                    }
                });
            }
        
            if (this.pieChartData) {
                new Chart(document.getElementById('requests-pie-chart'), {
                    type: 'doughnut',
                    data: {
                        labels: this.pieChartData.labels,
                        datasets: [{
                            data: this.pieChartData.data,
                            backgroundColor: ['#BF5B30', '#D4A373', '#C07C38']  
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Request Status Distribution'
                            }
                        },
                        cutout: '50%'  // Adjust this value to control the size of the hole
                    }
                });                
            }
        
            if (this.sectionBooksData) {
                new Chart(document.getElementById('section-books-chart'), {
                    type: 'bar',
                    data: {
                        labels: this.sectionBooksData.labels,
                        datasets: [{
                            label: 'Books Count',
                            data: this.sectionBooksData.data,
                            backgroundColor: ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Distribution of Sections vs. Books'
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
