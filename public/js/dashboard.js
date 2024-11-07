document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('gasLevelChart').getContext('2d');
    const gasLevelChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
            datasets: [{
                label: 'Nồng Độ Khí Gas (ppm)',
                data: [120, 150, 95, 110, 130, 160],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nồng Độ (ppm)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Thời Gian'
                    }
                }
            }
        }
    });
});