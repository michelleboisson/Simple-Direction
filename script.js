var startPos;
var geocoder;

var currentLat;
var currentLong;
var currentAddress;
var targetLat;
var targetLong;
var targetAddress;
var someAddress;
var currentHeading;

var targetDirection; 

var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

var divTag = document.createElement("div"); 
divTag.id = "loader"; 
divTag.setAttribute("align", "center"); 
divTag.style.margin = "0px auto"; 
divTag.className = "dynamicDiv"; 
divTag.innerHTML = "Loading...<img src=images/ajax-loader.gif />"; 

var allPanels = document.querySelectorAll(".panel");

function setTargetLocation(lat, lng){
    console.log('set targetLoc');
    localStorage.setItem("targetLoc", lat+","+lng);
}


function init() {
  
  
  var returningUser = localStorage.getItem("returningUser");
  var targetLoc = localStorage.getItem("targetLoc");
  
  geocoder = new google.maps.Geocoder();
  
  //set current location
  if (targetLoc == null || targetLoc == ""){
    //getCurrentPosition();
    $("#usePrevLoc").hide();
  }
  else {
    $("#usePrevLoc").show();
    var targetLocArray = targetLoc.split(",");
    targetLat = targetLocArray[0];
    targetLong = targetLocArray[1];
    //setTargetLocation(targetLat,targetLong);
    document.getElementById("targetLat").innerHTML = targetLat;
    document.getElementById("targetLon").innerHTML = targetLong;
    lookUpAddress(targetLat, targetLong, true);
  
  }
  
  drawArrow(currentHeading);

// Location Data

  //getCurrentPosition();
  //updatePosition();
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(function(currentPosition) {
      
      console.log(currentPosition);
      currentLat = currentPosition.coords.latitude;
      currentLong = currentPosition.coords.longitude;
      currentHeading = currentPosition.coords.heading;
      
      document.getElementById("currentLat").innerHTML = currentLat;
      document.getElementById("currentLon").innerHTML = currentLong;
      document.getElementById("distanceKM").innerHTML =
        calculateDistanceKM(targetLat, targetLong,currentLat, currentLong);
      document.getElementById("distanceFT").innerHTML =
        calculateDistanceFT(targetLat, targetLong,currentLat, currentLong);
        
      document.getElementById("heading").innerHTML = currentHeading;
      lookUpAddress(currentLat, currentLong, false);
      
      /*point arrow in current heading
      context.rotate(currentHeading * Math.PI / 180);
      console.log("currentHeading: "+currentHeading);
      console.log("rotate canvas: "+currentHeading * Math.PI / 180);
      */
      
      /////////////
      targetDirection = Math.atan2((Math.cos(currentLat)*Math.sin(targetLat))-(Math.sin(currentLat)*Math.cos(currentLat)*Math.cos(targetLong-currentLong)), Math.sin(targetLong-currentLong)*Math.cos(targetLat));
      
      //next set it to be between 0 and 360 == 0 and 2*PI
      targetDirection = targetDirection % (2*Math.PI); //this is in radians
      
      //rotate the arrow
      context.rotate(targetDirection);
      console.log("targetDirection: "+targetDirection);
      console.log("rotate canvas: "+targetDirection * Math.PI / 180+ " degrees");
      /////////
      
    }, function(error){
      alert("Error occurred when watching. Error code: " + error);
    
    }, {enableHighAccuracy:true, maximumAge:30000, timeout:27000});
  }
  else {
    Alert('Geolocation is not supported for this Browser/OS version yet.');
  }

if (window.DeviceOrientationEvent) {
        console.log("DeviceOrientation is supported");
        window.addEventListener('deviceorientation', function(eventData) {
            LR = eventData.gamma;
            FB = eventData.beta;
            DIR = eventData.alpha;
            console.log(eventData.alpha);
            context.rotate(eventData.alpha);
        });
    }else if (window.OrientationEvent) {
        // Listen for the MozOrientation event and handle OrientationData object
        window.addEventListener('MozOrientation', function(eventData){
            LR = eventData.x * 90;

            // y is the front-to-back tilt from -1 to +1, so we need to convert to degrees
            // We also need to invert the value so tilting the device towards us (forward) 
            // results in a positive value. 
            FB = eventData.y * -90;
        
            // MozOrientation does not provide this data
            //DIR = null;
        
            // z is the vertical acceleration of the device
            DIR = eventData.z;
        
        });
    }else {
        alert("Sorry Device Orientation is not supported!");
    }

  
 //--------------------------------------------EventListeners -------------------- 
  //check if it's a new user
  
  
  if (!returningUser){
    console.log("New Visitor! "+returningUser);
    document.getElementById("intro").className += " show";
    
  }
  else{
    //returning user
    console.log(targetLoc);
    document.getElementById("direction").className += " show";
   //var targetLocArray = targetLoc.split(",");
    //setTargetLocation(targetLocArray[0],targetLocArray[1]);
  }


  document.getElementById("setLocationBtn").addEventListener("click", function(){
    document.getElementById("setLocationBtn").appendChild(divTag); 
    //document.getElementById("setLocationBtn").appendChild("yo!");
    //reset panels and show the right one
    for (var j=0; j< allPanels.length; j++) {
      console.log(allPanels[j]);
      allPanels[j].classList.remove("show");
    }
    document.getElementById("direction").classList.add("show");
    
    getCurrentPosition();
    //updatePosition();
    //localStorage.setItem("returningUser", true);
  });
  
  document.getElementById("usePrevLoc").addEventListener("click", function(){
    targetLoc = localStorage.getItem("targetLoc");
    var targetLocArray = targetLoc.split(",");
    targetLat = targetLocArray[0];
    targetLong = targetLocArray[1];
    document.getElementById("targetLat").innerHTML = targetLat;
    document.getElementById("targetLon").innerHTML = targetLong;
    
    lookUpAddress(targetLat, targetLong, true);
    //updatePosition();
    //reset panels and show the right one
    //for (var b=0; b< allPanels.length; b++) {
    //  allPanels[b].classList.remove("show");
    //}
    //document.getElementById("direction").classList.add("show");
  });

  document.getElementById("enterLocationBtn").addEventListener("click", function(){

    //localStorage.setItem("returningUser", true);
  });
  
  document.getElementById("enterLocBtn").addEventListener("click", function(){
    var savedTarget = document.getElementById("enterLoc").value;
    if (savedTarget != ""){
      lookUpLatLong(savedTarget);
        
    //document.getElementById("heading").innerHTML = currentHeading;
    }
    //updatePosition();
  });

}//end init

//-------------------------------------------- Functions -------------------- 


function getCurrentPosition(){
console.log("getting position...");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      document.getElementById("setLocationBtn").removeChild(divTag);
      console.log("position is: "+position);
      targetLat = position.coords.latitude;
      targetLong = position.coords.longitude;
      document.getElementById("targetLat").innerHTML = targetLat;
      document.getElementById("targetLon").innerHTML = targetLong;
      
      //console.log(startPos);
      //save the location on local storage
      //setTargetLocation(targetLat, targetLong);
      localStorage.setItem("targetLoc", targetLat+","+targetLong);
      
      lookUpAddress(targetLat, targetLong, true);
      //updatePosition();
      
    }, function(error) {
      console.log("Error occurred from getCurrentPostition. Error code: " + error.code);
      // error.code can be:
      //   0: unknown error
      //   1: permission denied
      //   2: position unavailable (error response from locaton provider)
      //   3: timed out
      if (error.code == 3){
        console.log("getCurrentPosition timedOut. Using values from watchPosition...");
        document.getElementById("setLocationBtn").removeChild(divTag);
        //console.log("position is: "+position);
        targetLat = currentLat;
        targetLong = currentLong;
        document.getElementById("targetLat").innerHTML = targetLat;
        document.getElementById("targetLon").innerHTML = targetLong;
        localStorage.setItem("targetLoc", targetLat+","+targetLong);
      
        lookUpAddress(targetLat, targetLong, true);
        
        document.getElementById("distanceKM").innerHTML = calculateDistanceKM(targetLat, targetLong,currentLat, currentLong);
        document.getElementById("distanceFT").innerHTML = calculateDistanceFT(targetLat, targetLong,currentLat, currentLong);
        
      }
    }, {enableHighAccuracy:true, maximumAge:30000, timeout:10000});
  }else {
    Alert('Geolocation is not supported for this Browser/OS version yet.');
  }
}

function updatePosition(){
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(function(currentPosition) {
      
      console.log(currentPosition);
      currentLat = currentPosition.coords.latitude;
      currentLong = currentPosition.coords.longitude;
      currentHeading = currentPosition.coords.heading;
      
      document.getElementById("currentLat").innerHTML = currentLat;
      document.getElementById("currentLon").innerHTML = currentLong;
      document.getElementById("distanceKM").innerHTML =
        calculateDistanceKM(targetLat, targetLong,currentLat, currentLong);
      document.getElementById("distanceFT").innerHTML =
        calculateDistanceFT(targetLat, targetLong,currentLat, currentLong);
        
      document.getElementById("heading").innerHTML = currentHeading;
      lookUpAddress(currentLat, currentLong, false);
      
      //context.rotate(currentHeading * Math.PI / 180);
      //console.log("currentHeading: "+currentHeading);
      //console.log("rotate canvas: "+currentHeading * Math.PI / 180);
      
    }, function(error){
      alert("Error occurred when watching. Error code: " + error);
    
    }, {enableHighAccuracy:true, maximumAge:30000, timeout:27000});
  }
  else {
    Alert('Geolocation is not supported for this Browser/OS version yet.');
  }
};


//google geocoding api

function lookUpAddress(lat, lng, isTarget) {
    
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          console.log(results[0]);
          
          if (isTarget) {
            document.getElementById("targetAddress").innerHTML = results[0].formatted_address;
          }
          else{
            document.getElementById("currentAdd").innerHTML = results[0].formatted_address;
          }
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
}


function lookUpLatLong(address){
  
  //http://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&sensor=true_or_false
  //json .status.geometry.location.lat, .status.geometry.location.lng
    console.log(address);
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        console.log(results);
        targetLat = results[0].geometry.location.Ya;
        targetLong = results[0].geometry.location.Za;        
        //setTargetLocation(lat, lng);
        localStorage.setItem("targetLoc", targetLat+","+targetLong);
        document.getElementById("targetAddress").innerHTML = address;
        document.getElementById("targetLat").innerHTML = targetLat;
        document.getElementById("targetLon").innerHTML = targetLong;
        document.getElementById("distanceKM").innerHTML = calculateDistanceKM(targetLat, targetLong,currentLat, currentLong);
        document.getElementById("distanceFT").innerHTML = calculateDistanceFT(targetLat, targetLong,currentLat, currentLong);
        
        
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
}

//calculate bearing
function getBearing(){
  var y = Math.sin(dLon) * Math.cos(lat2);
  var x = Math.cos(lat1)*Math.sin(lat2) -
        Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
  var brng = Math.atan2(y, x).toDeg();
}

//Set Location Storage Date about Target Location


function checkNewUserStatus(e){
  var newUserStatus = localStorage.getItem("newUserStatus");
    //console.log(something);
    if (newUserStatus){
        //show intro div
        alert(something);
    } else if (!newUserStatus){
        //show direction div
        alert("Oops something went wrong");
    }
    
    return userStatus;
}




function getTargetLocation(e){
    console.log('i am getting something');
    var targetLoc = localStorage.getItem("targetLoc");
    console.log(targetLoc);
    if (targetLoc){
        alert(targetLoc);
    } else {
        alert("Oops something went wrong");
    }
}

function removeTargetLocation(e){
    console.log('i am removing targetLoc');
    localStorage.removeItem("targetLoc");
}

// Reused code - copyright Moveable Type Scripts - retrieved May 4, 2010.
// http://www.movable-type.co.uk/scripts/latlong.html
// Under Creative Commons License http://creativecommons.org/licenses/by/3.0/
function calculateDistanceKM(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2-lat1).toRad();
  console.log("dLAT = "+dLat);
  
  if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
    }
  }
  
  var dLon = (lon2-lon1).toRad();
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos((lat1* Math.PI / 180).toRad()) * Math.cos((lat2* Math.PI / 180).toRad()) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  
  return d;
}

function calculateDistanceFT(lat1, lon1, lat2, lon2) {
  var R = 6371; 
  var dLat = (lat2-lat1).toRad();
  var dLon = (lon2-lon1).toRad();
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos((lat1* Math.PI / 180).toRad()) * Math.cos((lat2* Math.PI / 180).toRad()) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c * 0.62 * 5280;
  
  return d;
}



Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}


function drawArrow(currentHeading){
   //Canvas
 
  
  var rectWidth = 100;
  var rectHeight = 150;
  
  console.log(canvas.width +", "+canvas.height);
 
  // translate context to center of canvas
  context.translate(canvas.width / 2, canvas.height / 2);
  
  //degrees = radians * 108 / Math.PI
  //radians = degrees * Math.PI / 180
  
  
  
//  context.rotate(Math.PI / 4); //in radians
  
  
  context.beginPath(); // begin custom shape
  context.moveTo(0, 75);
  context.lineTo(50, -75);
  context.lineTo(0, 0);
  context.lineTo(-50, -75);
  context.lineTo(0, 75);
  context.closePath(); // complete custom shape
  context.lineWidth = 5;
  context.fillStyle = "#8ED6FF";
  context.shadowColor = "#bbbbbb";
  context.shadowBlur = 10;
  context.shadowOffsetX = 5;
  context.shadowOffsetY = 5;
  
  // translate context to center of canvas
  //context.translate(canvas.width / 2, canvas.height / 2);
  // rotate 45 degrees clockwise
  //context.rotate(Math.PI / 4); //in radians
  
  /*
  radians = degrees * (pi/180)

  degrees = radians * (180/pi)
  */
  
  context.fill();
  context.strokeStyle = "#0000ff";
  context.stroke();
}

$(document).ready(function(){

});

window.addEventListener("load", init, false);