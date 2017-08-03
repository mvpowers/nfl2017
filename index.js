const request = require("tinyreq");
const cheerio = require("cheerio");


request("http://nflpickwatch.com/?text=1", function (err, body) {

  let $ = cheerio.load(body);
  let winnersArr = [];
  let homeArr = [];
  let ignoredValuesArr = ['CONSENSUS', 'WEEK', 'SEASON'];   // ignore these strings in response

  let findHomeTeams = () => {
    for(i = 0; i < $('thead tr').first().children().length; i++){
      let homeTeam = $('thead tr').first().children().eq(i).text();
      homeTeam = homeTeam.match(/\@(.*)/);
      if(homeTeam !== null){
        homeArr.push(homeTeam[1])
      }
    }
  }


  let findWinners = () => {
    for(i = 0; i < $('.consensus').children().length; i++){
      let winner = $('.consensus').children().eq(i).text();

      winner = winner.match(/[a-zA-Z]*/);       // remove numbers and symbols
      winner = winner[0];                       // return string

      if(!ignoredValuesArr.includes(winner)){   // check for ignored values

        if(winner === ''){
          winnersArr.push(homeArr[i - 1])
        } else {
          winnersArr.push(winner)
        }
      }
    }
  }

  findHomeTeams();
  findWinners();
  console.log('home:    ' + homeArr)
  console.log('winners: ' + winnersArr)
});

