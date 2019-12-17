var express = require('express');
var multer = require('multer');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var mysql  = require('mysql');
var Keys = require('./private_keys.js');
var analyzer = require('./ImageAnalyzerModule.js');
var dbConnection = require('./connect.js');
var notificator = require('./fcmNotificator.js')
//var resultRenderer = require('./resultRenderer.js');

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
    console.log('Database connection successful');
  }
});

Date.prototype.yyyymmdd = function(){
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('');
}

Date.prototype.hhmmss = function() {
  var hh = this.getHours();
  var mm = this.getMinutes();
  var ss = this.getSeconds();
  var modifiedDate = "";

  return [(hh>9 ? '' : '0') + hh,
          (mm>9 ? '' : '0') + mm,
          (ss>9 ? '' : '0') + ss,
         ].join('');
};

var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    var date = new Date();
    modifiedDate = date.yyyymmdd() + date.hhmmss();
    cb(null, modifiedDate + '-' + file.originalname);
  }
})
var upload = multer({ storage: _storage })


app.post('/upload', upload.single('upload'), function(req, res){
  console.log(req.file);
  res.send('Uploaded : '+req.file.filename);

  analyzer.detectStart('uploads/' + req.file.filename,  req.file.filename, modifiedDate).catch(console.error);
});

app.use('/uploads', express.static('uploads'));

let tag = "";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.post('/' ,function(req, res){
  console.log("NUGU init...");
  console.log(req.body.action.actionName);
  console.log(req.body.action.parameters);

  if(req.body.action.actionName == "find_photo"){
    var response = '{ "version": "2.0", "resultCode": "OK", "output": {}}';
    //JSON continued...
    //res.json(JSON.parse(response));
    console.log("Received Tag From NUGU: " + req.body.action.parameters.TAG.value);
    res.json(JSON.parse(response));
    tag = req.body.action.parameters.TAG.value;
    var deleteQuery = "DELETE FROM NUtellerRequested";
    console.log(deleteQuery);
    dbconn.query(deleteQuery, function(err, records){
      if(err) throw err;
      console.log("Requested Table Initialized");
      var insertQuery = "INSERT INTO NUtellerRequested SELECT * FROM NUtellerData WHERE labels LIKE UPPER('%" + tag + "%');"
      console.log(insertQuery);
      dbconn.query(insertQuery, function(err, records){
        if(err) throw err;
        console.log("Requested Table is Generated!");
        var selectQuery = "SELECT * FROM NUtellerRequested";
        console.log(selectQuery);
        dbconn.query(selectQuery, function(err, records){
          if(records.length > 0){
            notificator.sendSuccessNotification();
            console.log('Query sent.');
          } else {
            notificator.sendFailNotification();
            console.log('Nothing in query.');
          }
          //response += '"numberOfPhotos": ' + records.length + ' } }';
        });
      });
    });
  } else if(req.body.action.actionName == "create_receive_name"){
    console.log("Make Selfie Album.");
    var response = '{ "version": "2.0", "resultCode": "OK", "output": {}}';
    var updateQuery = "UPDATE NUtellerData SET album = 'selfie' WHERE album = '0'";
    dbconn.query(updateQuery, function(err, records){
      notificator.sendCreatedNotification();
      console.log('Album Created!');
      var selectQuery = "SELECT * FROM NUtellerAlbums WHERE albumName = '" + req.body.action.parameters.CREATE_SELFIE + "'";
      dbconn.query(selectQuery, function(err, records){
        if(records.length == 0){
          var insertQuery = "INSERT INTO NUtellerAlbums VALUES ('"+ req.body.action.parameters.CREATE_SELFIE.value +"')";
          dbconn.query(insertQuery, function(err, records){
            console.log(insertQuery);
            notificator.sendCreatedNotification();
          });
        } else {
          notificator.sendAlreadyExistNotification();
        }
        res.json(JSON.parse(response));
      });
    });
  } else if(req.body.action.actionName == "move_receive_name"){
    console.log("Moving Photos");
    var response = '{ "version": "2.0", "resultCode": "OK", "output": {}}';
    var updateQuery = "UPDATE NUtellerData SET album = 'selfie' WHERE labels LIKE UPPER('%myselfie%')";
    dbconn.query(updateQuery, function(err, records){
      //console.log('Album Created!');
      res.json(JSON.parse(response));
      notificator.sendMoveSuccessNotification();
    });
  } else if(req.body.action.actionName == "photo_of_the_date") {
    console.log("Finding photos of that day");
    var response = '{ "version": "2.0", "resultCode": "OK", "output": {}}';
    var dateForQuery;
    if(req.body.action.parameters.Date) {
      var wantedDate = req.body.action.parameters.Date.value;
      if (wantedDate == 'TODAY'){
        var date = new Date();
        modifiedDate = date.yyyymmdd();
        console.log("Today is " + modifiedDate);
        dateForQuery = modifiedDate;
      } else if (wantedDate == "YESTERDAY"){
        var date = new Date();
        date.setDate(date.getDate() - 1);
        modifiedDate = date.yyyymmdd();
        console.log("Yesterday is " + modifiedDate);
        dateForQuery = modifiedDate;
      } else if (wantedDate == "B_YESTERDAY"){
        var date = new Date();
        date.setDate(date.getDate() - 2);
        modifiedDate = date.yyyymmdd();
        dateForQuery = modifiedDate;
      }
    } else {
      var nowDay = new Date();
      var nowDate = nowDay.getDate();
      var nowMonth = nowDay.getMonth() + 1;
      var nowYear = nowDay.getFullYear();
      if (nowDate < 10) {
        nowDate = '0' + nowDate;
      }
      if (nowMonth < 10) {
        nowMonth = '0' + nowMonth;
      }
      if(req.body.action.parameters.Date_Y && req.body.action.parameters.Date_M && req.body.action.parameters.Date_D){
        var nowDate = req.body.action.parameters.Date_D.value;
        var nowMonth = req.body.action.parameters.Date_M.value;
        var nowYear = req.body.action.parameters.Date_Y.value;
        if (nowDate < 10) {
          nowDate = '0' + nowDate;
        }
        if (nowMonth < 10) {
          nowMonth = '0' + nowMonth;
        }
        var date = nowYear + nowMonth + nowDate;
        console.log(nowYear + ", " + nowMonth + ", " + nowDate);
        dateForQuery = date;
      } else if (req.body.action.parameters.Date_M && req.body.action.parameters.Date_D){
        var nowMonth = req.body.action.parameters.Date_M.value;
        var nowDate = req.body.action.parameters.Date_D.value;
        if (nowDate < 10) {
          nowDate = '0' + nowDate;
        }
        if (nowMonth < 10) {
          nowMonth = '0' + nowMonth;
        }
        var date = nowYear + nowMonth + nowDate;
        console.log(nowYear + ", " + nowMonth + ", " + nowDate);
        dateForQuery = date;
      } else if (req.body.action.parameters.Date_D) {
        var nowDate = req.body.action.parameters.Date_D.value;
        if (nowDate < 10) {
          nowDate = '0' + nowDate;
        }
        if (nowMonth < 10) {
          nowMonth = '0' + nowMonth;
        }
        var date = nowYear + nowMonth + nowDate;
        console.log(nowYear + ", " + nowMonth + ", " + nowDate);
        dateForQuery = date;
      }
    }
    var deleteQuery = "DELETE FROM NUtellerRequested";
    console.log(deleteQuery);
    dbconn.query(deleteQuery, function(err, records){
      res.json(JSON.parse(response));
      if(err) throw err;
      console.log("Requested Table Initialized");
      var insertQuery = "INSERT INTO NUtellerRequested SELECT * FROM NUtellerData WHERE fileSavedDatetime LIKE ('" + dateForQuery + "%');"
      console.log(insertQuery);
      dbconn.query(insertQuery, function(err, records){
        if(err) throw err;
        console.log("Requested Table is Generated!");
        var selectQuery = "SELECT * FROM NUtellerRequested";
        console.log(selectQuery);
        dbconn.query(selectQuery, function(err, records){
          if(records.length > 0){
            notificator.sendSuccessNotification();
            console.log('Query sent.');
          } else {
            notificator.sendFailNotification();
            console.log('Nothing in query.');
          }
          //response += '"numberOfPhotos": ' + records.length + ' } }';
        });
      });
    });
  } else if(req.body.action.actionName == "delete_photos"){
    var response = '{ "version": "2.0", "resultCode": "OK", "output": {}}';
    res.json(JSON.parse(response));
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/result', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var query = "SELECT * FROM NUtellerRequested";
  dbconn.query(query,function(err, records){
    if(err) throw err;
    res.json(records);
  });
});

app.get('/my_selfie', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var query = "SELECT * FROM NUtellerData WHERE album = 'selfie'";
  dbconn.query(query,function(err, records){
    if(err) throw err;
    res.json(records);
  });
})

app.listen(9999, function(){
  console.log('Connected, 9999 port!');
});
