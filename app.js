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
                            while (currentDate <= rows[0].endTime){
                                currentDate.setDate(currentDate.getDate() + 7);
                                current++;
                            }
                            endWeek = current;
                            // actually plus one for pug file
                            console.log(beginWeek);
                            console.log(endWeek);
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
    var userId = req.params.userId;
    var query1 = 'select SI.shopname, SCI.shopId, SCI.userId, SCI.power, SCI.avgprice, SCI.Isgroup, SCI.score1, SCI.score2, SCI.score3, SCI.photo, SCI.date, SCI.filtered, ' +
        'content, numcommonuser from commentinfoshop as SCI join shopinfo as SI on SCI.shopid = SI.shopid where userId=' + req.params.userId + ' order by shopID asc';
    var query2 = 'select coreNeighbour from usernode where userId=' + req.params.userId;
    console.log(query1);
    console.log(query2);
    var coreNeighbour = null;
    connection.query(query2, function(err, results, fields){
        if(err){throw err;}
        if(results){
            if (results.length == 0){
                coreNeighbour = []
            }else{
                coreNeighbour = results[0].coreNeighbour.split(',');
            }
            //console.log(coreNeighbour);
        }
    });
    connection.query(query1, function(err, rows, fields){
        if(err){throw err;}
        if(rows){
            //匹配到timeslot，需要先query出来，在进行查找
            
            //console.log(rows);
            var query_3 = 'select campaignwindow, sybilness, communityEvents from userinfo where userid = '+ userId;
            //console.log(query_3);
            connection.query(query_3, function(err_3, result, fields){
                if (err_3) {throw err_3;}
                if (result){
                    //console.log(result);
                    campaignwindow = result[0].campaignwindow;
                    sybilness = result[0].sybilness;
                    communityEvents = result[0].communityEvents;
                    if (campaignwindow == null){
                        campaignWindowList = [];
                    }else{
                        campaignWindowList = campaignwindow.split(',');
                    }
                    camWinList = [];
                    for (var i = 0; i < campaignWindowList.length; ++i){
                        camWinList.push(eval(campaignWindowList[i]));
                    }
                    //找到timeslotid
                    camWinList.push(-1)
                    var query_4 = 'select id, shopId, beginTime, endTime from timeslot where id in ('+ camWinList +')';
                    console.log(query_4);
                    connection.query(query_4, function(err_4, result_4, fields){
                        if (err_4) {throw err_4;};
                        if (result_4){
                            timeSlotList = [];
                            for (item in result_4){
                                begin = result_4[item].beginTime;
                                end = result_4[item].endTime;
                                shopid = result_4[item].shopId;
                                id = result_4[item].id;
                                time = [begin, end, shopid, id];
                                timeSlotList.push(time);
                            }
                            console.log(timeSlotList);
                            for (var i = 0; i < rows.length; ++i){
                                curDate = rows[i].date;
                                shopid = rows[i].shopId;
                                //console.log(shopid);
                                slotList = [];
                                for (var j = 0; j < timeSlotList.length; ++j){
                                    if (shopid = timeSlotList[j][2]){
                                        //console.log(timeSlotList[j][2]);
                                        if (curDate <= timeSlotList[j][1] && curDate >= timeSlotList[j][0]){
                                           //console.log('find');
                                           //console.log(shopid);
                                           slotList.push(timeSlotList[j][3]);
                                        }
                                    }
                                }
                                rows[i].slotId = slotList.toString();
                            }
                            for (item in rows){
                                rows[item].date = dateFormat(rows[item].date, 'isoDateTime').replace(/T/, ' ').replace(/\..+/, '').replace(/00.*/,'');
                            }
                            // calculation for sybilness and communtiyEvents
                            console.log(sybilness);
                            if (sybilness == null){
                                sybilness = "{}";
                            }
                            var sybilList = [];
                            r = /\d+(.\d+)/g;
                            sybilinfo = sybilness.match(r);
                            r2 = /\d+/g;
                            communityInfo = communityEvents.match(r2);
                            console.log(sybilinfo);
                            console.log(communityInfo);
                                                        if (communityInfo == null){
                                                           communityInfo = {} 
                                                       }
                            if (sybilinfo  == null){
                                sybilinfo = [];
                            }
                            // commentDic[communityId] = number of comments;
                            commentDic = {};
                            for (var i = 0; i < communityInfo.length/2; ++i){
                                com = eval(communityInfo[2*i]);
                                number = eval(communityInfo[2*i+1]);
                                commentDic[com]=number; 
                            }
                            //console.log(commentDic);
                            for (var i = 0; i < sybilinfo.length/2; ++i){
                                com = eval(sybilinfo[2*i]);
                                sybil = eval(sybilinfo[2*i+1]);
                                number = commentDic[com];
                                tmp = [com, sybil, number];
                                sybilList.push(tmp);
                            }
                            console.log(sybilList);
                            sybilList.sort(function(a,b){
                                if (a[1] < b[1]){
                                    return 1;
                                }
                                else {
                                    return -1;
                                }
                            });
                            var query_5 = 'select community from userinfo where userId = '+ userId;
                            connection.query(query_5, function(err_5, res_5, fields){
                                if (err_5) {throw err_5;}
                                if (res_5){
                                    var communityId = res_5[0].community;
                                    res.render('user', {reviewsList: rows, communityId : communityId, coreNeighbour: coreNeighbour, sybilList: sybilList});
                                }
                            });
                        }
                    });
                }
            });
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
                if (shopIdList.length == 0){
                    shopIdList.push(-1)
                }
                var query_1 = 'select shopid, shopName from shopinfo where shopid in (' + shopIdList +')';
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
                           
                            var communityID = result[0].id;
                            var query3 = "select userId, sybilness from userinfo where sybilness like '%" + communityId +"%'";
                            console.log(query3);
                            connection.query(query3, function(err3, res3, fields){
                                if (err3) {throw err3;}
                                if (res3){
                                    userIdAndSyb = [];
                                    r = /\d+(.\d+)/g;
                                    console.log('result length');
                                    console.log(res3.length);
                                    userToSybilnessDict = {}
                                    for (var i = 0; i < res3.length; ++i){
                                        userid = eval(res3[i].userId);
                                        sybilinfo = res3[i].sybilness.match(r);
                                        var j;
                                        var sybilGrade;
                                        for (j = 0; j < sybilinfo.length/2; ++j){
                                            if (eval(sybilinfo[2*j]) == communityId){
                                                sybilGrade = eval(sybilinfo[2*j+1]);
                                                break;
                                            }
                                        }
                                        if (j==sybilinfo.length/2){
                                            //console.log('error');
                                            continue;
                                        }
                                        tmp = [userid, sybilGrade];
                                        userToSybilnessDict[userid] = [sybilGrade]
                                        //console.log(tmp);
                                        userIdAndSyb.push(tmp);
                                    } 
                                    console.log(userIdAndSyb.length);
                                    //userid + sybil id
                                    // now to find the correspondent community
                                    var userIdList = [];
                                    for (var i = 0; i < userIdAndSyb.length; ++i){
                                        userIdList.push(userIdAndSyb[i][0]);
                                    }
                                    if (userIdList.length == 0){
                                        userIdList.push(-1);
                                    }
                                    var query4 = 'select userId, community from userinfo where userId in (' +userIdList +')';
                                    //console.log(query4);
                                    var sybilInfoList = [];
                                    connection.query(query4, function(err4, res4, fields){
                                        if(err4) { throw err4;}
                                        if (res4){
                                            for (var i = 0; i < res4.length; ++i){
                                                userid = res4[i].userId;
                                                comid = res4[i].community;
                                                userToSybilnessDict[userid].push(comid)
                                            }
                                            for (userid in userToSybilnessDict){
                                                tmp = [userid, userToSybilnessDict[userid][1], userToSybilnessDict[userid][0]];
                                                if (tmp[2] > 0.5 || userToSybilnessDict.length < 6000){
                                                    sybilInfoList.push(tmp);
                                                }
                                            }
                                            //console.log(sybilInfoList);
                                            sybilInfoList.sort(function(a,b){
                                                if (a[2] < b[2]){
                                                    return 1;
                                                }
                                                else{
                                                    return -1;
                                                }
                                            });
                                            res.render('community', {info: result, sybilList : sybilInfoList, communityID: communityID, userList: userList, shopList: shopList, communityId: communityId, categories: categories, dataList: dataList});
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
                
            });
        }
    });
});

app.listen(3300, function (){
    console.log('Example app listening on port 3300!');
});
