
// write function to get city
let city = 'Guwahati' 
const API_KEY = '0654d5e67660c6b9bf8f57cf8bc9c2f0'
const DAYS_OF_THE_WEEK = ['sun','mon','tue','wed','thu','fri','sat']

// function to create icon url
const getWeatherIcon = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`;

// function to format temperature
const formatTemperature = (temperature) =>{
    return temperature ? `${temperature.toFixed(1)}°` : ''
}

// CURRENT WEATHER INFORMATION - STARTS //
const getCurrentWeatherInfo = async () =>{
   let response =  await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
   return response.json()
}


const showCurrentWeather = ({name, main : {temp, temp_min, temp_max}, weather : [{description}]}) => {    
    let currentForecast = document.querySelector('.weather__current-forecast')
    currentForecast.querySelector('.weather__current-city').textContent = name;
    currentForecast.querySelector('.weather__current-temperature').textContent = formatTemperature(temp);
    currentForecast.querySelector('.weather__current-description').textContent = description;
    currentForecast.querySelector('.weather__current-high-low-temperature').textContent = `Low: ${formatTemperature(temp_min)}  High: ${formatTemperature(temp_max)}`;
}
// CURRENT WEATHER INFORMATION - END //


// HOURLY WEATHER FORCAST INFORMATION - START //
const getHourlyWeatherInfo = async () => {
    let response =  await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
    let data = await response.json()
    return data.list.map(forecast => {
        const {main : {temp, temp_min, temp_max}, dt, dt_txt, weather : [{icon, description}]} = forecast
        return {temp, temp_min, temp_max, dt, dt_txt, icon, description}
    })
}

const showHourlyWeatherForecast = ({main : {temp : currentTemp}, weather : [{icon : currentIcon}, description]}, hourlyForecastData) =>{
    let hourlyForecastContainer = document.querySelector('.weather__hourly-forecast-container')
    
    let hourlyHTML = `<article>
                        <p>Now</p>
                        <img src=${getWeatherIcon(currentIcon)} alt=${description}>
                        <h3>${formatTemperature(currentTemp)}</h3>
                        </article>
                        `
                        
    let dataFor12Hours = hourlyForecastData.slice(2, 14)
    for(let {dt_txt, icon, temp, description} of dataFor12Hours){

        let date = new Date(dt_txt)

        const dateFormator = (date) =>{
            return (new Intl.DateTimeFormat('en', {
            hour: 'numeric',
            }).format(date))}

        hourlyHTML += `<article>
                        <p>${dateFormator(date)}</p>
                        <img src=${getWeatherIcon(icon)} alt=${description}>
                        <h3>${formatTemperature(temp)}</h3>
                       </article>`
    }

    hourlyForecastContainer.innerHTML = hourlyHTML
}   
// HOURLY WEATHER FORCAST INFORMATION - END //




// FIVE DAY WEATHER FORECAST - START //
const getForecastForTheDay = (hourlyWeatherData) => {
    
    let dayWiseForecast = new Map()
    
    for(let forecastData of hourlyWeatherData ){
        let [date] = forecastData.dt_txt.split(" ")
        let dayOfTheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()]
        
        if(dayWiseForecast.has(dayOfTheWeek)){
            let  forecastForTheDay = dayWiseForecast.get(dayOfTheWeek)
            forecastForTheDay.push(forecastData)
            dayWiseForecast.set(dayOfTheWeek, forecastForTheDay)
        }else{
            dayWiseForecast.set(dayOfTheWeek, [forecastData])
        }
    }
    
    for(let [key, value] of dayWiseForecast){
        console.log(key, value)
        let temp_min = Math.min(...Array.from(value, val => val.temp_min))
        let temp_max = Math.max(...Array.from(value, val => val.temp_max))
        let icon = value.find(val => val).icon
        console.log(icon)
        dayWiseForecast.set(key, {temp_min, temp_max, icon})
    }

    console.log(dayWiseForecast)
    return dayWiseForecast
}


const showFiveDayWeatherForecast = (hourlyWeatherData) => {
    let forecastForTheDay = getForecastForTheDay(hourlyWeatherData)
    let fiveDayForecastContainer = document.querySelector('.weather__five-day-container')
    let dayWiseForecastHtml = ''
    Array.from(forecastForTheDay).map(([day, {temp_min, temp_max, icon}], index)=>{
            if(index < 5){
                dayWiseForecastHtml += `
                                        <article class="weather__five-day">
                                            <h2 class="weather__day">${index === 0 ? 'today' : day}</h2>
                                            <img class="weather__icon" src=${getWeatherIcon(icon)} alt="weather foracst icon">
                                            <h3 class="weather__temp weather__min">${formatTemperature(temp_min)}</h3>
                                            <h3 class="weather__temp">${formatTemperature(temp_max)}</h3>           
                                        </article>     
                                    `
            }
        
    })
    fiveDayForecastContainer.innerHTML = dayWiseForecastHtml
}
// FIVE DAY WEATHER FORECAST - END //



// FEELS LIKE INFORMATION - START //
const showFeelsLikeTemperature = ({main : {feels_like}}) => {
    let weatherFeelsLikeContainer = document.querySelector('.weather__feels-like')
    weatherFeelsLikeContainer.querySelector('.weather__feels-like-temperature').textContent = `${formatTemperature(feels_like)}`
}
// FEELS LIKE INFORMATION - END //


// HUMIDITY INFORMATION - START //
const showHumidity = ({main : {humidity}}) => {
    let humidityContainer = document.querySelector('.weather__humidity')
    humidityContainer.querySelector('.weather__humidity-info').textContent = `${humidity}%`
}
// HUMIDITY INFORMATION - END //




document.addEventListener('DOMContentLoaded', async ()=>{
    const currentWeatherData = await getCurrentWeatherInfo()
    console.log(currentWeatherData)
    showCurrentWeather(currentWeatherData)

    const hourlyWeatherData = await getHourlyWeatherInfo()
    showHourlyWeatherForecast(currentWeatherData, hourlyWeatherData)

    showFiveDayWeatherForecast(hourlyWeatherData)

    showFeelsLikeTemperature(currentWeatherData)

    showHumidity(currentWeatherData)
})

