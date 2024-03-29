import clock from "clock";
import * as document from "document";
import { units } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import { today } from 'user-activity';
import { goals } from "user-activity"
import { me } from "appbit";
import { battery } from "power";
import * as messaging from "messaging";
import * as fs from "fs";
import { gettext } from "i18n";

const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

let days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

let hourHand = document.getElementById("hourHand");
let minuteHand = document.getElementById("minuteHand");
let secondHand = document.getElementById("secondHand");
let hourHand24 = document.getElementById("hourHand24");
let backgroundGradient = document.getElementById("backgroundGradient");
let dateField = document.getElementById("dateField");
let hrField = document.getElementById("hrField");

let stepsField = document.getElementById("stepsField");
let stepsMeter = document.getElementById("stepsMeter");
let floorsField = document.getElementById("floorsField");
let floorsMeter = document.getElementById("floorsMeter");
let distField = document.getElementById("distField");
let distMeter = document.getElementById("distMeter");
let dist = 0;
let distGoal = 0;
let calsField = document.getElementById("calsField");
let calsMeter = document.getElementById("calsMeter");
let azmField = document.getElementById("azmField");
let azmMeter = document.getElementById("azmMeter");
let batteryField = document.getElementById("batteryField");
let batteryMeter = document.getElementById("batteryMeter");

let settings = loadSettings();
function loadSettings() {
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  }
  catch (ex) {
    settings.setItem("accentColor", "gold");
    settings.setItem("markerColor", "white");
    settings.setItem("handsOpacity", 1.0);
    settings.setItem("showBackgroundGradient", true);

    return {
      accentColor: "gold",
      markerColor: "white",
      handsOpacity: 1.0,
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
      case "accentColor":
        settings.accentColor = JSON.parse(evt.data.newValue); 
        setColors(settings.accentColor, settings.markerColor);
        break;
      case "markerColor":
        settings.markerColor = JSON.parse(evt.data.newValue); 
        setColors(settings.accentColor, settings.markerColor);
        break;
      case "handsOpacity":
        settings.handsOpacity = JSON.parse(evt.data.newValue); 
        setHandsOpacity(settings.handsOpacity);
        break;
      case "showBackgroundGradient":
        settings.showBackgroundGradient = JSON.parse(evt.data.newValue); 
        setBackgroundGradient(settings.showBackgroundGradient, settings.accentColor);
        break;
    }    
  }
};

function setColors(accentColor, markerColor) {
  let elements = document.getElementsByClassName("accentColor");
  elements.forEach(function (element) {
    element.style.fill = accentColor;
  });
  backgroundGradient.gradient.colors.c1 = accentColor;

  elements = document.getElementsByClassName("markerColor");
  elements.forEach(function (element) {
    element.style.fill = markerColor;
  });
}

function setHandsOpacity(handsOpacity) {
  hourHand.style.opacity = handsOpacity;
  minuteHand.style.opacity = handsOpacity;
  secondHand.style.opacity = handsOpacity;
  hourHand24.style.opacity = handsOpacity;
}

function setBackgroundGradient(showBackgroundGradient, accentColor) {
  backgroundGradient.gradient.colors.c1 = (showBackgroundGradient ? accentColor : "black");
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

let debug = false;
let weekdayNum = 0;
let date = 1; 
let hh = 10;
let mm = 8;
let ss = 42;
let dayName = "MON";

clock.granularity = "seconds";
clock.ontick = (evt) => {

  if (debug) {
    weekdayNum = (weekdayNum < 6) ? weekdayNum + 1 : 0;
    date = (date < 31) ? date +1 : 1;
  } else {
    weekdayNum = evt.date.getDay();
    date = evt.date.getDate(); 
    hh = evt.date.getHours();
    mm = evt.date.getMinutes();
    ss = evt.date.getSeconds();
  }

  dayName = gettext(`day_short_${weekdayNum}`);
  dateField.text = `${dayName} ${date}`
  hourHand.groupTransform.rotate.angle = (30 * (hh % 12)) + (0.5 * mm);
  minuteHand.groupTransform.rotate.angle = (6 * mm) + (0.1 * ss);
  secondHand.groupTransform.rotate.angle = (6 * ss);
  hourHand24.groupTransform.rotate.angle = (15 * hh) + (0.25 * mm);

  if (today.adjusted.steps != undefined) {
    stepsField.text = today.adjusted.steps;
    stepsMeter.sweepAngle = getProgressAngle(today.adjusted.steps, goals.steps)
  }
  if (today.adjusted.elevationGain != undefined) {
    floorsField.text = today.adjusted.elevationGain;
    floorsMeter.sweepAngle = getProgressAngle(today.adjusted.elevationGain, goals.elevationGain)
  }
  if (today.adjusted.distance != undefined) {
    dist = (units.distance === "metric" ? today.adjusted.distance * 0.001 : today.adjusted.distance * 0.000621371);
    dist = Math.floor(dist * 100) / 100;
    distField.text = dist;

    distGoal = (units.distance === "metric" ? goals.distance * 0.001 : goals.distance * 0.000621371);
    distGoal = Math.floor(distGoal * 100) / 100;
    distMeter.sweepAngle = getProgressAngle(dist, distGoal);
  }
  if (today.adjusted.calories != undefined) {
    calsField.text = today.adjusted.calories;
    calsMeter.sweepAngle = getProgressAngle(today.adjusted.calories, goals.calories)
  }
  if (today.adjusted.activeZoneMinutes !== undefined) {
    azmField.text = today.adjusted.activeZoneMinutes.total;
    azmMeter.sweepAngle = getProgressAngle(today.adjusted.activeZoneMinutes.total, goals.activeZoneMinutes.total)
  }
  batteryField.text = battery.chargeLevel
  batteryMeter.sweepAngle = 3.6 * battery.chargeLevel;
};

setColors(settings.accentColor, settings.markerColor);
setBackgroundGradient(settings.showBackgroundGradient, settings.accentColor);
setHandsOpacity(settings.handsOpacity);