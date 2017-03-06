var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var json2csv = require('json2csv');

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

  var stage = parseInt(req.query.stage);
  var exportId = parseInt(req.query.export);



  switch(stage) {
    case 1:
      findVars = { $or: [ { "stage": "הצעה"  }, { "isEvent": "true" } ] };
      break;
    case 2:
      findVars = { $or: [ { "stage": "בוועדה"  }, { "isEvent": "true" } ] };
      break;
    case 3:
      findVars = { $or: [ { "stage": "קריאה ראשונה"  }, { "isEvent": "true" } ] };
      break;
    case 4:
      findVars = { $or: [ { "stage": "נפלה בקריאה ראשונה"  }, { "isEvent": "true" } ] };
      break;
    case 5:
      findVars = { $or: [ { "stage": "נפלה בקריאה שלישית"  }, { "isEvent": "true" } ] };
      break;
    case 6:
      findVars = { $or: [ { "stage": "אושרה"  }, { "isEvent": "true" } ] };
      break;
    case 7:
      findVars = { $or: [ { "stage": "לא ידוע"  }, { "isEvent": "true" } ] };
      break;
    case 8:
      findVars = { $or: [ { "stage": "עברה קריאה טרומית"  }, { "isEvent": "true" } ] };
      break;
    case 9:
      findVars = { $or: [ { "stage": "נפלה בקריאה טרומית"  }, { "isEvent": "true" } ] };
      break;
    case 10:
      findVars = { $or: [ { "stage": "הוקפאה בכנסת קודמת"  }, { "isEvent": "true" } ] };
      break;
    default:
      break;
  }


  findVars.stage_date = { $gte: lowerDate,  $lte: upperDate };

  var options = {
    "sort": { "stage_date": -1 },
  };


  if(exportId == 1)
  {
    var results = events.find(findVars, options).then(function(result){
      res.send(JSON.stringify(result, null , ' '));
    });
  }
  else if(exportId == 2)
  {
    var results = events.find(findVars, options).then(function(result){

      json2csv({ data: result}, function(err, csv) {
        if (err) {
          console.log(err);
          res.statusCode = 500;
          return res.end(err.message);
        }
        res.attachment('exported-data.csv');
        res.end(csv);
      });
    });
  }
  else
  {
    var results = events.find(findVars, options).then(function(result) {
      res.render('year', {
        results: result,
        year: yearId,
        stage: stage,
        path: req.path
      });
    });
  }

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
