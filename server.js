'use strict';

require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const superagent = require('superagent');
const cors = require('cors');

app.use(cors());

let locationData = {};
let weatherData = {};

// CREATE LOCATION ROUTE
app.get('/location', (request, response) => {
  // STORE THE USER'S QUERY-TURNED-LOCATION-OBJECT IN LOCATIONDATA
  searchToLatLong(request, response);
  response.send(locationData);
});

// CREATE WEATHER ROUTE
app.get('/weather', (request, response) => {
  // STORE THE USER'S QUERY LOCATION 
  getWeather(searchToLatLong(request, response), response);
});

// CREATE A NEW LOCATION OBJECT FOR THE USER'S QUERY
const searchToLatLong = function(request, response) {
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url)
    .then(res => {
      locationData = new Location(request.query.data, res);
    }).catch(error => {
      console.log('1');
      response.status(500).send("Internal Server Error");
    }) 
};


// https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,
// +Mountain+View,+CA&key=YOUR_API_KEY

function Location(query, res) {
  this.query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.lat = res.body.results[0].geometry.location.lat;
  this.lng = res.body.results[0].geometry.location.lng;
}

// RETURN ALL WEATHER RECORDS FOR THE USER'S LOCATION QUERY
const getWeather = function(request, response) {
  //const darkskyData = require('./data/darksky.json');
  let url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.lat},${request.lng}`;
  //let url = `https://api.darksky.net/forecast/d014db8157816772e1553d6da93c8fc8/41.8781136,-87.6297982`;
  return superagent.get(url)
    .then(res => {
      response.send(res.body.daily.data.map(day => {
        return new Weather(day);
      })).catch(error => {
      console.log(error);
      response.status(500).send('Internal Server Error')
      });
    });
}


function Weather(day) {
  this.forecast = day.summary,
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

app.listen(PORT, () => console.log(`App is up and running on ${PORT}`));

// ERROR HANDLING FOR EMPTY QUERY
app.use((req, res) => res.status(500).send('Please enter a location!'));
