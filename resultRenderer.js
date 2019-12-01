'use strict';

var mysql  = require('mysql');
var Keys = require('./private_keys.js');
let result;

var dbconn = mysql.createConnection({
  host     : Keys.DBHost,
  user     : Keys.DBUser,
  password : Keys.DBPass,
  database : Keys.DBDatabase
});

dbconn.connect(function(err){
  if(err){
    console.log('Database connection error');
  }else{
    console.log('Result Database connection successful');
  }
});

async function createQuery(){

};

async function selectQuery(){
  var query = "SELECT * FROM NUtellerRequested";

  dbconn.query(query,function(err, records){
    if(err) throw err;
    //console.log(records);
    //records.setHeader('Content-Type', 'application/json');
    //console.log(JSON.stringify(records));
    result = JSON.stringify(records);
  });
  //console.log(result);
};

//console.log(selectQuery());
//console.log(result);

module.exports = {
  createQuery,
  selectQuery,
  result
}
