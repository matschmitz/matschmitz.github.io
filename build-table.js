

$(document).ready(function () {


  var apikey = "&CMC_PRO_API_KEY=6f8eb99f-1de9-4566-ae06-b423c3d9fe15"
  var cmcURL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?"
  var URL = cmcURL + "convert=EUR&symbol=BTC,BCH,LTC,XMR,ETH&" + apikey

  console.log(URL)

  // Request data from Coinmarketcap
  var request = new XMLHttpRequest()

  request.open('GET', URL, true)
  request.onload = function () {
    // Begin accessing JSON data here
    var data = JSON.parse(this.response);
    console.log(data);
    console.log("hi")
  }

  request.send()



  $('#cryptotable').bootstrapTable({
    data: [
      {
        'coin': 'a',
        'hold': 'a',
        'coins_initial': 'a',
        'coins_current': 'a',
        'wallet_initial': 'a',
        'wallet_current': 'a',
        'return_net': 'a',
        'return_rate': 'a'
      }
    ]
  })



})
