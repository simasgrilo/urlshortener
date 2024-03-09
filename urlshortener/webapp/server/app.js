const express = require('express'); //not with a capital 'E'.
const uuid = require('uuid');
const winston = require('winston');
const session = require('cookie-session');
const cookieParser = require('cookie-parser');
const app = express();

//local imports (i.e., not set by npm) must include the directory (not required the FQN). without it, it will assume it's in node_modules.
const db = require('./db.js');

//in this setup, SAPUI5 app will be served along with the backend iff index.hmtl is in the same directory. Ideally, they will run as two separate services.
//app.use(express.static(__dirname));
//below statement configures how express.js will parse request bodies for you.
app.use(express.json());

//required for session auth
app.use(session({//secret is used to secure the session data.
    name: "session",
    secret: 'secret',
    maxAge: 24 * 60 * 60 * 1000
}));

"use strict";

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
            url: content,
            user: session["userId"]
        };
        var sql = 'INSERT INTO url (hashUrl, origUrl, username) VALUES (?,?,?)';
        //params replace the parametrs in the query as per order that's in the array supplied.
        var params =  [localHost + data.hashUrl, data.url, request.session["userId"]];
        err = false;
        db.run(sql, params, function(err, result) {
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
        let sql = "SELECT * from url WHERE hashUrl = ? and username = ?";
        let params = [hashUrl, request.session["userId"]];
        var originalUrl = "";
        //the absence of errMessage inadvertently made loc 108-119 stop the api endpoint.
        //var errMessage = "";
        //queryDb(sql,params, originalUrl).then(onSuccessQuery,onFailureQuery)
        db.get(sql, params, function(err, result){
            if (err) {
                console.log(err.message);
                response.status(500).json({
                    "message": "Please contact system administrator: ERR - " + err.message
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
    var sql = "DELETE FROM url where hashUrl = ? and username = ?";
    var params = [hashedUrl, request.session["userId"]];
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
app.search("/urlcollection", function(request, response) {
    var username = request.body["user"];
    var sql = "SELECT hashUrl, origUrl from url where username = ?";
    db.all(sql, [request.session["userId"]], function(err, result) {
        if (err) {
            response.status(500).json({
                "message:": err.message
            });
        }
        if (result) {
            response.status(200).json({
                "result": result
            });
        }
    });

});

/*Authentication. this can be modularized.*/ 
app.get("/logon", function(request, response) {
    //checks whether the user is authenticated.
    var cookies = request.session;
    if (cookies) {
        //user already authenticated.
        response.status(200).json({
            "message" : "Welcome!",
            "username": cookies["userId"]
        });
    }
});

app.post("/auth", function(request, response) {
    var username = request.body["username"];
    var password = request.body["password"];
    if (username && password) {
        //hash password
        password = uuid.v5(password,uuid.v5.URL);
        var params = [username, password];
        var sql = "SELECT * FROM user WHERE username = ? AND password = ?";
        db.get(sql, params, function(err, result){
            if (err) {
                throw err;
            }
            if (result) {
                sessionToken = uuid.v4();
                session[sessionToken] = {
                    userId: username 
                }
                request.session.userId = username
                //response.cookie("session_token", session)
                response.status(200).json({
                    "message" : "Welcome!",
                    "username": username
                });
                //response.redirect("index.html");
                //response.end();
            }
            else {
                response.status(400).json({
                    "message": "Please insert a valid username or password"
                });
            }
        });
    } else {
        response.status(404).send("Please insert a valid username or password");
    }
});

app.post("/register", function(request, response){
    var username = request.body["username"];
    var password = request.body["password"];
    var email = request.body["email"];
    var exists = false;
    //check whether username exists:
    const checkSql = "SELECT * FROM user WHERE username = ?";
    db.run(checkSql, [username], function(err, result) {
        if (result){
            response.status(400).json({
                "message": "Username {} already exists".format(username)
            }).end()
        }
    });
    if (username && password && email) {
        password = uuid.v5(password, uuid.v5.URL);
        var params = [username, password, email];
        var insertSql = "INSERT INTO user (username, password, email) VALUES (?,?,?)";
        db.run(insertSql, params, function(err){
            if (err) {
                throw err;
            }
            if (this.changes) {
                response.status(200).json({
                    "message": "Account created Successfully"
                });
            }
            else {
                response.status(500).json({
                    "message": "Error in creating user. Please contact the system administrator"
                });
            }
        });
    } else {
        response.status(400).json({
            "message": "Missing either username, password or email. Please check and try again"
        });
    }
});