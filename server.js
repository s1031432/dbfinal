const dt = require('./getDateTime.js');
const mysqlConfig = require('./config/mysql.json');
const session = require('express-session')
const express = require('express');
const path = require('path');
const cors = require('cors');
const request = require('request');
const app = express();
const mysql = require('mysql');
const { CONNREFUSED } = require('dns');
const conn = mysql.createConnection(mysqlConfig);

function transtwtime(dtt){
    let twtime = new Date(dtt);
    twtime = new Date(twtime.getTime());
    return dt.getDateTime(twtime);
}


function getHashrateDataByAPI(){
    let url = "https://api.hiveon.net/api/v1/stats/hashrates?minerAddress=e623ee52af1525e4522e0bddd51f3baeecf3a0c7&coin=ETH&window=10m&limit=144&offset=0";
    let headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
    };
    return new Promise((resolve, reject) => {
        request(url, {
            "headers": headers,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET"
        }, (err, res, body) => {
            if(err)
                reject(err);
            resolve(body);
        });
    });
}
function getRewardDataByAPI(){
    let url = "https://api.hiveon.net/api/v1/stats/miner/e623ee52af1525e4522e0bddd51f3baeecf3a0c7/ETH/billing-acc";
    let headers = {
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Referer": "https://the.hiveos.farm/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };
    return new Promise((resolve, reject) => {
        request(url, {
            "headers": headers,
            "body": null,
            "method": "GET"
        }, (err, res, body) => {
            if(err)
                reject(err);
            resolve(body);
        });
    });
}
async function getRewardData(){
    // alter table reward AUTO_INCREMENT=0;
    console.log(`-- \x1b[36m${dt.getDateTime(new Date())}\x1B[0m \x1b[33m getRewardData() \x1b[0m`);
    let data = JSON.parse(await getRewardDataByAPI());

    data.earningStats[0].unpaid = data.totalUnpaid;
    console.log(`-- \x1b[36m${dt.getDateTime(new Date())}\x1B[0m \x1b[33m ${data.earningStats[0].unpaid} \x1b[0m`)
    for(let i = 1 ; i < data.earningStats.length ; i++){
        data.earningStats[i].unpaid = data.earningStats[i-1].unpaid - data.earningStats[i].reward;
    }
    let sql = "select * from reward order by reward_timestamp desc limit 1;"
    conn.query(sql, function(err, result){
        if(err) throw err;
        let writeFlag = false;
        let lastRowTimestamp = 0;
        if(result.length == 0)
            writeFlag = true;
        else
            lastRowTimestamp = result[0].reward_timestamp;
        rewardData = data;
        for(let i = data.earningStats.length-1 ; i >= 0 ; i--){
            if(writeFlag){
                data.earningStats[i].timestamp = transtwtime(data.earningStats[i].timestamp);
                let tempUnpaid = data.earningStats[i].unpaid;
                if(data.earningStats[i].unpaid < 0)
                    tempUnpaid += data.totalPaid;
                sql = "INSERT INTO `reward`(reward_id, reward_rig, reward_meanreward, reward_reward, reward_unpaid, reward_total, reward_timestamp) VALUES (0,"+1+","+data.earningStats[i].meanReward+","+data.earningStats[i].reward+","+tempUnpaid+","+(data.totalPaid+data.earningStats[i].unpaid)+",'"+data.earningStats[i].timestamp+"')";
                conn.query(sql, function(err, result){
                    if(err) throw err;
                    // console.log(`-- \x1b[36m${dt.getDateTime(new Date())}\x1B[0m  add new reward data`);
                });
            }
            if( transtwtime(lastRowTimestamp) == transtwtime(data.earningStats[i].timestamp) )
                writeFlag = true;
        }
        sql = "select * from reward";
        conn.query(sql, function(err, result){
            if(err) throw err;
            rewardData = data;
            rewardData.earningStats = [];
            for(let i = result.length-1 ; i >= 0 ; i--){
                // console.log(result[i])
                
                rewardData.earningStats.push({"meanReward":result[i].reward_meanreward, "reward":result[i].reward_reward, "unpaid":result[i].reward_unpaid, "totalpaid":result[i].reward_total, "timestamp":dt.getDateTime(transtwtime(result[i].reward_timestamp))});
            }
        });
    });    
}
async function getHashrateData(){
    // alter table hashrate AUTO_INCREMENT=0;
    console.log(`-- \x1b[36m${dt.getDateTime(new Date())}\x1B[0m \x1b[33m getHashrateData() \x1b[0m`);
    let data = JSON.parse(await getHashrateDataByAPI());
    let sql = "select * from hashrate order by hashrate_timestamp desc limit 1;"
    conn.query(sql, function(err, result){
        if(err) throw err;
        let writeFlag = false;
        let lastRowTimestamp = 0;
        if(result.length == 0)
            writeFlag = true;
        else
            lastRowTimestamp = result[0].hashrate_timestamp;
        for(let i = data.items.length-1 ; i >= 0 ; i--){
            if(writeFlag){
                data.items[i].timestamp = transtwtime(data.items[i].timestamp);
                sql = "INSERT INTO `hashrate`(hashrate_id, hashrate_rig, hashrate_hashrate, hashrate_mean, hashrate_reported, hashrate_timestamp) VALUES (0,1,"+data.items[i].hashrate+","+data.items[i].meanHashrate+","+data.items[i].reportedHashrate+",'"+data.items[i].timestamp+"')";
                conn.query(sql, function(err, result){
                    if(err) throw err;
                    // console.log(`-- \x1b[36m${dt.getDateTime(new Date())}\x1B[0m  add new hashrate data`);
                });
            }
            if( transtwtime(lastRowTimestamp) == transtwtime(data.items[i].timestamp) )               
                writeFlag = true;
        }
        sql = "select * from hashrate";
        conn.query(sql, function(err, result){
            if(err) throw err;
            hashrateData = data;
            hashrateData.items = [];
            for(let i = result.length-1 ; i >= 0 ; i--){
                hashrateData.items.push({"hashrate":result[i].hashrate_hashrate, "meanHashrate":result[i].hashrate_mean, "reportedHashrate":result[i].hashrate_reported, "timestamp":dt.getDateTime(transtwtime(result[i].hashrate_timestamp))});
            }
        });
    });
}

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(function (req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`-- \x1b[36m${dt.getDateTime(new Date())}\x1B[0m ${ip} \x1b[33m${req.method}\x1B[0m ${req.url} `);
    next();
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
const corsOptions = { 
    origin: [ '*' ], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', 
    allowedHeaders: ['Content-Type', 'Authorization'], 
};
app.use(cors(corsOptions));

app.post('/api/login', (req, res) => {
    // alter table payout AUTO_INCREMENT=0;
    // req.query
    console.log(req.body);
    sql = 'SELECT * FROM member where member_sid="'+req.body.data.username+'" AND member_pwd="'+req.body.data.password+'";';
    conn.query(sql, function(err, result){
        if(err) throw err;
        if(result.length < 1){
            res.end("Login Fail...")
        }
        else{
            result[0].data = {
                "body" : {
                    "token" : String(result[0].member_sid)
                }
            };
            console.log(result[0])
            res.json(result[0]).end();
        }
    });
    // sql = "INSERT INTO hashrate`(hashrate_id`, hashrate_rig, hashrate_hashrate, hashrate_mean, hashrate_reported, hashrate_timestamp) VALUES (0,1,"+data.items[i].hashrate+","+data.items[i].meanHashrate+","+data.items[i].reportedHashrate+",'"+data.items[i].timestamp+"')";
});
app.post('/api/member/changepwd', (req, res) => {
    // alter table payout AUTO_INCREMENT=0;
    // req.query
    console.log(req.body);
    sql = 'UPDATE `member` SET `member_pwd`="'+req.body.data.password+'" WHERE member_sid = "'+req.body.data.username+'";';
    conn.query(sql, function(err, result){
        if(err) throw err;
        res.json(result[0]).end();
    });
    // sql = "INSERT INTO hashrate`(hashrate_id`, hashrate_rig, hashrate_hashrate, hashrate_mean, hashrate_reported, hashrate_timestamp) VALUES (0,1,"+data.items[i].hashrate+","+data.items[i].meanHashrate+","+data.items[i].reportedHashrate+",'"+data.items[i].timestamp+"')";
});
app.get('/api/member', (req, res) => {
    sql = 'SELECT * FROM member ORDER BY member_id';
    conn.query(sql, function(err, result){
        if(err) throw err;
        res.json(result).end();
    });
});
app.post('/api/member/update', (req, res) => {
    // alter table payout AUTO_INCREMENT=0;
    // req.query
    sql = 'UPDATE `member` SET `member_id`='+req.body.data.id+',`member_name`="'+req.body.data.name+'",`member_sid`='+req.body.data.sid+',`member_dep`="'+req.body.data.dep+'",`member_work`="'+req.body.data.work+'",`member_other`="'+req.body.data.other+'" WHERE member_sid='+req.body.data.sid;
    conn.query(sql, function(err, result){
        if(err) throw err;
    });
    res.end('fuk');
    // sql = "INSERT INTO hashrate`(hashrate_id`, hashrate_rig, hashrate_hashrate, hashrate_mean, hashrate_reported, hashrate_timestamp) VALUES (0,1,"+data.items[i].hashrate+","+data.items[i].meanHashrate+","+data.items[i].reportedHashrate+",'"+data.items[i].timestamp+"')";
});
app.post('/api/member/', (req, res) => {
    // alter table payout AUTO_INCREMENT=0;
    // req.query
    sql = 'INSERT INTO `member`(`member_id`, `member_name`, `member_sid`, `member_pwd`, `member_dep`, `member_work`, `member_other`) VALUES ('+req.body.data.id+', "'+req.body.data.name+'", '+req.body.data.sid+', "", "'+req.body.data.dep+'", "'+req.body.data.work+'", "'+req.body.data.other+'");';
    conn.query(sql, function(err, result){
        if(err) throw err;
    });
    res.end('fuk');
    // sql = "INSERT INTO hashrate`(hashrate_id`, hashrate_rig, hashrate_hashrate, hashrate_mean, hashrate_reported, hashrate_timestamp) VALUES (0,1,"+data.items[i].hashrate+","+data.items[i].meanHashrate+","+data.items[i].reportedHashrate+",'"+data.items[i].timestamp+"')";
});
app.delete('/api/member/:id', (req, res) => {
    sql = 'DELETE FROM `member` WHERE member_id = "'+req.params.id+'";';
    conn.query(sql, function(err, result){
        if(err) throw err;
        res.end("OK");
    });
});

app.get('/api/payout', (req, res) => {
    sql = 'SELECT * FROM payout';
    conn.query(sql, function(err, result){
        if(err) throw err;
        res.json(result).end();
    });
});
app.post('/api/payout', (req, res) => {
    // alter table payout AUTO_INCREMENT=0;
    // req.query
    sql = 'INSERT INTO `payout`(`payout_id`, `payout_name`, `payout_eth`, `payout_txt`, `payout_timestamp`) VALUES (0, "'+req.body.data.name+'", '+req.body.data.eth+', "'+req.body.data.txt+'", "'+ dt.getDateTime(transtwtime(new Date()))+'");';
    conn.query(sql, function(err, result){
        if(err) throw err;
    });
    res.end('fuk');
    // sql = "INSERT INTO hashrate`(hashrate_id`, hashrate_rig, hashrate_hashrate, hashrate_mean, hashrate_reported, hashrate_timestamp) VALUES (0,1,"+data.items[i].hashrate+","+data.items[i].meanHashrate+","+data.items[i].reportedHashrate+",'"+data.items[i].timestamp+"')";
});
app.delete('/api/payout/:id', (req, res) => {
    sql = 'DELETE FROM `payout` WHERE payout_id = "'+req.params.id+'";';
    conn.query(sql, function(err, result){
        if(err) throw err;
        res.end("OK");
    });
});

// app.get('/admin', (req, res) => {
//     res.end("有啦幹")
// });

// app.post('/admin', (req, res) => {
//     console.log(req.body);
//     res.status(299).end("fuck");
// });

app.get('/api/hashrate', (req, res) => {
    res.json(hashrateData).end();
});
app.get('/api/reward', (req, res) => {
    res.json(rewardData).end();
});
let hashrateData = {};
let rewardData   = {};

app.listen(PORT = 3000, async () => {
    setInterval(await getRewardData, 1000*60*60);
    setInterval(await getHashrateData, 3000*60*10);
    await getRewardData();
    await getHashrateData();
    console.log(`-- \x1b[36m${dt.getDateTime(new Date())}\x1B[0m  app listening on port ${PORT}.`);
});

// 
// Reset = "\x1b[0m"
// Bright = "\x1b[1m"
// Dim = "\x1b[2m"
// Underscore = "\x1b[4m"
// Blink = "\x1b[5m"
// Reverse = "\x1b[7m"
// Hidden = "\x1b[8m"

// FgBlack = "\x1b[30m"
// FgRed = "\x1b[31m"
// FgGreen = "\x1b[32m"
// FgYellow = "\x1b[33m"
// FgBlue = "\x1b[34m"
// FgMagenta = "\x1b[35m"
// FgCyan = "\x1b[36m"
// FgWhite = "\x1b[37m"

// BgBlack = "\x1b[40m"
// BgRed = "\x1b[41m"
// BgGreen = "\x1b[42m"
// BgYellow = "\x1b[43m"
// BgBlue = "\x1b[44m"
// BgMagenta = "\x1b[45m"
// BgCyan = "\x1b[46m"
// BgWhite = "\x1b[47m"
//