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
}

app.get('/', function (req, res) {
    res.render('index', {title: 'Index', message: "Index page"})
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
                    while(dataList.length < 104){ dataList.push(0);}
                    res.render('communityShop', {categories: categories, dataList: dataList});
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
    var query = 'select size, firstReviewsperuser, userList, shopList, suspiciousShopList, remark, avgScore, varScore, entropyOfShops, entropyOfGeoShops, per5StarReview, per5StartUser, avgDeltaScores, diameter, density, vertex, globalcc, done, manualCheck from community where id=' +    req.params.communityId;
    connection.query(query, function(err, result, fields){
        if(err){throw err;}
        shopList = [];
        if (result.length > 0){
            shopString = result[0].shopList;
            r = /\d+, \d+/g;
            shopStringList = shopString.match(r);
            for (item in shopStringList){
                shopId = eval(shopStringList[item].split(',')[0]);
                number = eval(shopStringList[item].split(',')[1]);
                tmp = [shopId, number];
                shopList.push(tmp);
                //console.log(tmp);
            }
        }
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
                //console.log(dateList);
                
                var currentDate = new Date(2014,0,1);
                //console.log(currentDate);
                var lastDate = new Date(2016,0,1);
                //console.log(lastDate);
                while (currentDate < lastDate){
                    var tmp = new Date(currentDate);
                    //console.log(tmp);
                    categories.push(tmp);
                    currentDate.setDate(tmp.getDate() + 7);
                }
                categories.push(currentDate);
                
                for (item in categories){
                    categories[item] = dateFormat(categories[item], 'isoDateTime').replace(/T/, '').replace(/\..+/, '').replace(/00.*/,'').replace(/-/,'').replace(/-/,'');
                }
                //console.log(categories);
                    //
                var current = 0;
                var currentNum = 0;
                var currentDate = new Date('2014-01-01');
                var tmpDate = new Date('2014-01-01');
                while (current < dateList.length){//bianli
                    tmpDate.setDate(currentDate.getDate() + 7);
                    //console.log(tmpDate);
                    if (dateList[current] > tmpDate){    
                        dataList.push(currentNum);
                        currentNum = 0;
                        currentDate.setDate(tmpDate.getDate());
                    }else{
                        currentNum += 1;
                        current += 1;
                    }
                }
                dataList.push(currentNum);
                while (dataList.length < categories.length){ dataList.push(0);}
                if(result){
                    res.render('community', {info: result, userList: userList, shopList: shopList, communityId: communityId, categories: categories, dataList: dataList});
                }
            }
        });
        
    });
});

app.listen(3300, function (){
      console.log('Example app listening on port 3300!');
});
