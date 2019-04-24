'use strict';

require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const superagent = require('superagent');
const cors = require('cors');

app.use(cors());

// CREATE LOCATION ROUTE
app.get('/location', (request, response) => {
  // STORE THE USER'S QUERY-TURNED-LOCATION-OBJECT IN LOCATIONDATA
  searchToLatLong(request, response);
});

// CREATE WEATHER ROUTE
app.get('/weather', (request, response) => {
  // STORE THE USER'S QUERY LOCATION 
  getWeather();
});

// CREATE A NEW LOCATION OBJECT FOR THE USER'S QUERY
const searchToLatLong = function(request, response) {
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;
  // const location = new Location(query, geoData);
  // return location;
  return superagent.get(url)
    .then(res => {
      console.log(request.query.data);
      response.send(new Location(request.query.data, res));
    }).catch(error => {
      console.log(error);
      response.status(500).send("Internal server error");
    }) 
};


// https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,
// +Mountain+View,+CA&key=YOUR_API_KEY

function Location(query, res) {
  this.query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}

// RETURN ALL WEATHER RECORDS FOR THE USER'S LOCATION QUERY
const getWeather = () => {
  const darkskyData = require('./data/darksky.json');
  
  return darkskyData.daily.data.map(day => {
    return new Weather(day);
  });
}


function Weather(day) {
  this.forecast = day.summary,
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

app.listen(PORT, () => console.log(`App is up and running on ${PORT}`));

// ERROR HANDLING FOR EMPTY QUERY
app.use((req, res) => res.status(500).send('Please enter a location!'));
