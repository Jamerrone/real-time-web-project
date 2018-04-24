const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ns = require('ns-api')({
  username: '',
  password: '',
});

const MESSAGES_DATABASE = {};
const STATIONS_DATABASE = [];

app.use(express.static('public'));
app.set('view engine', 'pug');

function getCurrentISOTime() {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  const localISOTime = new Date(Date.now() - tzOffset)
    .toISOString()
    .slice(0, -1);

  return localISOTime;
}

function getAllStationNames(data) {
  Object.keys(data).forEach((key) => {
    if (data[key].Land === 'NL') {
      STATIONS_DATABASE.push(data[key].Namen.Lang);
    }
  });
}

function generateRouteID(departure, arrival, routePart) {
  let trainsID = '';

  departure = departure.replace(/\D/g, '').slice(0, -6);
  arrival = arrival.replace(/\D/g, '').slice(0, -6);
  routePart.forEach((part) => (trainsID += `-${part.RitNummer}`));

  return `${departure}${trainsID}-${arrival}`;
}

ns.stations((err, stationsData) => {
  if (err) {
    return false;
  } else {
    getAllStationNames(stationsData);
  }
});

app.get('/', (req, res, next) => {
  if (req.query.from && req.query.to) {
    const params = {
      fromStation: req.query.from,
      toStation: req.query.to,
      previousAdvices: 0,
      nextAdvices: 0,
      dateTime: getCurrentISOTime(),
      departure: true,
    };
    ns.reisadvies(params, (err, routeData) => {
      if (err) {
        res.render('index', {
          errorMessage:
            'Our source API is current unacceseble. For the latest up to date' +
            ' information please visit ns.nl',
        });
      } else {
        const routeID = generateRouteID(
          routeData[0].ActueleVertrekTijd,
          routeData[0].ActueleAankomstTijd,
          routeData[0].ReisDeel
        );

        if (!MESSAGES_DATABASE[routeID]) {
          MESSAGES_DATABASE[routeID] = [];
        }

        res.render('route', {
          stationsData: STATIONS_DATABASE,
          messages: MESSAGES_DATABASE[routeID],
          routeData: routeData[0],
          routeID: routeID,
        });
      }
    });
  } else {
    res.render('index', {stationsData: STATIONS_DATABASE});
  }
});

io.on('connection', (socket) => {
  socket.on('joinRoute', (data) => {
    socket.routeID = data.routeID;
    socket.join(socket.routeID);
    if (!MESSAGES_DATABASE[socket.routeID]) {
      MESSAGES_DATABASE[socket.routeID] = [];
    }
  });
  socket.on('postNewMessage', (data) => {
    MESSAGES_DATABASE[socket.routeID].push({
      title: data.messageTitle,
      category: data.messageCategory,
      trainID: data.messageTrainID,
      body: data.messageBody,
      timestamp: data.messageTimestamp,
    });
    const latestMessage =
      MESSAGES_DATABASE[socket.routeID][
        MESSAGES_DATABASE[socket.routeID].length - 1
      ];
    io.in(socket.routeID).emit('postNewMessage', {
      title: latestMessage.title,
      category: latestMessage.category,
      trainID: latestMessage.trainID,
      body: latestMessage.body,
      timestamp: latestMessage.timestamp,
    });
  });
});

http.listen(3000, () => console.log('http://localhost:3000'));
