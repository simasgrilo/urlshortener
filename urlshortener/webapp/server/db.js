const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("db.sqlite", async function(err) {
    if (err) {
        console.log(err.message);
        throw err;
    } 
    else {
        await db.run('CREATE TABLE url (hashUrl TEXT, url TEXT)', function(err) {
            if (err) {
                //table exists
                console.log(err.message);
            }
            else {
                //you can use this callback to populate initial rows everytime the table is initialized (if required).
            }
        });
    }
});


module.exports = {
    db
};