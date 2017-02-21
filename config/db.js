/**
 * Created by AlexY on 13/01/2017.
 */

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://testuser123:testuser123@ds163718.mlab.com:63718/heroku_3w93k9qp';

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {

        console.log('Connection established to', url);


        //Close connection
        db.close();
    }
});