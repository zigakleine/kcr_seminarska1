const electron = require('electron');
const {ipcRenderer} = electron;
const fs = require('fs');
const path = require('path');


let carInfo = [];
let currentCar = null;
let toInsertDiv = null;
let title = null;
let carRentalInfo = null;

let paymentInput = null;
let cardNumberInput = null;
let isPaymentCard = null;
let cardNumberContainer = null;


window.onload = function() {

    M.AutoInit();

    let rawDataCarInfo = fs.readFileSync(path.resolve(__dirname, '../../resources/carInfo.json'));
    carInfo = JSON.parse(rawDataCarInfo);
    carInfo = carInfo["cars"]; 
    toInsertDiv = document.getElementById("to-insert-div");
    title = document.getElementById("title");

    cardNumberContainer = document.getElementById("card-number-container");
    paymentInput = document.querySelector('input[name="payment"]:checked');
    onPaymentMethodClick();

    cardNumberInput = document.getElementById("card-number");

    ipcRenderer.on('rentCarStage2', function(e, carRentalInfo_){
        carRentalInfo = carRentalInfo_;
  
        let carId = carRentalInfo["carId"];
        currentCar = findCarById(carId);
        
        renderSidebar(carRentalInfo["insurance"]);
   
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

let cardRegex = /^([\d]{4}-){3}[\d]{4}$/;

function goToRentCarStageThree() {

    let alerts = document.getElementsByClassName("alert-info");
    while(alerts.length > 0) {
        alerts[0].parentNode.removeChild(alerts[0]);
    }

    paymentInput = document.querySelector('input[name="payment"]:checked');

    let paymentInputVal = paymentInput.value;
    let cardNumberInputVal = cardNumberInput.value; 

    let isFormValid = true;

    if(paymentInputVal == 'kartica' && !cardRegex.test(cardNumberInputVal)) {
        isFormValid = false;
        cardNumberInput.insertAdjacentHTML('afterend', 
        '<div role="alert" class="alert alert-info">Prosimo vnesite številko kartice v formatu xxxx-xxxx-xxxx-xxxx (uporabile lahko samo številke in znak -).</div>');
        cardNumberInput.value = '';
    }

    carRentalInfo["payment"] = paymentInputVal;

    carRentalInfo["cardNumber"] = cardNumberInputVal;

    if(isFormValid) {
        ipcRenderer.send('rentCarStage3', carRentalInfo);
    }   
    else{
        window.scrollTo(0, 0);
    }
    
}

function goToRentCarStageOne(){
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

function onPaymentMethodClick() {
    isPaymentCard = document.querySelector('input[name="payment"]:checked').value == "kartica";

    if(isPaymentCard) {
        cardNumberContainer.style.visibility = "visible";
    }
    else {
        cardNumberContainer.style.visibility = "hidden";
    }
}