const request = require('request-promise')
const _ = require('lodash')
const fs = require('fs')

const ONE_MINUTE = 60000
const API_KEY = process.env.OPENWEATHER_API_KEY
const LOCATION_ID = '5810301'
const DEGREE_SYMBOL = '°'
const outputFolder = './output/'

function getWindDirectionString (degrees) {
  if (degrees <= 11.25 && degrees > 348.75) {
    return 'N'
  } else if (degrees <= 33.75 && degrees > 11.25) {
    return 'NNE'
  } else if (degrees <= 56.25 && degrees > 33.75) {
    return 'NE'
  } else if (degrees <= 78.75 && degrees > 56.25) {
    return 'ENE'
  } else if (degrees <= 101.25 && degrees > 78.75) {
    return 'E'
  } else if (degrees <= 123.75 && degrees > 101.25) {
    return 'ESE'
  } else if (degrees <= 146.25 && degrees > 123.75) {
    return 'SE'
  } else if (degrees <= 168.75 && degrees > 146.25) {
    return 'SSE'
  } else if (degrees <= 191.25 && degrees > 168.75) {
    return 'S'
  } else if (degrees <= 213.75 && degrees > 191.25) {
    return 'SSW'
  } else if (degrees <= 236.25 && degrees > 213.75) {
    return 'SE'
  } else if (degrees <= 258.75 && degrees > 236.25) {
    return 'WSW'
  } else if (degrees <= 281.25 && degrees > 258.75) {
    return 'W'
  } else if (degrees <= 303.75 && degrees > 281.25) {
    return 'WNW'
  } else if (degrees <= 326.25 && degrees > 303.75) {
    return 'NW'
  } else if (degrees <= 348.75 && degrees > 326.25) {
    return 'NNW'
  }
  return `${degrees} is not a valid value for wind degrees`
}

function getTemperatureString (value) {
  return `${value}${DEGREE_SYMBOL}F`
}

function getCurrentWeather () {
  let params = {
    uri: `http://api.openweathermap.org/data/2.5/forecast?units=imperial&id=${LOCATION_ID}&APPID=${API_KEY}`,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  return request(params)
    .then(resp => {
      let jsonResp = JSON.parse(resp)
      let list = jsonResp.list
      if (!list.length) {
        console.error('No "list" found in response.')
        return
      }

      let temperature = _.get(list, '[0].main')
      if (!temperature) {
        console.error('Invalid response from Open Weather.')
        return
      }

      let currentTemperature = getTemperatureString(temperature.temp)
      let minTemperature = getTemperatureString(temperature.temp_min)
      let maxTEmperature = getTemperatureString(temperature.temp_max)

      let wind = _.get(list, '[0].wind')
      let windDirection = getWindDirectionString(wind.deg)
      let windSpeed = `${wind.speed} MPH`

      fs.writeFileSync(`${outputFolder}temperature.txt`, currentTemperature)
      fs.writeFileSync(`${outputFolder}wind-direction.txt`, windDirection)
      fs.writeFileSync(`${outputFolder}wind-speed.txt`, windSpeed)
    })
    .catch(err => {
      console.error(err)
      throw err
    })
}

function init () {
  // setInterval(() => {
  //   return getCurrentWeather()
  // }, 11 * ONE_MINUTE)
  console.log('Calling getCurrentWeather')
  return getCurrentWeather()
}

module.exports = init

init()