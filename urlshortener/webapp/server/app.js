const express = require('express'); //not with a capital 'E'.
const uuid = require('uuid');
//local imports must include the directory (not required the FQN). without it, it will assume it's in node_modules.
const db = require('./db');
const app = express();
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
app.post("/shorten", (request, response) => {
    var content = request.body["url"];
    var hashCode = uuid.v5(content, uuid.v5.URL);
    const localHost = "http://localhost/";
    try {
        console.log("try");
        db.connectDb(content, hashCode);
    } catch (error) {
        console.log("error");
    }
    const value = {
        "shortened" : localHost + hashCode,
        "hash" : hashCode,
        "original": content
    }    
    response.send(value);
});
