var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('index', {
      title: 'הצעות הכנסת והשפעותיהם'
    });

});

router.get('/update-events', function(req, res, next) {
  var db = req.db;
  var events = db.get('events');


  var objects = JSON.parse(fs.readFileSync('Events.json', 'utf8'));

  events.insert(objects.Events, {ordered: true}, function (err, doc) {
    if (err) {
      res.send("There was a problem adding the information to the database.");
    }
    else {

      res.send("OK");
    }
  });

});

router.get('/add-event', function(req, res, next) {
  res.render('addevent', {
  });
});

router.post('/add-event', function(req, res, next) {
  var db = req.db;
  var events = db.get('events');

  var object = {
    "stage_date": req.body.date,
    "title": req.body.title,
    "type": "event",
    "description": req.body.desc,
    "isEvent": "true"
  };


  events.insert(object, {ordered: true}, function (err, doc) {
    if (err) {
      console.log(err);
      res.render('addevent', {
        result: err
      });
    }
    else {
      console.log(doc);
      res.render('addevent', {
        result: doc
      });
    }
  });


});



router.get('/year/:id', function(req, res, next) {
  var yearId = parseInt(req.params.id);

  var lowerDate = yearId + "-01-01";
  var upperDate = yearId + "-12-31";
  var db = req.db;
  var events = db.get('events');
  var findVars = {};

  var stage = req.query.stage;
  if(stage == 1)
  {
    findVars.stage = { $ne : "הצעה"};
  }

  findVars.stage_date = { $gte: lowerDate,  $lte: upperDate };
  var options = {
    "sort": { "stage_date": -1 },
  };


  var results = events.find(findVars, options).then(function(result) {
    res.render('year', {
      results: result,
      year: yearId,
      stage: stage,
      path: req.path
    });
  });
});



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
