var express = require('express');
var app = express();
var birds = require('./routers/birds.js')
var mysql = require('mysql');
var dateFormat = require('dateformat');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'nsec@522',
    database : 'sybildet'
});
connection.connect();

app.set('view engine', 'pug');
app.use(express.static('public'));

var middleTest = function(req, res, next){
    console.log(Date.now());
    console.log(1);
    next();
    console.log(2);
};

app.get('/', function (req, res) {
    res.render('index', {title: 'Index', message: "Index page"});
});

app.get('/test', function (req, res) {
    res.send('test');
});

app.get('/community-shop/:communityId/:shopId', function (req, res) {
    var shopId = req.params.shopId;
    var communityId = req.params.communityId;
    var query = "select userid,date from commentinfoshop where shopid = " + shopId;
    connection.query(query, function(err, rows, fields){
        if(err){throw err;}
        var reviewsList = [];
        if(rows){
            for (item in rows){
                var dateTmp = rows[item].date;
                var userId = rows[item].userid;
                reviewsList.push({date: dateTmp, userId: userId});
            }
            console.log(reviewsList.length);
            console.log(communityId);
            var query = "select userList from community where id = " + communityId;
            connection.query(query, function(err, rows, fields){
                if(err){throw err;}
                if (rows){
                    userList = rows[0].userList.split(',');
                    for (i in userList){
                        userList[i] = eval(userList[i]);
                    }
                    var dateList = [];
                    for (i in reviewsList){
                        if (userList.indexOf(reviewsList[i].userId) >= 0){
                            dateList.push(reviewsList[i].date);
                        }
                    }
                    dateList.sort(function(a,b){
                        return new Date(a) - new Date(b);
                    });

                    /*
                     * Calculate historam.
                     */
                    var categories = [];
                    var dataList = [];
                    for (var i=0; i < 104; ++i){
                        categories.push(i);
                    }
                    var current = 0;
                    var currentNum = 0;
                    var currentDate = new Date('2014-01-01');
                    while (current < dateList.length){//bianli
                        var tmpDate = new Date(currentDate);
                        if (dateList[current] > tmpDate.setDate(currentDate.getDate() + 7)){
                            dataList.push(currentNum);
                            currentNum = 0;
                            currentDate.setDate(currentDate.getDate() + 7);
                        }else{
                            currentNum += 1;
                            current += 1;
                        }
                    }
                    dataList.push(currentNum);
                    while(dataList.length < 104){ dataList.push(0);}
                    var query2 = 'select beginTime, endTime from timeslot where communityId = '+ communityId + ' and shopId = ' + shopId;
                    console.log(query2);
                    connection.query(query2, function(err, rows, fields){
                        if (err) {throw err;}
                        if (rows){
                            var begingWeek = 0;
                            var endWeek = 0;
                            var current = 0;
                            var currentDate = new Date('2014-01-01');
                            while (currentDate < rows[0].beginTime){
                                currentDate.setDate(currentDate.getDate() + 7);
                                current++;
                            }
                            beginWeek = current;
                            while (currentDate < rows[0].endTime){
                                currentDate.setDate(currentDate.getDate() + 7);
                                current++;
                            }
                            endWeek = current;
                            res.render('communityShop', {categories: categories, dataList: dataList, beginTime : beginWeek, endTime : endWeek});
                        }
                    });
                    
                }
            });
        }
    });
});

app.get('/users/:userId', function (req, res) {
    console.log('user');
    var query1 = 'select SI.shopname, SCI.shopId, SCI.userId, SCI.power, SCI.avgprice, SCI.Isgroup, SCI.score1, SCI.score2, SCI.score3, SCI.photo, SCI.date, SCI.filtered, ' +
        'content, numcommonuser from commentinfoshop as SCI join shopinfo as SI on SCI.shopid = SI.shopid where userId=' + req.params.userId + ' order by shopID asc';
    var query2 = 'select coreNeighbour from usernode where userId=' + req.params.userId;
    console.log(query1);
    console.log(query2);
    var coreNeighbour = null;
    connection.query(query2, function(err, results, fields){
        if(err){throw err;}
        if(results){
            coreNeighbour = results[0].coreNeighbour.split(',');
            //console.log(coreNeighbour);
        }
    });
    connection.query(query1, function(err, rows, fields){
        if(err){throw err;}
        if(rows){
            for (item in rows){
                rows[item].date = dateFormat(rows[item].date, 'isoDateTime').replace(/T/, ' ').replace(/\..+/, '').replace(/00.*/,'');
            }
            res.render('user', {reviewsList: rows, coreNeighbour: coreNeighbour});
        }
    });
});

app.get('/allCommunity', function(req, res){
    console.log('all community');
    var query = 'select id, manualCheck, size, avgDeltaScores, entropyOfShops, entropyOfGeoShops from community where done = 0 order by size desc';
    console.log(query);
    connection.query(query, function(err, result, fields){
        if(err){throw err;}
        if(result){
            res.render('allCommunity', {info: result});
        }
    });
});

app.get('/community/:communityId', function(req, res) {
    console.log('community');
    communityId = req.params.communityId;
    if(req.query.isManualCheck){
        if(req.query.isManualCheck == '1' || req.query.isManualCheck == '0'){
            var manualCheck = req.query.isManualCheck;
            var update = 'update community set manualCheck=' + manualCheck + ' where id=' + req.params.communityId;
            console.log(update);
            connection.query(update, function(err, result){
                if(err){throw err;}
                //console.log('update affectedRows',result.affectedRows);
            });
        }
        else{
            if(req.query.isManualCheck != ''){
                res.render('error');
                return;
            }
        }
    }
    var query = 'select id, size, firstReviewsperuser, userList, shopList, suspiciousShopList, remark, avgScore, varScore, entropyOfShops, entropyOfGeoShops, per5StarReview, per5StartUser, avgDeltaScores, diameter, density, vertex, globalcc, done, manualCheck from community where id=' +    req.params.communityId;
    connection.query(query, function(err, result, fields){
        if(err){throw err;}
        shopList = [];
        shopIdList = [];
        shopNumList = [];
        if (result.length > 0){
            shopString = result[0].shopList;
            r = /\d+, \d+/g;
            shopStringList = shopString.match(r);
            // go to timeslot and try to select the valid shopId;
            query_0 = 'select shopId, beginTime, endTime from timeslot where communityId = ' + communityId;
            console.log(query_0);
            to_select = [];
            beginTimeList = [];
            endTimeList = [];
            beginTimeListSelect = [];
            endTimeListSelect = [];
            connection.query(query_0, function(err_0, res0, fields){
                if (err_0) {throw err_0;}
                if (res0){
                    for (item in res0){
                        to_select.push(eval(res0[item].shopId));
                        beginTimeList.push(res0[item].beginTime);
                        endTimeList.push(res0[item].endTime);
                    }
                }
                //console.log(to_select);
                console.log(to_select.length);
                console.log(shopStringList.length);
                for (item in shopStringList){
                    shopId = eval(shopStringList[item].split(',')[0]);
                
                    if (to_select.indexOf(shopId)<0) {continue;} // select valid ones
                    shopNum = eval(shopStringList[item].split(',')[1]);
                    shopIdList.push(shopId);
                    shopNumList.push(shopNum);
                    beginTimeListSelect.push(beginTimeList[to_select.indexOf(shopId)]);
                    endTimeListSelect.push(endTimeList[to_select.indexOf(shopId)]);
                }
                console.log(shopIdList.length);
                var query_1 = 'select shopid, shopName from shopinfo where shopid in (' + shopIdList +')';
                //console.log(query_1);
                connection.query(query_1, function(err_1, res1, fields){
                    if (err_1){ throw err_1;}
                    for (var i = 0; i < res1.length; ++i){
                        shopId = res1[i].shopid;
                        shopname = res1[i].shopName;
                        shopNum = shopNumList[shopIdList.indexOf(shopId)];
                        beginTime = beginTimeListSelect[shopIdList.indexOf(shopId)];
                        endTime = endTimeListSelect[shopIdList.indexOf(shopId)];
                        tmp = [shopId, shopNum, shopname, beginTime, endTime];
                        //console.log(tmp);
                        shopList.push(tmp);
                    }
                    shopList.sort(function(a,b){
                        if (a[1] < b[1]){
                            return 1;
                        }else{
                            return -1;
                        }
                    });
                    for (var i = 0; i < shopList.length; ++i){
                        shopList[i][3] = dateFormat(shopList[i][3], 'isoDateTime').replace(/T/, ' ').replace(/\..+/, '').replace(/00.*/,'');
                        shopList[i][4] = dateFormat(shopList[i][4], 'isoDateTime').replace(/T/, ' ').replace(/\..+/, '').replace(/00.*/,'');
                    }
                    console.log(shopList);
                    userList = [];
                    if (result.length>0){
                        userString = result[0].userList;
                        userStringList = userString.split(',');
                        for (item in userStringList){
                            userList.push(userStringList[item]);
                        }
                    }
                    //community->user->review
                    var query2 = "select userId,date from commentinfoshop where userId in ("  + userList + ")";
                    //console.log(query2);
                    var categories = [];
                    var dataList = [];
                    connection.query(query2, function(err, rows, fields){
                        if(err){throw err;}
                        var reviewsList = [];
                        if(rows){
                            for (item in rows){
                                var dateTmp = rows[item].date;
                                var userId = rows[item].userid;
                                reviewsList.push({date: dateTmp, userId: userId});
                            }
                            var dateList = [];
                            for (i in reviewsList){
                                dateList.push(reviewsList[i].date);
                            }
                            dateList.sort(function(a,b){
                                return new Date(a) - new Date(b);
                            });
                            // calculate the distribution of the dates
                            for (var i=0; i < 104; ++i){
                                categories.push(i);
                            }
                            var current = 0;
                            var currentNum = 0;
                            var currentDate = new Date('2014-01-01');
                            while (current < dateList.length){//bianli
                                var tmpDate = new Date(currentDate);
                                if (dateList[current] > tmpDate.setDate(currentDate.getDate() + 7)){
                                    //console.log(currentDate)
                                    //console.log(currentNum);
                                    dataList.push(currentNum);
                                    currentNum = 0;
                        
                                    currentDate.setDate(currentDate.getDate() + 7);
                                }else{
                                    currentNum += 1;
                                    current += 1;
                                }
                            }
                            dataList.push(currentNum);
                            while(dataList.length < 104){ dataList.push(0);}
                            //if(result){
                            var communityID = result[0].id;
                            res.render('community', {info: result, communityID: communityID, userList: userList, shopList: shopList, communityId: communityId, categories: categories, dataList: dataList});
                            //}
                        }
                    });
                });
                
            });
            
            
        }
        

    });
});

app.listen(3330, function (){
    console.log('Example app listening on port 3330!');
});
