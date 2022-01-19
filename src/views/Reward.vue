<script>

import { Line } from 'vue-chartjs'
import axios from 'axios'

export default {
    extends: Line,
    async mounted() {
    let { data } = await axios.get(
        'http://140.119.164.151:3000/api/reward'
    )
    let timestamp = [];
    let meanReward = [];
    let reward = [];
    let unpaid = [];
    for(let i = data.earningStats.length-1 ; i >= 0  ; i--){
        meanReward.push(data.earningStats[i].meanReward);
        reward.push(data.earningStats[i].reward);
        unpaid.push(data.earningStats[i].unpaid);
        timestamp.push(data.earningStats[i].timestamp);
    }
    for(let i = 1 ; i < timestamp.length ; i++){
        if(timestamp[i].split(' ')[1] != "23:00:00")
            timestamp[i] = timestamp[i].split(' ')[1];
    }
    this.renderChart({
        labels: timestamp,
        datasets: [
            {
                label: 'Reward',
                data: reward,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 0.8)',
            },
            {
                label: 'Mean reward',
                data: meanReward,
                fill: false,
                borderColor: 'rgba(233, 192, 32, 0.8)',
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
                text:'Reward infomation',
                fontColor: '#c6ccd2',
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (tooltipItem, data) {
                        return ` ${data.datasets[tooltipItem.datasetIndex].label}：${Number(tooltipItem.yLabel).toFixed(9)} ETH`;
                    }
                }
            },
            hover: {
                mode: 'new mode',
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
                        labelString: 'ETH',
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
        })
    },
}
</script>