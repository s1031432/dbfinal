<script>
import { Line } from 'vue-chartjs'
import axios from 'axios'

export default {
    extends: Line,
    async mounted() {
    let { data } = await axios.get(
        'http://140.119.164.151:3000/api/hashrate',
    )
    console.log(data);
    let timestamp = [];
    let hashrate = [];
    let meanHashrate = [];
    let reportedHashrate = [];
    for(let i = data.items.length-1 ; i >= 0  ; i--){
        hashrate.push((data.items[i].hashrate/1000000).toFixed(2));
        meanHashrate.push(data.items[i].meanHashrate/1000000);
        reportedHashrate.push(data.items[i].reportedHashrate/1000000);
        timestamp.push(data.items[i].timestamp);
    }
    for(let i = 1 ; i < timestamp.length ; i++){
        if(timestamp[i].split(' ')[1] != "00:00:00")
            timestamp[i] = timestamp[i].split(' ')[1];
    }
    this.renderChart({
        type: 'line',
        labels: timestamp,
        datasets: [
            {   
                label: 'Hashrate',
                data: hashrate,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 0.8)',
            },
            {
                label: 'Mean hashrate',
                data: meanHashrate,
                fill: false,
                borderColor: 'rgba(233, 192, 32, 0.8)',
            },
            {
                label: 'Reported hashrate',
                data: reportedHashrate,
                fill: false,
                borderColor: 'rgba(233, 92, 32, 0.8)',
            }
            ],
        borderWidth: 1,
        },
        {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    fontColor: '#c6ccd2',
                }
            },
            title: {
                display:true,
                text:'Hashrate infomation',
                fontColor: '#c6ccd2',
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (tooltipItem, data) {
                        return ` ${data.datasets[tooltipItem.datasetIndex].label}：${Number(tooltipItem.yLabel).toFixed(2)} MH/s`;
                    }
                }
            },
            hover: {
                mode: 'nearest',
                    intersect: true
                },
                scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Timestamp',
                        fontColor: '#c6ccd2',
                    },
                    ticks: {
                        fontColor: '#c6ccd2'
                    },
                    gridLines: {
                        display: true,
                        color: "rgba(134, 136, 146, 0.3)"
                    },
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'MH/s',
                        fontColor: '#c6ccd2',
                    },
                    ticks: {
                        fontColor: '#c6ccd2'
                    },
                    gridLines: {
                        display: true,
                        color: "rgba(134, 136, 146, 0.3)"
                    },
                }]
            }
        }
        )
    },
}
</script>