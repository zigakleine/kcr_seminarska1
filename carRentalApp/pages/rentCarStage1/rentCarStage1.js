const electron = require('electron');
const {ipcRenderer} = electron;
const fs = require('fs');
const path = require('path');


let carInfo = [];
let currentCar = null;
let toInsertDiv = null;
let title = null;
let carRentalInfo = null;
let insuranceCheckbox = null;

let firstNameInput = null;
let lastNameInput = null;
let ageInput = null;
let licenseAgeInput = null;

let addressInput = null;
let zipcodeInput = null;
let cityInput = null;
let countryInput = null;

let emailInput = null;
let phoneInput = null;

window.onload = function() {

    M.AutoInit();

    let rawDataCarInfo = fs.readFileSync(path.resolve(__dirname, '../../resources/carInfo.json'));
    carInfo = JSON.parse(rawDataCarInfo);
    carInfo = carInfo["cars"]; 
    toInsertDiv = document.getElementById("to-insert-div");
    title = document.getElementById("title");
    insuranceCheckbox = document.getElementById("insurance");

    firstNameInput = document.getElementById("first-name");
    lastNameInput = document.getElementById("last-name");
    ageInput = document.getElementById("age");
    licenseAgeInput = document.getElementById("license-age");

    addressInput = document.getElementById("address");
    zipcodeInput = document.getElementById("zip-code");
    cityInput = document.getElementById("city");
    countryInput = document.getElementById("country");

    emailInput = document.getElementById("email");
    phoneInput = document.getElementById("phone");

    ipcRenderer.on('rentCarStage1', function(e, carRentalInfo_){
        carRentalInfo = carRentalInfo_;
  
        let carId = carRentalInfo["carId"];
        currentCar = findCarById(carId);

        renderSidebar(insuranceCheckbox.checked);
    });
}

function renderSidebar(addInsurance) {

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

    toInsertDiv.innerHTML = "";

    toInsertDiv.innerHTML += 
        '<div class="section">' + 
            '<img src="../../resources/images/' + imgName + '" class="responsive-img">' + 
        '</div>' + 
        '<div class="divider"></div>' + 
        '<div class="section">' + 
            '<p>' + manufacturer + ' ' + model + '</p>' + 
            '<ul>' + 
            '<li>' + gearbox + ' menjalnik</li>' +
            '<li>' + engine + ' motor</li>' +
            '<li>' + size + ' vozilo</li>' +
            '</ul>' + 
        '</div>' + 
        '<div class="divider"></div>' + 
        '<div class="section">' + 
            '<p>Naročilo:</p>' + 
            '<ul>' + 
                '<li>' + 
                    numOfDays + 'x izposoja vozila: <b>' + Math.round(driverExperienceAddition*(numOfDays*pricePerDay)) +' eur</b>' + 
                '</li>' + 
                (addInsurance ? ('<li>' + numOfDays + 'x zavarovanje: <b>' + Math.round(insurancePerDay*numOfDays) + ' eur</b></li>'): '') + 
            '</ul>' + 
        '</div>' + 
        '<div class="divider"></div>' + 
        '<div class="section">' + 
            '<p><b>Skupaj: ' + Math.round(driverExperienceAddition*(numOfDays*pricePerDay) + (addInsurance ? insurancePerDay*numOfDays : 0)) +' eur</b></p>' + 
        '</div>';   
    
}

let nameRegex = /[a-ž]+$/i;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

let stringRegex = /.+/;

let phoneNumRegex = /^[\d +]+$/;
 

function goToRentCarStageTwo() {

    let isDriverYoung = carRentalInfo["isDriverYoung"];

    let alerts = document.getElementsByClassName("alert-info");
    while(alerts.length > 0) {
        alerts[0].parentNode.removeChild(alerts[0]);
    }
    let isFormValid = true;

    let insuranceCheckboxVal = insuranceCheckbox.checked;

    let firstNameInputVal = firstNameInput.value;
    if(!nameRegex.test(firstNameInputVal)) {
        isFormValid = false;
        firstNameInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Prosimo vnesite ime.</div>');
        firstNameInput.value = '';
    }

    let lastNameInputVal = lastNameInput.value;
    if(!nameRegex.test(lastNameInputVal)) {
        isFormValid = false;
        lastNameInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Prosimo vnesite priimek.</div>');
        lastNameInput.value = '';
    }

    let ageInputVal = ageInput.value;
    if(ageInputVal < 18) {
        isFormValid = false;
        ageInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Voznik mora biti starejši od 18 let.</div>');
        ageInput.value = '';
    }
    if((!isDriverYoung && ageInputVal < 25)) {
        isFormValid = false;
        ageInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Če je voznik mlajši od 25 let, mora biti v iskalni vrstici označen kot mladi voznik.</div>');
        ageInput.value = '';
    }

    let licenseAgeInputVal = licenseAgeInput.value;
    if(licenseAgeInputVal == '' || licenseAgeInputVal == 'e' || (licenseAgeInputVal < 0 && licenseAgeInputVal > 100)) {
        isFormValid = false;
        licenseAgeInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Prosimo vnesite veljavno starost izpita.</div>');
        licenseAgeInput.value = '';
    }

    let addressInputVal = addressInput.value;
    if(!stringRegex.test(addressInputVal)) {
        isFormValid = false;
        addressInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Prosimo vnesite naslov.</div>');
        addressInput.value = '';
    }

    let zipcodeInputVal = zipcodeInput.value;

    if(zipcodeInputVal == '' || zipcodeInputVal == 'e' || zipcodeInputVal < 0 ) {
        isFormValid = false;
        zipcodeInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Prosimo vnesite veljavno poštno številko.</div>');
        zipcodeInput.value = '';
    }

    let cityInputVal = cityInput.value;
    if(!stringRegex.test(cityInputVal)) {
        isFormValid = false;
        cityInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Prosimo vnesite ime kraja.</div>');
        cityInput.value = '';
    }

    let countryInputVal = countryInput.value;
    if(!stringRegex.test(countryInputVal)) {
        isFormValid = false;
        countryInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Prosimo vnesite ime države.</div>');
        countryInput.value = '';
    }

    let emailInputVal = emailInput.value;
    if(!emailRegex.test(emailInputVal)) {
        isFormValid = false;
        emailInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Prosimo vnesite veljaven elektronski naslov.</div>');
        emailInput.value = '';

    }

    let phoneInputVal = phoneInput.value;
    if(!phoneNumRegex.test(phoneInputVal)) {
        isFormValid = false;
        phoneInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Prosimo vnesite veljavno telefonsko številko.</div>');
        phoneInput.value = '';
    }

    carRentalInfo["insurance"] = insuranceCheckboxVal;

    carRentalInfo["firstName"] = firstNameInputVal;
    carRentalInfo["lastName"] = lastNameInputVal;
    carRentalInfo["age"] = ageInputVal;
    carRentalInfo["licenseAge"] = licenseAgeInputVal;

    carRentalInfo["address"] = addressInputVal;
    carRentalInfo["zipcode"] = zipcodeInputVal;
    carRentalInfo["city"] = cityInputVal;
    carRentalInfo["country"] = countryInputVal;
    
    carRentalInfo["email"] = emailInputVal;
    carRentalInfo["phone"] = phoneInputVal;

    let dateFrom = carRentalInfo["dateFrom"];
    let dateTo = carRentalInfo["dateTo"];
   
    let driverExperienceAddition = 1.0;
    if(isDriverYoung){
        driverExperienceAddition = 1.1;
    }
    let pricePerDay = currentCar["pricePerDay"];
    let timeDiff = dateTo - dateFrom;
    let numOfDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    let insurancePerDay = 2;

    carRentalInfo["totalPrice"] = Math.round(driverExperienceAddition*(numOfDays*pricePerDay) + (insuranceCheckboxVal ? insurancePerDay*numOfDays : 0));
    
    // isFormValid = true;
    if(isFormValid){
        ipcRenderer.send('rentCarStage2', carRentalInfo);
    }
    else{
        window.scrollTo(0, 0);
    }
}

function insuranceCheckboxSelected() {

    renderSidebar(insuranceCheckbox.checked);
 
}

function findCarById(id) {
    for(let i = 0; i<carInfo.length; i++) {
        if(id == carInfo[i]["id"]) {
            return carInfo[i];
        }
    }
    return null;
}

function goToCarDetailsPage() {

    let carRentalInfo = {
        "carId": currentCar["id"],
        "dateFrom":  carRentalInfo["dateFrom"],
        "dateTo": carRentalInfo["dateTo"],
        "locationFrom": carRentalInfo["locationFrom"],
        "locationTo": carRentalInfo["locationTo"],
        "isDriverYoung": carRentalInfo["isDriverYoung"]
    }

    ipcRenderer.send('goToDetails', carRentalInfo);
}