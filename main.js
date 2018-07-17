function display(JSONdata)
{
   data=JSON.parse(JSONdata);
   usdRates=data.bpi.USD.rate;
   console.log(usdRates)
   $("#display").html(usdRates)   
}

//weeks, days, etc, also allow user to choose currency, real time updates
function constructURL(baseURL, params)
{
    finalURL=baseURL;
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

function updateHistoricalGraph(historicalChart, historicalDatapoints,JSONData)
{
   constructDataPoints(historicalDatapoints,JSONData)

   // console.log(historicalDatapoints)
    

    historicalChart.render();
}

function getHistoricalPrice(historicalChart, historicalDatapoints,startDate, endDate)
{
    URL="https://api.coindesk.com/v1/bpi/historical/close.json"
    if(startDate!=undefined && endDate!=undefined)
    {
        URL=constructURL(URL, [{key: "start", value: startDate}, {key: "end", value:endDate}])
        console.log(URL);
    }
    $.get(URL, (JSONdata)=>{
        
        updateHistoricalGraph(historicalChart, historicalDatapoints,JSONdata);
    })
}


function refreshHistoricalData(historicalChart, historicalDatapoints)
{
    startDate=$("#start").val();
    endDate=$('#end').val();
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

function constructDataPoints(historicalDatapoints,JSONdata)
{
    
    data=JSON.parse(JSONdata);
    historicalDatapoints.splice(0,historicalDatapoints.length)
    console.log(data);
    keys=Object.keys(data.bpi);
    keys.forEach((key)=>
    {
        //console.log(data.bpi[key])
        historicalDatapoints.push({
            label: key,
            y: data.bpi[key]
        })
    })

}
//function to construct y points and x labels


function getRealTimePrice()
{
    return new Promise((resolve, reject)=>{
        
    baseURL="https://api.coindesk.com/v1/bpi/currentprice/USD.json"
    finalURL=constructURL(baseURL, [{key: "currency", value:"BTC" }])
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
        data=JSON.parse(JSONdata);
        datapoints.push({label:data.time.updated, y: data.bpi.USD.rate_float})
        if(datapoints.length>20)
        {
            datapoints.shift();
        }
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