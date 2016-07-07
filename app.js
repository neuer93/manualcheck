var express = require('express');
var app = express();
var birds = require('./routers/birds.js')
var mysql = require('mysql');
var dateFormat = require('dateformat');

var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'nsec@522',//'nsec@522',
      database : 'sybildet'//'sybildet'
});
connection.connect();

app.set('view engine', 'pug');

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

app.get('/users/:userId', function (req, res) {
    console.log('user')
    var query = 'select SI.shopname, SCI.shopId, SCI.userId, SCI.power, SCI.avgprice, SCI.Isgroup, SCI.score1, SCI.score2, SCI.score3, SCI.photo, SCI.date, SCI.filtered, ' +
    'content, numcommonuser from commentinfoshop as SCI join shopinfo as SI on SCI.shopid = SI.shopid where userId=' + req.params.userId + ' order by shopID asc';
    console.log(query);
    connection.query(query, function(err, rows, fields){
        if(err){throw err;}
        if(rows){
            for (item in rows){
                rows[item].date = dateFormat(rows[item].date, 'isoDateTime').replace(/T/, ' ').replace(/\..+/, '').replace(/00.*/,'');
            }
            res.render('user', {reviewsList: rows});
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
    console.log(query);
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
            }
        }
        if(result){
            res.render('community', {info: result, shopList: shopList});
        }
    });
});

app.listen(3300, function (){
      console.log('Example app listening on port 3300!');
});
