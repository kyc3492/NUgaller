'use strict';

var mysql  = require('mysql');
var Keys = require('./private_keys.js');
var keywords = new Array();
var counter = 0;

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
    console.log('Analyzer Database connection successful');
  }
});

async function detectStart(fileDir, fileName, datetime) {

    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.labelDetection(fileDir);
    const labels = result.labelAnnotations;
    console.log('Labels:');

    if (counter < 20){
      labels.forEach(function(label){
          keywords[counter] = label.description
          counter++;
      });
    }

    detectWeb(fileDir, fileName, datetime)
}

async function detectWeb(fileDir, fileName, datetime) {

    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.webDetection(fileDir);
    const webDetection = result.webDetection;

    if (webDetection.webEntities.length) {
      console.log(`Web entities found: ${webDetection.webEntities.length}`);
      webDetection.webEntities.forEach(webEntity => {
        console.log(`  Description: ${webEntity.description}`);
        console.log(`  Score: ${webEntity.score}`);

        if (counter < 20){
          keywords[counter] = webEntity.description;
          counter++;
        }
      });
    }

    if (webDetection.bestGuessLabels.length) {
      console.log(
        `Best guess labels found: ${webDetection.bestGuessLabels.length}`
      );
      webDetection.bestGuessLabels.forEach(label => {
        console.log(`  Label: ${label.label}`);

        if (counter < 20){
          keywords[counter] = label.label;
          counter++;
        }
      });
    }

    insertQuery(fileName, datetime);
  }

async function insertQuery(fileName, datetime){

  var query = 'INSERT INTO NUtellerData(fileName, fileSavedDatetime, labels)';
  query += 'VALUES ("' + fileName + '", ' + datetime +', "';

  keywords.forEach(function(keyword){
      if(keyword != ''){
        query += '' + keyword + ', ';
        console.log(keyword);
      }
  });
  query = query.slice(0, -1);
  query += '")';

  console.log(query);
  dbconn.query(query, function(err, records){
      if(err) throw err;

      console.log('query updated!');
  });

  counter = 0;
  query = '';
  keywords = new Array();
}

module.exports = {
  detectStart,
  detectWeb,
  insertQuery
}
