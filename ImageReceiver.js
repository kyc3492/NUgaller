var express = require('express');
var multer = require('multer');
var fs = require('fs');
var app = express();

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
    var modifiedDate = date.yyyymmdd() + date.hhmmss();
    cb(null, modifiedDate + '-' + file.originalname);
  }
})
var upload = multer({ storage: _storage })


app.post('', upload.single('upload'), function(req, res){
  console.log(req.file);
  res.send('Uploaded : '+req.file.filename);
});

app.listen(9999, function(){
  console.log('Connected, 9999 port!');
})
