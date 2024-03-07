/*The DB managemenet here really could use a ORM instead of manually */ 
const sqlite3 = require('sqlite3').verbose();
const DB_URL = './url.db';
const db = new sqlite3.Database(DB_URL, (err) => {
    if(err) {
        return console.error(err.message);
    }
    else {
        db.run('CREATE TABLE IF NOT EXISTS user(\
                  username TEXT,\
                  password TEXT,\
                  email TEXT)', (err) => {
            if (err) {
                console.log(err.message);
            }
        });
        db.run("CREATE TABLE IF NOT EXISTS url(\
                 hashUrl TEXT,\
                 origUrl TEXT,\
                 username TEXT,\
                 FOREIGN KEY (username) REFERENCES user (username))", (err) => {
            if (err) {
                console.log(err.message);
            }
        });
    }
    console.log("Connected to the " + DB_URL + " SQLite database");

});
module.exports = db
