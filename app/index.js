import clock from "clock";
import document from "document";
import { units } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import { today } from 'user-activity';
import { goals } from "user-activity"
import { me } from "appbit";
import { battery } from "power";
import * as messaging from "messaging";
import * as fs from "fs";

const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

let days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

let hourhand = document.getElementById("hourhand");
let minutehand = document.getElementById("minutehand");
let secondhand = document.getElementById("secondhand");
let outercenterdot = document.getElementById("outercenterdot");
let innercenterdot = document.getElementById("innercenterdot");
let hourhand24 = document.getElementById("hourhand24");
let backgroundGradient = document.getElementById("backgroundGradient");
let dayField = document.getElementById("dayField");
let dateField = document.getElementById("dateField");
let hrField = document.getElementById("hrField");

let stepsField = document.getElementById("stepsField");
let stepsMeter = document.getElementById("stepsMeter");
//let stepsUnit = document.getElementById("stepsUnit");

let floorsField = document.getElementById("floorsField");
let floorsMeter = document.getElementById("floorsMeter");
//let floorsUnit = document.getElementById("floorsUnit");

let distField = document.getElementById("distField");
let distMeter = document.getElementById("distMeter");
//let distUnit = document.getElementById("distUnit");
let dist = 0;
let distGoal = 0;

let calsField = document.getElementById("calsField");
let calsMeter = document.getElementById("calsMeter");
//let calsUnit = document.getElementById("calsUnit");

let azmField = document.getElementById("azmField");
let azmMeter = document.getElementById("azmMeter");
//let azmUnit = document.getElementById("azmUnit");

let batteryField = document.getElementById("batteryField");
let batteryMeter = document.getElementById("batteryMeter");

let settings = loadSettings();
function loadSettings() {
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  }
  catch (ex) {
    return {
      accentcolor: "#AF9C3A",
      markercolor: "#C7C7C7",
      handsopacity: 1.0,
      showBackgroundGradient: true
    };
  }
}

me.addEventListener("unload", saveSettings);
function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}

messaging.peerSocket.onmessage = evt => {
  if (evt.data.newValue){
    switch (evt.data.key) {
      case "accentcolor":
        settings.accentcolor = JSON.parse(evt.data.newValue); 
        setColours(settings.accentcolor, settings.markercolor);
        break;
      case "markercolor":
        settings.markercolor = JSON.parse(evt.data.newValue); 
        setColours(settings.accentcolor, settings.markercolor);
        break;
      case "handsopacity":
        settings.handsopacity = JSON.parse(evt.data.newValue); 
        setHandsOpacity(settings.handsopacity);
        break;
      case "showBackgroundGradient":
        settings.showBackgroundGradient = JSON.parse(evt.data.newValue); 
        setBackgroundGradient(settings.showBackgroundGradient, settings.accentcolor);
        break;
    }    
  }
};

function setColours(accentcolour, markercolour) {
  let elements = document.getElementsByClassName("accentcolour");
  elements.forEach(function (element) {
    element.style.fill = accentcolour;
  });
  backgroundGradient.gradient.colors.c1 = accentcolour;

  elements = document.getElementsByClassName("markercolour");
  elements.forEach(function (element) {
    element.style.fill = markercolour;
  });
}

function setHandsOpacity(handsopacity) {
  hourhand.style.opacity = handsopacity;
  minutehand.style.opacity = handsopacity;
  secondhand.style.opacity = handsopacity;
  outercenterdot.style.opacity = handsopacity;
  innercenterdot.style.opacity = handsopacity;
}

function setBackgroundGradient(showBackgroundGradient, accentColour) {
  backgroundGradient.gradient.colors.c1 = (showBackgroundGradient ? accentColour : "black");
}

let hrm = new HeartRateSensor();
hrm.onreading = () => {
  hrField.text = hrm.heartRate;
};

let body = new BodyPresenceSensor();
body.onreading = () => {
  if (!body.present) {
    hrm.stop();
    hrField.text = "--";
  } else {
    hrm.start();
  }
};
body.start();

function getProgressAngle(progress, goal) {
  if (goal == 0) {
    return 0;
  }
  let arc = (progress / goal) * 360;
  if (arc > 360) {
    arc = 360;
  }
  return arc;
}

clock.granularity = "seconds";
clock.ontick = (evt) => {
  dayField.text = days[evt.date.getDay()];
  dateField.text = evt.date.getDate();
  hourhand.groupTransform.rotate.angle = (30 * (evt.date.getHours() % 12)) + (0.5 * evt.date.getMinutes());
  minutehand.groupTransform.rotate.angle = (6 * evt.date.getMinutes()) + (0.1 * evt.date.getSeconds());
  secondhand.groupTransform.rotate.angle = (6 * evt.date.getSeconds());
  hourhand24.groupTransform.rotate.angle = (15 * evt.date.getHours()) + (0.25 * evt.date.getMinutes());
  if (today.adjusted.steps != undefined) {
    stepsField.text = today.adjusted.steps;
    stepsMeter.sweepAngle = getProgressAngle(today.adjusted.steps, goals.steps)
    //stepsUnit.text = "steps";
  }
  if (today.adjusted.elevationGain != undefined) {
    floorsField.text = today.adjusted.elevationGain;
    floorsMeter.sweepAngle = getProgressAngle(today.adjusted.elevationGain, goals.elevationGain)
    //floorsUnit.text = "floors";
  }
  if (today.adjusted.distance != undefined) {
    dist = (units.distance === "metric" ? today.adjusted.distance * 0.001 : today.adjusted.distance * 0.000621371);
    dist = Math.floor(dist * 100) / 100;
    distField.text = dist;
    //distUnit.text = "km";

    distGoal = (units.distance === "metric" ? goals.distance * 0.001 : goals.distance * 0.000621371);
    distGoal = Math.floor(distGoal * 100) / 100;
    distMeter.sweepAngle = getProgressAngle(dist, distGoal);
  }
  if (today.adjusted.calories != undefined) {
    calsField.text = today.adjusted.calories;
    calsMeter.sweepAngle = getProgressAngle(today.adjusted.calories, goals.calories)
    //calsUnit.text = "kcal";
  }
  if (today.adjusted.activeZoneMinutes !== undefined) {
    azmField.text = today.adjusted.activeZoneMinutes.total;
    azmMeter.sweepAngle = getProgressAngle(today.adjusted.activeZoneMinutes.total, goals.activeZoneMinutes.total)
    //azmUnit.text = "min";
  }
  //batteryField.text = `${battery.chargeLevel}%`
  batteryField.text = battery.chargeLevel
  batteryMeter.sweepAngle = 3.6 * battery.chargeLevel;
};

setColours(settings.accentcolor, settings.markercolor);
setBackgroundGradient(settings.showBackgroundGradient, settings.accentcolor);
setHandsOpacity(settings.handsopacity);