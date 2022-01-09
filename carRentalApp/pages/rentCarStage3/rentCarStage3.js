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

    M.AutoInit();

    let rawDataCarInfo = fs.readFileSync(path.resolve(__dirname, '../../resources/carInfo.json'));
    carInfo = JSON.parse(rawDataCarInfo);
    carInfo = carInfo["cars"]; 
    toInsertDiv = document.getElementById("to-insert-div");
    title = document.getElementById("title");


    ipcRenderer.on('rentCarStage3', function(e, carRentalInfo_){
        carRentalInfo = carRentalInfo_;
  
        let carId = carRentalInfo["carId"];
        currentCar = findCarById(carId);

        renderPage();
    });
}

function renderPage() {

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


    let insurance = carRentalInfo["insurance"];

    let firstName = carRentalInfo["firstName"];
    let lastName = carRentalInfo["lastName"];
    let age = carRentalInfo["age"];
    let licenseAge = carRentalInfo["licenseAge"];

    let address = carRentalInfo["address"];
    let zipcode = carRentalInfo["zipcode"];
    let city = carRentalInfo["city"];
    let country = carRentalInfo["country"];
    
    let email = carRentalInfo["email"];
    let phone = carRentalInfo["phone"];

    let payment = carRentalInfo["payment"];
    let cardNumber = carRentalInfo["cardNumber"];

    let totalPrice = carRentalInfo["totalPrice"];


    let driverExperienceAddition = 1.0;
    if(isDriverYoung){
        driverExperienceAddition = 1.1;
    }

    let timeDiff = dateTo - dateFrom;
    let numOfDays = Math.floor(timeDiff / (1000 * 3600 * 24));

    let insurancePerDay = 2;

    title.innerHTML = manufacturer + " " + model;

    toInsertDiv.innerHTML += 
        '<div class="col s6">' + 
            '<div class="z-depth-1 custom-padding-1">' + 
                '<div class="section">' + 
                    '<p>Podatki o izposoji:</p>' + 
                    '<ul>' + 
                        '<li>Dan prevzema: <b>' + new Date(dateFrom).toDateString() + '</b></li>' + 
                        '<li>Dan vračila: <b>' + new Date(dateTo).toDateString() + '</b></li>' + 
                        '<li>Loakcija prevzema: <b>' + locationFrom + '</b></li>' + 
                        '<li>Lokacija vračila: <b>' + locationTo + '</b></li>' +
                        '<li>Voznik pod 25 let: <b>' + (isDriverYoung ? "Da" : "Ne") + '</b></li>' + 
                        '<li>Število dni izposoje: <b>' + numOfDays + '</b></li>' + 
                        '<li>Zavarovanje: <b>' + (insurance ? "Da" : "Ne") + '</b></li>' + 
                        '<li>Skupaj cena: <b>' + totalPrice + ' eur</b></li>' + 
                    '</ul>' + 
                '</div>' + 
                '<div class="divider"></div>' + 
                '<div class="section">' + 
                    '<p>Podatki o vozilu:</p>' + 
                    '<ul>' + 
                        '<li>Naziv vozila: <b>' + manufacturer + ' ' + model + '</b></li>' + 
                        '<li>Menjalnik: <b>' + gearbox + '</b></li>' + 
                        '<li>Motor: <b>' + engine + '</b></li>' + 
                        '<li>Velikost vozila: <b>' + size + ' vozilo</b></li>' + 
                    '</ul>' + 
                '</div>'  +
                '<div class="divider"></div>' + 
            '</div>' + 
        '</div>' + 
        '<div class="col s6">' + 
            '<div class="z-depth-1 custom-padding-1">' + 
                '<div class="section">' + 
                    '<p>Podatki o kupcu:</p>' + 
                    '<ul>' + 
                        '<li>Ime in priimek: <b>' + firstName + ' ' + lastName + '</b></li>' + 
                        '<li>Starost: <b>' + age + ' let</b></li>' + 
                        '<li>Starost izpita: <b>' + licenseAge + ' let</b></li>' + 
                        '<li>Naslov: <b>' + address + '</b></li>' + 
                        '<li>Poštna številka in kraj: <b>' + zipcode + ' ' + city + '</b></li>' + 
                        '<li>Država: <b>' + country + '</b></li>' + 
                        '<li>E-naslov: <b>' + email + '</b></li>' + 
                        '<li>Telefon: <b>' + phone + '</b></li>' + 
                        '<li>Plačilo: <b>' + payment + '</b></li>' + 
                        (payment == 'kartica' ? ('<li>Številka kartice: <b>' + cardNumber + '</b></li>') : '') + 
                    '</ul>' + 
                '</div>' + 
                '<div class="divider"></div>' + 
            '</div>' + 
        '</div>';   

}

function rentCarClose() {
    ipcRenderer.send('rentCarClose');
}

function findCarById(id) {
    for(let i = 0; i<carInfo.length; i++) {
        if(id == carInfo[i]["id"]) {
            return carInfo[i];
        }
    }
    return null;
}