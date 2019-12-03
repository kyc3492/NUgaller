var mysql  = require('mysql');
var Keys = require('./private_keys.js');

var dbconn = mysql.createConnection({
  host     : Keys.DBHost,
  user     : Keys.DBUser,
  password : Keys.DBPass,
  database : Keys.DBDatabase
});

var result;

async function dbSelection(){
  dbconn.connect(function(err){
    if(err){
      console.log('Database connection error');
    }else{
      console.log('Database connection successful');
    }
  });

  dbconn.query('SELECT * FROM NUtellerRequested', function(err, records){
      if(err) throw err;
      result = records;
      console.log(records);
      console.log("Rows of query: " + records.length);
  });

  dbconn.end(function(err) {
      console.log('Connection Finished');
  });
}

dbSelection();

module.exports = {
  dbSelection,
  result
}
