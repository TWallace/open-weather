const request = require('request-promise')
const _ = require('lodash')
const fs = require('fs')

const ONE_MINUTE = 60000
const REQUEST_FREQUENCY_MINUTES = 10
const API_KEY = process.env.OPENWEATHER_API_KEY || fs.readFileSync('api-key.txt', 'utf8')
const LATITUDE = 47.736660
const LONGITUDE = -122.342430
const DEGREE_SYMBOL = '°'
const OUTPUT_FOLDER = './output/'
const UNITS = 'imperial'

function getWindDirectionString (degrees) {
  let direction
  if (degrees <= 11.25 || degrees > 348.75) {
    direction = 'N'
  } else if (degrees <= 33.75 && degrees > 11.25) {
    direction = 'NNE'
  } else if (degrees <= 56.25 && degrees > 33.75) {
    direction = 'NE'
  } else if (degrees <= 78.75 && degrees > 56.25) {
    direction = 'ENE'
  } else if (degrees <= 101.25 && degrees > 78.75) {
    direction = 'E'
  } else if (degrees <= 123.75 && degrees > 101.25) {
    direction = 'ESE'
  } else if (degrees <= 146.25 && degrees > 123.75) {
    direction = 'SE'
  } else if (degrees <= 168.75 && degrees > 146.25) {
    direction = 'SSE'
  } else if (degrees <= 191.25 && degrees > 168.75) {
    direction = 'S'
  } else if (degrees <= 213.75 && degrees > 191.25) {
    direction = 'SSW'
  } else if (degrees <= 236.25 && degrees > 213.75) {
    direction = 'SE'
  } else if (degrees <= 258.75 && degrees > 236.25) {
    direction = 'WSW'
  } else if (degrees <= 281.25 && degrees > 258.75) {
    direction = 'W'
  } else if (degrees <= 303.75 && degrees > 281.25) {
    direction = 'WNW'
  } else if (degrees <= 326.25 && degrees > 303.75) {
    direction = 'NW'
  } else if (degrees <= 348.75 && degrees > 326.25) {
    direction = 'NNW'
  }
  return `To the ${direction}` || `${degrees} is not a valid value for wind degrees`
}

function getTemperatureString (value) {
  value = Math.round(value * 10) / 10
  return `${value}${DEGREE_SYMBOL}F`
}

function getCurrentWeather () {
  let params = {
    uri: `http://api.openweathermap.org/data/2.5/weather?units=${UNITS}&lat=${LATITUDE}&lon=${LONGITUDE}&APPID=${API_KEY}`
  }
  console.log(`Requesting weather data from Open Weather at ${new Date().toISOString()}`)
  return request(params)
    .then(resp => {
      let jsonResp = JSON.parse(resp)

      let temperature = _.get(jsonResp, 'main')
      if (!temperature) {
        console.error('Invalid response from Open Weather.')
        return
      }

      let currentTemperature = getTemperatureString(temperature.temp)
      let wind = _.get(jsonResp, 'wind')
      let windDirection = getWindDirectionString(wind.deg)
      let windSpeed = ` at ${wind.speed} MPH`

      fs.writeFileSync(`${OUTPUT_FOLDER}temperature.txt`, currentTemperature)
      fs.writeFileSync(`${OUTPUT_FOLDER}wind-direction.txt`, windDirection)
      fs.writeFileSync(`${OUTPUT_FOLDER}wind-speed.txt`, windSpeed)
    })
    .catch(err => {
      console.error(err)
      throw err
    })
}

function init () {
  return getCurrentWeather()
    .then(() => {
      setInterval(() => {
        return getCurrentWeather()
      }, REQUEST_FREQUENCY_MINUTES * ONE_MINUTE)
    }) 
}

module.exports = init
init()
