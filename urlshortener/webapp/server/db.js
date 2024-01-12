const mysql = require('mysql2');

function connectDb(url, hashedUrl) {


    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'dbuser',
        password: 'test123',
        database: 'url_db'
    });

    connection.connect();

    //sanity test:
    connection.query("SELECT 1 + 1 AS solution", function(err, rows, fields) {
        if (err){
            console.log(err);
        }
        console.log(rows);
    });

    //it creates the table automatically if it does not exist
    /*connection.query('INSERT INTO url (url, hashedUrl) VALUES ($hashedUrl, $url)}', (err,rows,fields) => {
        if (err) {
            throw err;
        }
        console.log("URL hashed successfully");
    });*/

    connection.end();
}

module.exports = {
    mysql,
    connectDb
};