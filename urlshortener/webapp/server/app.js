const express = require('express'); //not with a capital 'E'.
const uuid = require('uuid');
const winston = require('winston')
const app = express();

//local imports (i.e., not set by npm) must include the directory (not required the FQN). without it, it will assume it's in node_modules.
const db = require('./db.js');

//in this setup, SAPUI5 app will be served along with the backend iff index.hmtl is in the same directory. Ideally, they will run as two separate services.
//app.use(express.static(__dirname));
//below statement configures how express.js will parse request bodies for you.
app.use(express.json());

//setup a logger for further analysis:
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: String(new Date()) + "_log.log",
            level: 'info'
        })
    ]
})
app.use((req,res,next) => {
    logger.info({
        method: req.method,
        params: req.params,
        body: req.body,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: Date.now() - req.startTime
    });
    next();
});

const port = process.env.port || 3001;
//(): anonymous function.
app.listen(port, () => {
    console.log("Server listening on port: " + port);
});

//get status of the API:
app.get('/status', (request,response) => {
    const status = {
        "Status" : "Alive and Kicking"
    };
    response.send(status);
});

"use strict";

//shorten the URL: step 1
app.post("/shorten", async (request, response) => {
    var content = request.body["url"];
    if (!content) {
        response.status(400).json({
            "error": "Invalid field: missing \'url\' key"
        });
        return;
    }
    var hashCode = uuid.v5(content, uuid.v5.URL).split("-")[0];
    const localHost = "http://localhost/";
    try {
        var data = {
            hashUrl: hashCode,
            url: content
        };
        var sql = 'INSERT INTO url (hashUrl, origUrl) VALUES (?,?)';
        //params replace the parametrs in the query as per order that's in the array supplied.
        var params =  [localHost + data.hashUrl, data.url];
        err = false;
        const result = db.run(sql, params, function(err, result) {
            if (err) {
                //return does not interrupt processing as its the callback from the DB.
                response.status(400).json({"error" : err.message});
                err = !err;
            }
        });
    } catch (error) {
        console.log(error.message);
    }
    const value = {
        "shortened" : localHost + hashCode,
        "hash" : hashCode,
        "original": content
    }
    if (!err){
        response.send(value);
    }    
});

app.search("/shorten", function(request, response) { 
    var hashUrl = request.body["url"];
    if (!hashUrl) {
        response.status(400).json({
            "message": "invalid parameter: key should be \'url\'"
        });
        return;
    }
    try {
        let sql = "SELECT * from url WHERE hashUrl = ?";
        let params = [hashUrl];
        var originalUrl = "";
        //the absence of errMessage inadvertently made loc 108-119 stop the api endpoint.
        //var errMessage = "";
        //queryDb(sql,params, originalUrl).then(onSuccessQuery,onFailureQuery)
        db.get(sql, params, function(err, result){
            if (err) {
                console.log(err.message);
                response.status(500).json({
                    "message": err.message
                })
            }
            else if (result) {
                //response.setHeader("Location", result);
                response.status(302).json({
                    "message" : result
                });
            }
            else {
                response.status(404).json({
                    "message": "URL not found"
                })
            }
        });
    }
    catch (error) {

    }
});

app.delete("/shorten", function(request, response){
    var hashedUrl = request.body["url"];
    if (!hashedUrl) { 
        response.status(400).send({
            "message" : "bad request: missing 'url' parameter in body request"
        })
        return;
    }
    //check for the existence of the row: we don't need as the DMBS implements this check (i suppose, most DBMS does.)
    var sql = "DELETE FROM url where hashUrl = ?";
    var params = [hashedUrl];
    db.run(sql, params, function(err,result) {
        if (err) {
            console.log(err.message);
            response.status(500).json({ 
                "message": err.message
            });
        }
        else {
            if (this.changes) {
                response.json({
                    "message": hashedUrl + " deleted successfully from database"
                });
            }
            else {
                response.json({
                    "message": "URL not found to be deleted"
                });
            }
        }
    });
});