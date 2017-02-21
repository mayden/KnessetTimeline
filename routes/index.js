var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('index', {
      title: 'הצעות הכנסת והשפעותיהם'
    });

});

router.get('/year/:id', function(req, res, next) {
  var yearId = parseInt(req.params.id);

  var lowerDate = yearId + "-01-01";
  var upperDate = yearId + "-12-31";
  var db = req.db;
  var events = db.get('events');

  var options = {
    "sort": { "stage_date": -1 },
  };


  var results = events.find({
    'stage_date': { $gte: lowerDate,  $lte: upperDate }
  }, options).then(function(result) {
    res.render('year', {
      results: result,
      year: yearId,
    });
  });
});

/*
router.get('/test', function(req, res, next) {
  var db = req.db;
  var events = db.get('events');

  events.update({}, { $set: { type : "bill"}}, {multi: true}, function (err, doc) {
    if (err) {

      res.send("There was a problem adding the information to the database.");
    }
    else {

      res.send(doc);

    }
  });
});
*/

router.get('/updatedb', function(req, res, next) {
  var db = req.db;
  var events = db.get('events');
  var offset = req.query.offset;
  console.log(offset);
  var apiUrl = "http://oknesset.org/api/v2/bill/?limit=1000&order_by=-stage_date&offset="  + offset;
  request({
    url: apiUrl,
    json: true
  }, function (error, response, apiData) {
    if (!error && response.statusCode === 200) {
      // Submit to the DB
      events.insert(apiData.objects, {ordered: true}, function (err, doc) {
        if (err) {
          // If it failed, return error
          res.send("There was a problem adding the information to the database.");
        }
        else {
          // And forward to success page
         // res.send(doc);
          res.send(apiData.meta);
          //console.log(doc);
        }
      });
      console.log(apiData.meta);

    }
  });
});

module.exports = router;
