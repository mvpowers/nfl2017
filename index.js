require('dotenv').config()

const request = require("tinyreq");
const cheerio = require("cheerio");
const mail    = require('nodemailer'); 

let winnersArr = [];
let homeArr = [];
let finalScore = 42;
let week = '';


request("http://nflpickwatch.com/?text=1", function (err, body) {

  let $ = cheerio.load(body);
  let ignoredValuesArr = ['CONSENSUS', 'WEEK', 'SEASON'];   // ignore these strings in response

  let pointsPerGame = {
  	ATL: 59.2,
		NO: 57.7,
		NE: 43.2,
		GB: 51.3,
		DAL: 45.4,
		AZ: 48.7,
		IND: 50.2,
		LAC: 52,
		OAK: 50.1,
		BUF: 48.5,
		WAS: 48.7,
		PIT: 45.3,
		KC: 43.7,
		TEN: 47.4,
		CAR: 48.2,
		PHI: 45.6,
		SEA: 40.4,
		TB: 45.2,
		MIA: 46.5,
		BAL: 41.5,
		DEN: 39.4,
		DET: 44,
		MIN: 39.6,
		CIN: 40,
		JAX: 44.9,
		SF: 49.3,
		NYG: 37.2,
		HOU: 37.9,
		CHI: 42.3,
		NYJ: 42.8,
		CLE: 44.8,
		LAR: 38.6
  }

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
    for(i = 0; i < ($('.consensus').children().length; i++ - 1)){
      let winner = $('.consensus').children().eq(i).text();

      winner = winner.match(/[a-zA-Z]*/);       // remove numbers and symbols
      winner = winner[0];                       // return string

      if(!ignoredValuesArr.includes(winner)){   // check for ignored values

        if(winner === ''){
          winnersArr.push('<br />' + homeArr[i - 1])
        } else {
          winnersArr.push('<br />' + winner)
        }
      }
    }
  }

  let findFinalScore = () => {
		let game = $('thead tr').first().children().eq(-2).text();
		let lastGameArr = game.split('@');
		let lastAway = lastGameArr[0];
		let lastHome = lastGameArr[1];
		finalScore = Math.round((pointsPerGame[lastAway] + pointsPerGame[lastHome]) / 2);
  }

  let findWeek = () => {
    week = $('h2').eq(2).text();
  }

  findHomeTeams();
  findWinners();
  findFinalScore();
  findWeek();
})
.then(function(){
  // SEND EMAIL
  let transporter = mail.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
	});

	let mailOptions = {
    from: 'nflpicks@mvpowers.net', // sender address
    to: 'test@mvpowers.net', // list of receivers
    subject: "🏈🔥💯 Mikey\'s NFL Picks - " + week + " 💯🔥🏈", // Subject line
    html: winnersArr + '<br /><br />' + 'Final Score: ' + finalScore // html body
	};

	transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
	});
})
.catch(err => {
    console.log(err);
});
