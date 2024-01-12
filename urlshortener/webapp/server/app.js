const express = require('express'); //not with a capital 'E'.
const uuid = require('uuid');
const app = express();

//database setup. db.js is being ignored:
var options = {

}
const pgp = require('pg-promise')(options);
const db = pgp('postgres://localhost:5432/url');

console.log(db.one('SELECT $1 as value', 123)
    .then((data) => {
        console.log('DATA:', data.value)
    })
    .catch((error) => {
        console.log('Error:', error);
    }));


//local imports must include the directory (not required the FQN). without it, it will assume it's in node_modules.
//extension .js is not necessary.
//const db = require('./db.js');
//in this setup, SAPUI5 app will be served along with the backend iff index.hmtl is in the same directory. Ideally, they will run as two separate services.
//app.use(express.static(__dirname));
//below statement configures how express.js will parse request bodies for you.
app.use(express.json());

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



//shorten the URL
app.post("/shorten", async (request, response) => {
    var content = request.body["url"];
    if (!content) {
        response.status(400).json({
            "error": "Invalid field: missing \'url\' key"
        });
        /*response.send({
            "error" : "invalid field: missing \'URL\' key"
        }); */
        return;
    }
    var hashCode = uuid.v5(content, uuid.v5.URL);
    const localHost = "http://localhost/";
    try {
        var data = {
            hashUrl: hashCode,
            url: content
        };
        var sql = 'INSERT INTO url (hashUrl, url) VALUES (?,?)';
        var params = [data.hashUrl, data.url];
        const result = db.run(sql, params, function(err, result) {
            if (err) {
                response.status(400).json({"error" : err.message});
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
    response.send(value);
});
