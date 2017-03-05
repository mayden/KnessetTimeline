/**
 * Created by AlexY on 13/01/2017.
 */

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Use connect method to connect to the Server
MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {

        console.log('Connection established to', url);


        //Close connection
        db.close();
    }
});