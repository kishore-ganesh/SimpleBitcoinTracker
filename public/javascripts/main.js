function display(JSONdata)
{
   var data=JSON.parse(JSONdata);
   var usdRates=data.bpi.USD.rate;
   console.log(usdRates)
   $("#display").html(usdRates)   
}

//weeks, days, etc, also allow user to choose currency, real time updates
function constructURL(baseURL, params)
{
    var finalURL=baseURL;
    finalURL+="?";
    params.forEach((param)=>{
        finalURL+=param.key+"="+param.value+"&";
    })
    
    return finalURL;
    
}



function createHistoricalGraph(historicalDatapoints)
{
    var chart=new CanvasJS.Chart("chartContainer", {
        animationEnabled: true, 
        theme: "dark2",
        title: {
            text: "Bitcoin price data"
        },

        data:[
            {
                type:"line",
                dataPoints:historicalDatapoints
            }
        ]
    })

    return chart;
}

function constructDatapoints(datapoints,JSONdata, groupBy)
{
    data=JSON.parse(JSONdata);
    keys=Object.keys(data.bpi);
    datapoints.splice(0,datapoints.length);
    var sliceEnd=keys[0].length;
   // console.log(keys[0].slice(0,sliceEnd));
    //var currentValue;
    if(groupBy=="year")
    {
        sliceEnd=4;
    }

    else if(groupBy=="month")
    {
        sliceEnd=7;
    }


    
    var currentLabel=keys[0].slice(0,sliceEnd);
  
    
    var count=0;
    var sum=0;

    keys.forEach((key)=>{
        //console.log(currentValue);
        //first iteration
       // console.log(key.slice(0,7)+" "+currentLabel)
        if(key.slice(0,sliceEnd)==currentLabel)
        {
          //  console.log("h")
            
            sum+=data.bpi[key];
            count++;
            //console.log(sum)
            currentLabel=key.slice(0,sliceEnd);
        }

        else
        {
            
            //console.log(key)
          //  console.log(currentLabel)
            
            datapoints.push({label: currentLabel, y:sum/count})
            //console.log(datapoints)
            
            sum=data.bpi[key];
            count=1;
            currentLabel=key.slice(0,sliceEnd);
        }

        if(datapoints.length==0)
        {
            datapoints.push({label: currentLabel, y: sum/count})
        }



    })
}




function updateHistoricalGraph(historicalChart, historicalDatapoints,JSONData, groupBy)
{
   //constructDataPoints(historicalDatapoints,JSONData)
   constructDatapoints(historicalDatapoints, JSONData, groupBy);
   console.log(historicalDatapoints); 
   // console.log(historicalDatapoints)
    

    historicalChart.render();
}

function getHistoricalPrice(historicalChart, historicalDatapoints,startDate, endDate)
{
   var URL="https://api.coindesk.com/v1/bpi/historical/close.json"
    if(startDate!=undefined && endDate!=undefined)
    {
        URL=constructURL(URL, [{key: "start", value: startDate}, {key: "end", value:endDate}])
        console.log(URL);
    }
    $.get(URL, (JSONdata)=>{
        
        updateHistoricalGraph(historicalChart, historicalDatapoints,JSONdata);

        $("#dailybtn").click(()=>{

            updateHistoricalGraph(historicalChart, historicalDatapoints, JSONdata);
        })
    
        $("#monthlybtn").click(()=>{
    
            updateHistoricalGraph(historicalChart, historicalDatapoints, JSONdata, "month");
        })
    
        $("#yearlybtn").click(()=>{
    
            
            updateHistoricalGraph(historicalChart, historicalDatapoints, JSONdata, "year");
        })
    })

   

}


function refreshHistoricalData(historicalChart, historicalDatapoints)
{
    var startDate=$("#start").val();
    var endDate=$('#end').val();
    if(startDate<endDate) 
   {
    $("#error").html("");    
    getHistoricalPrice(historicalChart, historicalDatapoints,startDate, endDate);
   }

   else
   {
       $("#error").html("Error");
   }
    //add checking
}


//function to construct y points and x labels


function getRealTimePrice()
{
    return new Promise((resolve, reject)=>{
        
    var baseURL="https://api.coindesk.com/v1/bpi/currentprice/USD.json"
    var finalURL=constructURL(baseURL, [{key: "currency", value:"BTC" }])
    $.get(baseURL, (JSONdata)=>{
        display(JSONdata);
        console.log("reached")
        resolve (JSONdata);
    })

})

   
}

function createRealTimeGraph(datapoints)
{       
    var chart=new CanvasJS.Chart("realTimeChartContainer", {

        animationEnabled: true,
        theme: "dark2",
        title: {
            text: "Real Time Bitcoin Price"
        },

        data:[{
            type: "line",
            dataPoints: datapoints
        
        }]
    })

    return chart;
}

function updateRealTimeGraph(chart, datapoints)
{
    //not happening because returning too early
 //   console.log(datapoints)
    JSONdata=getRealTimePrice().then((JSONdata)=>{

       // console.log(JSONdata);
      var data=JSON.parse(JSONdata);
        datapoints.push({label:data.time.updated, y: data.bpi.USD.rate_float})
        // if(datapoints.length>20)
        // {
        //     datapoints.shift();
        // }
        chart.render();
    })
    

}







//refactor to make get data only get data

window.onload=function(){

    var datapoints=[];
    var historicalDatapoints=[];
    var realTimeChart=createRealTimeGraph(datapoints)
    updateRealTimeGraph(realTimeChart, datapoints)
    var historicalChart=createHistoricalGraph(historicalDatapoints)
    //getRealTimePrice();
    //chart.render();
    setInterval(()=>{updateRealTimeGraph(realTimeChart, datapoints)}, 30000);
   
    getHistoricalPrice(historicalChart, historicalDatapoints);
    
    $("#refresh").click(()=>{
        refreshHistoricalData(historicalChart, historicalDatapoints)
        
    });

   
}