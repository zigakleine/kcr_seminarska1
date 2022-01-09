const electron = require('electron');
const {ipcRenderer} = electron;
const fs = require('fs');
const path = require('path');


let carInfo = [];
let currentCar = null;
let toInsertDiv = null;
let title = null;
let carRentalInfo = null;

window.onload = function() {

    let rawDataCarInfo = fs.readFileSync(path.resolve(__dirname, '../../resources/carInfo.json'));
    carInfo = JSON.parse(rawDataCarInfo);
    carInfo = carInfo["cars"]; 
    toInsertDiv = document.getElementById("to-insert-div");
    title = document.getElementById("title");


    ipcRenderer.on('carId', function(e, carRentalInfo_){
        carRentalInfo = carRentalInfo_;
  
        let carId = carRentalInfo["carId"];
        currentCar = findCarById(carId);

        let id = currentCar["id"];
        let manufacturer = currentCar["manufacturer"];
        let model = currentCar["model"];
        let size = currentCar["size"];
        let gearbox = currentCar["gearbox"];
        let engine = currentCar["engine"];
        let location = currentCar["location"];
        let imgName = currentCar["imgName"];
        let pricePerDay = currentCar["pricePerDay"];

        let dateFrom = carRentalInfo["dateFrom"];
        let dateTo = carRentalInfo["dateTo"];
        let locationFrom = carRentalInfo["locationFrom"];
        let locationTo = carRentalInfo["locationTo"];
        let isDriverYoung = carRentalInfo["isDriverYoung"];

        let driverExperienceAddition = 1.0;
        if(isDriverYoung){
            driverExperienceAddition = 1.1;
        }

        let timeDiff = dateTo - dateFrom;
        let numOfDays = Math.floor(timeDiff / (1000 * 3600 * 24));

        let insurancePerDay = 2;

        title.innerHTML = manufacturer + " " + model;

        toInsertDiv.innerHTML += 
            '<div class="row">' +
                '<div class="col s12 ">' +
                    '<div class="section z-depth-1 custom-padding-1">' +
                        '<h4>' + manufacturer + ' ' + model + '</h4>' +
                    '</div>' +
                '</div>' +
                '<div class="divider"></div>' +
                '<div class="col s8 custom-top-margin-1">' +
                    '<div class="z-depth-1 custom-padding-1">' + 
                        '<div class="section">' +
                            '<img src="../../resources/images/' + imgName + '" class="responsive-img">' +
                        '</div>' +             
                        '<div class="divider"></div>' +
                        '<div class="section">' + 
                            '<p>Podatki o vozilu:</p>' +
                            '<ul>' +
                                '<li>' + gearbox + ' menjalnik</li>' +
                                '<li>' + engine + ' motor</li>' +
                                '<li>' + size + ' vozilo</li>' +
                            '</ul>' +
                        '</div>' +  
                        '<div class="divider"></div>' +
                        '<div class="section">' +
                            '<p>Lokacija dobavitelja:</p>' +
                            '<ul>' +
                                '<li>' + locationFrom + '</li>' +
                            '</ul>' +
                        '</div>' + 
                    '</div>' +
                '</div>' +
                '<div class="col s4 custom-top-margin-1">' +
                    '<div class="z-depth-1 custom-padding-1">' +
                        '<div class="section">' +
                            '<p>Stroški izposoje:</p>' +
                            '<ul>' +
                                '<li>Izposoja na dan: <b>' + Math.round(driverExperienceAddition*pricePerDay) + ' eur</b></li>' +
                                '<li>Izposoja za ' + numOfDays + ' dni: <b>' + Math.round(driverExperienceAddition*(numOfDays*pricePerDay)) + ' eur</b></li>' +
                            '</ul>' +
                        '</div>' +
                        '<div class="divider"></div>' +
                        '<div class="section">' +
                            '<p>Na voljo je polno zavarovanje:</p>' +
                            '<ul>' +
                                '<li>Izposoja na dan z zavarovanjem: <b>' + Math.round(driverExperienceAddition*pricePerDay + insurancePerDay)  + ' eur</b></li>' +
                                '<li>Izposoja za ' + numOfDays + ' dni z zavarovanjem: <b>' + Math.round(driverExperienceAddition*(numOfDays*pricePerDay) + insurancePerDay*numOfDays) + ' eur</b></li>' +
                            '</ul>' +
                        '</div>' +
                        '<div class="divider"></div>' +
                        '<div class="section" id="rentButtonSection">' +
                            '<button class="waves-effect waves-light btn-large #e57373 red lighten-1" onclick="goToCarRentalStage1()">Izposodi</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';     
   
    });
}

function goToCarRentalStage1() {
    // console.log("rentbuttonclick");
    ipcRenderer.send('rentCarStage1', carRentalInfo);
}

function findCarById(id) {
    for(let i = 0; i<carInfo.length; i++) {
        if(id == carInfo[i]["id"]) {
            return carInfo[i];
        }
    }
    return null;
}



