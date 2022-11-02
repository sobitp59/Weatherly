
// write function to get city
// let city = 'Guwahati' 
let selectedCityText
let selectedCity
const API_KEY = '0654d5e67660c6b9bf8f57cf8bc9c2f0'
const DAYS_OF_THE_WEEK = ['sun','mon','tue','wed','thu','fri','sat']

// function to create icon url
const getWeatherIcon = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

// function to format temperature
const formatTemperature = (temperature) =>{
    return temperature ? `${temperature.toFixed(1)}°` : ''
}



// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//



// CURRENT WEATHER INFORMATION - STARTS //
const getCurrentWeatherInfo = async ({lat, lon, name : city}) =>{
    let url = lat && lon ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric` : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
   let response =  await fetch(url)
   return response.json()
}


const showCurrentWeather = ({name, main : {temp, temp_min, temp_max}, weather : [{description}]}) => {    
    let currentForecast = document.querySelector('.weather__current-forecast')
    currentForecast.querySelector('.weather__current-city').textContent = name;
    currentForecast.querySelector('.weather__current-temperature').textContent = formatTemperature(temp);
    currentForecast.querySelector('.weather__current-description').textContent = description;
    currentForecast.querySelector('.weather__current-high-low-temperature').textContent = `Lowest : ${formatTemperature(temp_min)}  Highest : ${formatTemperature(temp_max)}`;
}
// CURRENT WEATHER INFORMATION - END //


// HOURLY WEATHER FORCAST INFORMATION - START //
const getHourlyWeatherInfo = async ({name : city}) => {
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
        let temp_min = Math.min(...Array.from(value, val => val.temp_min))
        let temp_max = Math.max(...Array.from(value, val => val.temp_max))
        let icon = value.find(val => val).icon
        dayWiseForecast.set(key, {temp_min, temp_max, icon})
    }

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


// SEARCH CITY - START //
const getCityUsingGeolocation = async (cityName) => {
    let response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${10}&appid=${API_KEY}`)
    return response.json()
}

let getInputValue = async (event) => {
    let {value} = event.target
    if(!value){
        selectedCity = null
        selectedCityText= ''
    }
    if(value && (value !== selectedCityText)){
        let cityLists = await getCityUsingGeolocation(value)
    
        let optionsHtml = ''
        for(let {name, lat, lon, country, state} of cityLists){
            optionsHtml += `<option data-city-details='${JSON.stringify({lat, lon, name})}' value="${name}, ${state}, ${country}"></option>`
        }
    
        document.querySelector('#weather__cities').innerHTML = optionsHtml
    }

}

function debounceMethod(func){
    let timer 
    return (...args)=>{
        // let context = this, args = arguments
        clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(this, args)
        }, 400);
    }
}

const loadForecastUsingBrowserGeolocation = () => {
    navigator.geolocation.getCurrentPosition(({coords})=>{
        const {latitude : lat, longitude : lon} = coords
        selectedCity = {lat, lon}
        loadData()
    }, error => console.log(error))
}

const loadData = async() => {
    const currentWeatherData = await getCurrentWeatherInfo(selectedCity)
    showCurrentWeather(currentWeatherData)

    const hourlyWeatherData = await getHourlyWeatherInfo(currentWeatherData)
    showHourlyWeatherForecast(currentWeatherData, hourlyWeatherData)

    showFiveDayWeatherForecast(hourlyWeatherData)

    showFeelsLikeTemperature(currentWeatherData)

    showHumidity(currentWeatherData)
}


const showSearchedCityWeather = (event) => {
    selectedCityText = event.target.value
    let options = document.querySelectorAll("#weather__cities > option")
    if(options?.length){
        let selectedOption = Array.from(options).find(val => val.value === selectedCityText)
        selectedCity = JSON.parse(selectedOption.getAttribute("data-city-details"))
        loadData() 
    }   
}   

let debounceSearch = debounceMethod((event)=>getInputValue(event))


// SEARCH CITY - END //



document.addEventListener('DOMContentLoaded', async ()=>{
    loadForecastUsingBrowserGeolocation()
    let searchCityInput = document.querySelector('.weather__search-city')
    searchCityInput.addEventListener('input', debounceSearch)
    searchCityInput.addEventListener('change', showSearchedCityWeather)

})

