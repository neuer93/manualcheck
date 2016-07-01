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
    var query = 'select shopId, userId, power, avgprice, Isgroup, score1, score2, score3, photo, date, filtered, ' +
    'content, numcommonuser from commentinfoshop where userId=' + req.params.userId + ' order by shopID asc';
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

app.get('/community/:communityId', function(req, res) {
    console.log('community');
});

app.listen(3300, function (){
      console.log('Example app listening on port 3300!');
});
