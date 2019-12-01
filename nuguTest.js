var express = require('express');
var multer = require('multer');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');

let response =
  {
    "version": "2.0",
    "resultCode": "OK",
    "output": {
      "isQueryUpdated": "True",
      "isQueryExisted": "True"
    }
  }


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.post('/' ,function(req, res){
  console.log(req.body.action.parameters.TAG.value);

  res.json(response);
});

app.listen(9999, function(){
  console.log('Connected, 9999 port!');
});
