var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var datapoints=[];

var request=require('request');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.post('/realtime', function(req, res){

    
    res.send(JSON.stringify(datapoints));

})

updateRealTimeData(datapoints);

setInterval(()=>{
    updateRealTimeData(datapoints)
},30000);

function constructURL(baseURL, params)
{
    var finalURL=baseURL;
    finalURL+="?";
    params.forEach((param)=>{
        finalURL+=param.key+"="+param.value+"&";
    })
    
    return finalURL;
    
}

function getRealTimePrice()
{
    return new Promise((resolve, reject)=>{
        
    var baseURL="https://api.coindesk.com/v1/bpi/currentprice/USD.json"
    var finalURL=constructURL(baseURL, [{key: "currency", value:"BTC" }])
    request.get(baseURL, function(err,res, body)
    {
        resolve(body);
    })
   
})

}

function updateRealTimeData(datapoints)
{
    
    return new Promise((resolve, reject)=>{
    JSONdata=getRealTimePrice().then((JSONdata)=>{

        // console.log(JSONdata);
       var data=JSON.parse(JSONdata);
       datapoints.push({label:data.time.updated, y: data.bpi.USD.rate_float})
         // if(datapoints.length>20)
         // {
         //     datapoints.shift();
         // }

         console.log(datapoints.length)   
         resolve(datapoints);
        
     })

    })
}

module.exports = app;
app.listen(4000);
