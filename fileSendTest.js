var express = require('express');
var multer = require('multer');
var fs = require('fs');
var app = express();
var http = require('http');
var fs = require('fs');

app.use('/uploads', express.static('uploads'));

app.listen(3000, function(){
  console.log('Connected, 3000 port!');
});
