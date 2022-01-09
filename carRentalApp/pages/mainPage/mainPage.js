const electron = require('electron');
const {ipcRenderer} = electron;
const fs = require('fs');
const path = require('path');
const internal = require('stream');



let gearboxOptions = ["ročni", "avtomatski"];
let engineOptions = ["bencinski", "dizelski"];
let sizeOptions = ["majhno", "srednje veliko", "veliko"];
let manufacturerOptions = ["Fiat", "Hyundai", "Renault", "Volkswagen", "Peugeot", "Mercedes-Benz", "Skoda", "Opel"];


let carInfo = [];
let filtersResults = null;
let noResultsFound = null;
let notSearchedYet = null;
let cantRentForLessThanOneDay = null;


let dateFromSearchBar = null;
let dateToSearchBar = null;

let locationFromSearchBar = null;
let locationToSearchBar= null;

let dateFromSearchBarInstance = null;
let dateToSearchBarInstance = null;

let locationFromSearchBarInstance = null;
let locationToSearchBarInstance = null;

let isDriverYoung = null;

let sizeFilter = {};
let gearboxFilter = {};
let engineFilter = {};
let manufacturerFilter = {};


window.onload = function() {

    let rawDataCarInfo = fs.readFileSync(path.resolve(__dirname, '../../resources/carInfo.json'));
    carInfo = JSON.parse(rawDataCarInfo);
    carInfo = carInfo["cars"]; 

    filtersResults = document.getElementById("filters-results");
    filtersResults.style.visibility = "hidden";

    noResultsFound = document.getElementById("no-results-found");
    noResultsFound.style.display = "none";

    notSearchedYet = document.getElementById("not-searched-yet");
    notSearchedYet.style.display = "block";

    cantRentForLessThanOneDay = document.getElementById("cant-rent-for-less-than-one-day");
    cantRentForLessThanOneDay.style.display = "none";

    dateFromSearchBar = document.getElementById("dateFrom");
    dateToSearchBar = document.getElementById("dateTo");

    locationFromSearchBar = document.getElementById("locationFrom");
    locationToSearchBar = document.getElementById("locationTo");

    isDriverYoung = document.getElementById("isDriverYoung");

    dateFromSearchBarInstance = M.Datepicker.init(dateFromSearchBar, {});
    dateToSearchBarInstance = M.Datepicker.init(dateToSearchBar, {});

    locationFromSearchBarInstance = M.FormSelect.init(locationFromSearchBar, {});
    locationToSearchBarInstance = M.FormSelect.init(locationToSearchBar, {});

    console.log(dateFromSearchBarInstance);

    let dateToday = new Date();
    dateFromSearchBarInstance.setDate(dateToday);

    var dateTomorrow = new Date(dateToday.getTime() + 86400000);
    dateToSearchBarInstance.setDate(dateTomorrow);

    dateFromSearchBarInstance._finishSelection();
    dateToSearchBarInstance._finishSelection();

    for(const sizeEl of sizeOptions) {
        console.log(sizeEl);
        let currentId = "size_" + sizeEl;
        sizeFilter[currentId] = document.getElementById(currentId);
    }

    for(const engineEl of engineOptions) {
        let currentId = "engine_" + engineEl; 
        engineFilter[currentId] = document.getElementById(currentId);
    }

    for(const gearboxEl of gearboxOptions) {
        let currentId = "gearbox_" + gearboxEl;
        gearboxFilter[currentId] = document.getElementById(currentId);
    }

    for(const manufacturerEl of manufacturerOptions) {
        let currentId = "manufacturer_" + manufacturerEl;
        manufacturerFilter[currentId] = document.getElementById(currentId);
    }


}

function searchButtonPressed() {

    notSearchedYet.style.display = "none";
    filtersResults.style.visibility = "visible";

    let addedEntries = updateResults();

}

function goToCarDetailsPage(carId) {

    let carRentalInfo = {
        "carId": carId,
        "dateFrom": dateFromSearchBarInstance.date.getTime(),
        "dateTo": dateToSearchBarInstance.date.getTime(),
        "locationFrom": locationFromSearchBarInstance.getSelectedValues()[0],
        "locationTo": locationToSearchBarInstance.getSelectedValues()[0],
        "isDriverYoung": isDriverYoung.checked

    }

    console.log(carId); 
    ipcRenderer.send('goToDetails', carRentalInfo);
}

function updateResults() {

    noResultsFound.style.display = "none";

    const carInfoUl = document.getElementById("carInfoList");
    carInfoUl.innerHTML = "";

    let driverExperienceAddition = 1.0;
    if(isDriverYoung.checked){
        driverExperienceAddition = 1.1;
    }

    // console.log(dateFromSearchBarInstance);
    let timeDiff = dateToSearchBarInstance.date.getTime() - dateFromSearchBarInstance.date.getTime();
    let numOfDays = Math.floor(timeDiff / (1000 * 3600 * 24));
   
    if(numOfDays < 1) {
        cantRentForLessThanOneDay.style.display = "block";
        return 0;
    } 
    else {
        cantRentForLessThanOneDay.style.display = "none";
    }

    let locationFromCurrent = locationFromSearchBarInstance.getSelectedValues()[0];

    let currentSizeFilters = [];
    let sizeFilterKeys = Object.keys(sizeFilter);
    for(let i = 0; i< sizeFilterKeys.length; i++){
        // console.log(sizeFilterKeys[i]);
        if(sizeFilter[sizeFilterKeys[i]].checked){
            currentSizeFilters.push(sizeFilterKeys[i].split("_")[1]);
        }
    }
    let currentEngineFilters = [];
    let engineFilterKeys = Object.keys(engineFilter);
    for(let i = 0; i< engineFilterKeys.length; i++){
        // console.log(engineFilterKeys[i]);
        if(engineFilter[engineFilterKeys[i]].checked){
            currentEngineFilters.push(engineFilterKeys[i].split("_")[1]);
        }
    }

    let currentGearboxFilters = [];
    let gearboxFilterKeys = Object.keys(gearboxFilter)
    for(let i = 0; i< gearboxFilterKeys.length; i++){
        // console.log(gearboxFilterKeys[i]);
        if(gearboxFilter[gearboxFilterKeys[i]].checked){
            currentGearboxFilters.push(gearboxFilterKeys[i].split("_")[1]);
        }
    }

    let currentManufacturerFilters = [];
    let manufacturerFilterKeys = Object.keys(manufacturerFilter)
    for(let i = 0; i< manufacturerFilterKeys.length; i++){
        // console.log(manufacturerFilterKeys[i]);
        if(manufacturerFilter[manufacturerFilterKeys[i]].checked){
            currentManufacturerFilters.push(manufacturerFilterKeys[i].split("_")[1]);
        }
    }

    let addedEntries = 0;
    console.log("!!!!!!", currentEngineFilters);

    for(let i = 0; i<carInfo.length; i++) {

        let id = carInfo[i]["id"];
        let manufacturer = carInfo[i]["manufacturer"];
        let model = carInfo[i]["model"];
        let size = carInfo[i]["size"];
        let gearbox = carInfo[i]["gearbox"];
        let engine = carInfo[i]["engine"];
        let location = carInfo[i]["location"];
        let imgName = carInfo[i]["imgName"];
        let pricePerDay = carInfo[i]["pricePerDay"];

        if(locationFromCurrent === location && 
            (currentSizeFilters.length == 0 || currentSizeFilters.indexOf(size)>=0) &&
            (currentEngineFilters.length == 0 || currentEngineFilters.indexOf(engine)>=0) &&
            (currentGearboxFilters.length == 0 || currentGearboxFilters.indexOf(gearbox)>=0) &&
            (currentManufacturerFilters.length == 0 || currentManufacturerFilters.indexOf(manufacturer)>=0)) {

            addedEntries++;
            carInfoUl.innerHTML += 
                '<li>' + 
                '<div class="card horizontal custom-card-margin">' + 
                '<div class="card-image">' + 
                    '<img src="../../resources/images/' + imgName + '" class="responsive-img">' + 
                '</div>' + 
                '<div class="card-stacked">' + 
                    '<div class="card-content">' + 
                    '<h5>'+ manufacturer + ' ' + model + '</h5>' + 
                    '<p>' + 
                        '<div class="row">' + 
                        '<div class="col s6">' + 
                            '<ul>' + 
                            '<li>' + gearbox + ' menjalnik</li>' + 
                            '<li>' + engine + ' motor</li>' + 
                            '<li>' + size + ' vozilo</li>' + 
                            '</ul>' + 
                        '</div>' + 
                        '<div class="col s6">' + 
                            '<ul>' + 
                            '<li>Izposoja na dan: <b>' + Math.round(driverExperienceAddition*pricePerDay) + ' eur</b></li>' + 
                            '<li>Izposoja za ' + numOfDays + ' dni: <b>' + Math.round(driverExperienceAddition*(numOfDays*pricePerDay)) + ' eur</b></li>' + 
                            '</ul>' + 
                        '</div>' + 
                        '</div>' + 
                    '</p>' + 
                    '</div>' + 
                    '<div class="card-action">' + 
                    '<span></span>' + 
                    '<a class="right" onclick="goToCarDetailsPage(' + id + ')">Podrobnosti</a>' + 
                    '</div>' + 
                '</div>' + 
                '</div>' +   
            '</li>';
        }
    }

    if(addedEntries == 0) {
        noResultsFound.style.display = "block";
    }
    return addedEntries;
}