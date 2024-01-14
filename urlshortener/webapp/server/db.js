const sqlite3 = require('sqlite3').verbose();
const DB_URL = './url.db';
const db = new sqlite3.Database(DB_URL, (err) => {
    if(err) {
        return console.error(err.message);
    }
    else {
        db.run("CREATE TABLE url(hashUrl, origUrl)", (err) => {
            if (err) {
                console.log(err.message);
            }
        });
    }
    console.log("Connected to the " + DB_URL + " SQLite database");

});
module.exports = db
