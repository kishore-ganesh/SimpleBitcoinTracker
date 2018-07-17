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
    params.forEach((param)=>{
        finalURL+="?"+param.key+"="+param.value;
    })
    

    return finalURL;

    
}

function getRealTimePrice()
{
    baseURL="https://api.coindesk.com/v1/bpi/currentprice/USD.json"
    finalURL=constructURL(baseURL, [{key: "currency", value:"BTC" }])
    $.get(baseURL, (data)=>{
        display(data);
    })
}

function getHistoricalPrice()
{
    baseURL="https://api.coindesk.com/v1/bpi/historical/close.json"
    $.get(baseURL, (data)=>{
        displayGraph(data);
    })
}

function constructDataPoints(JSONdata)
{
    
    data=JSON.parse(JSONdata);
    datapoints=[]
    console.log(data);
    keys=Object.keys(data.bpi);
    keys.forEach((key)=>
    {
        datapoints.push({
            label: key,
            y: data.bpi[key]
        })
    })

    return datapoints;
}
//function to construct y points and x labels
function displayGraph(JSONData)
{
    datapoints=constructDataPoints(JSONData)
    var chart=new CanvasJS.Chart("chartContainer", {
        animationEnabled: true, 
        theme: "dark2",
        title: {
            text: "Bitcoin price data"
        },

        data:[
            {
                type:"line",
                dataPoints:datapoints
            }
        ]
    })

    chart.render();
}

window.onload=function(){

    getRealTimePrice();
    setInterval(getRealTimePrice, 30000);
    getHistoricalPrice();
}