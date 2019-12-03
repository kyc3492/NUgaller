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

let response =
  {
    "version": "2.0",
    "resultCode": "OK",
    "output": {
      "isQueryUpdated": "True",
      "isQueryExisted": "True"
    }
  }

let tag = "";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.post('/' ,function(req, res){
  if(req.body.action.parameters.TAG.value){
    console.log("Received Tag From NUGU: " + req.body.action.parameters.TAG.value);
    tag = req.body.action.parameters.TAG.value;
    var deleteQuery = "DELETE FROM NUtellerRequested";
    dbconn.query(deleteQuery, function(err, records){
      if(err) throw err;
      console.log("Requested Table Initialized");
      var insertQuery = "INSERT INTO NUtellerRequested SELECT * FROM NUtellerData WHERE labels LIKE UPPER('%" + tag + "%');"
      dbconn.query(insertQuery, function(err, records){
        if(err) throw err;
        console.log("Requested Table is Generated!");
        var selectQuery = "SELECT * FROM NUtellerRequested";
        dbconn.query(selectQuery, function(err, records){
          if(records.length > 0){
            notificator.sendSuccessNotification();
            console.log('Query sent.');
          } else {
            notificator.sendFailNotification();
            console.log('Nothing in query.');
          }
        });
      });
    });
  }
  res.json(response);
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

app.listen(9999, function(){
  console.log('Connected, 9999 port!');
});
