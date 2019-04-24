'use strict';

const express = require('express'),
  app = express(),
  PORT = process.env.PORT || 3000;

// CREATE LOCATION ROUTE
app.get('/location', (req, res) => {
  // STORE THE USER'S QUERY-TURNED-LOCATION-OBJECT IN LOCATIONDATA
  const locationData = searchToLatLong(req.query.data);
  // RETURN THE LOCATION OBJECT
  res.send(locationData);
});

// CREATE WEATHER ROUTE
app.get('/weather', (req, res) => {
  // STORE THE USER'S QUERY LOCATION 
  const weatherData = getWeather();
  res.send(weatherData);
});

// CREATE A NEW LOCATION OBJECT FOR THE USER'S QUERY
const searchToLatLong = query => {
  const geoData = require('./data/geo.json');
  const location = new Location(query, geoData);
  return location;
};

function Location(query, res) {
  this.query = query,
  this.formatted_query = res.results[0].formatted_address,
  this.latitude = res.results[0].geometry.location.lat,
  this.longitude = res.results[0].geometry.location.lng;
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
