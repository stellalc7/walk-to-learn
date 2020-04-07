var departLocation;
var arriveLocation;
var endLoc;
var startLoc;
var podResults;

function getLatLngFromString(ll) {
  var latlng = ll.split(/, ?/);
  return new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
}

function getWeather(latLon_start) {
  var latLon = latLon_start;
  var postData = { units: "si" };
  $.ajax({
    method: "GET",
    url:
      "https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/594c1248193e6b5c5ffd1289587226d0/" +
      latLon,
    data: postData,
  }).done(function (response) {
    temp = response.currently.apparentTemperature;
    if (temp <= 16) {
      wxText = "Grab a jacket! It's ";
      document.getElementById("tempIcon").src = "/images/temp-icons/Wind.svg";
    } else {
      wxText = "Enjoy the warmth! It's ";
      document.getElementById("tempIcon").src = "/images/temp-icons/Sun.svg";
    }
    tempStr = temp.toString();
    $("#temperature").html(wxText + tempStr.bold() + "\xB0C.");
  });
}

function getPodcasts(lengthTime) {
  var podcastSubject = document.getElementById("txtautocomplete_podcast").value;
  var walkTime = Math.round(lengthTime / 60); // convert lengthTime to minutes
  var walkMax = walkTime + 3;
  var walkMin = walkTime - 3;
  var postData = {
    language: "English",
    len_max: walkMax, // minutes
    len_min: walkMin, // minutes
    q: podcastSubject, // user input
    sort_by_date: "0",
    type: "episode",
    only_in: "title", // or 'description'?
  };
  $.ajax({
    headers: {
      Accept: "application/json",
      "X-Mashape-Key": "wpxzaCqBGbmsh2RD1HhZdQzgvvCnp1gDt3tjsnaRr0Z9iqZ9eo",
    },
    method: "GET",
    url: "https://listennotes.p.mashape.com/api/v1/search",
    data: postData,
  }).done(function (response) {
    console.log(response);
    podResults = response;

    if (podResults.count >= 3) {
      $("#podcast-results-header").html(
        "Which podcast do you want to listen to?"
      );

      var podcast0 = response.results[0].title_original;
      var p0_descrip = response.results[0].description_original;
      if (p0_descrip.length >= 400) {
        p0_descrip = p0_descrip.substring(0, 300) + " ...";
      }
      var p0_audio = response.results[0].audio;
      $("#podcast-result0").html(podcast0);
      $("#podcast-description0").html(p0_descrip);
      document.getElementById("audio0").src = p0_audio;

      var podcast1 = response.results[1].title_original;
      var p1_descrip = response.results[1].description_original;
      if (p1_descrip.length >= 400) {
        p1_descrip = p1_descrip.substring(0, 300) + " ...";
      }
      var p1_audio = response.results[1].audio;
      $("#podcast-result1").html(podcast1);
      $("#podcast-description1").html(p1_descrip);
      document.getElementById("audio1").src = p1_audio;

      var podcast2 = response.results[2].title_original;
      var p2_descrip = response.results[2].description_original;
      if (p2_descrip.length >= 400) {
        p2_descrip = p2_descrip.substring(0, 300) + " ...";
      }
      var p2_audio = response.results[2].audio;
      $("#podcast-result2").html(podcast2);
      $("#podcast-description2").html(p2_descrip);
      document.getElementById("audio2").src = p2_audio;
    } else {
      $("#podcast-no-results").html(
        "We can't find any podcasts that match your search! Enter a new route, or keyword."
      );
      document.getElementById("audio0").style.visibility = "hidden";
      document.getElementById("audio1").style.visibility = "hidden";
      document.getElementById("audio2").style.visibility = "hidden";
    }
  });
}

function getDistanceTime(latLon_start, latLon_end) {
  var service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(
    {
      origins: [latLon_start],
      destinations: [latLon_end],
      travelMode: "WALKING",
    },
    callback
  );
  function callback(response, status) {
    //console.log(response);
    dx = response.rows[0].elements[0].distance.value; // meters
    dt_sec = response.rows[0].elements[0].duration.value; // seconds
    dt_min = response.rows[0].elements[0].duration.text; // minutes
    $("#results").html("Your walk will take " + dt_min.bold() + ".");
    getPodcasts(dt_sec);
    getWeather(departLocation);
  }
}

// USER INPUT DEPART LOCATION
google.maps.event.addDomListener(window, "load", initialize_x);
function initialize_x() {
  var autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("txtautocomplete")
  );
  google.maps.event.addListener(autocomplete, "place_changed", function () {
    var places = autocomplete.getPlace();
    var origin = places.geometry.location;
    departLocation = origin.toString().slice(1, -1);
    startLoc = getLatLngFromString(departLocation);
  });
}

// USER INPUT ARRIVE LOCATION
google.maps.event.addDomListener(window, "load", initialize_y);
function initialize_y() {
  var autocomplete_y = new google.maps.places.Autocomplete(
    document.getElementById("txtautocomplete_y")
  );
  google.maps.event.addListener(autocomplete_y, "place_changed", function () {
    var places_y = autocomplete_y.getPlace();
    var destination = places_y.geometry.location;
    arriveLocation = destination.toString().slice(1, -1);
    endLoc = getLatLngFromString(arriveLocation);
  });
}

$("#startbutton").on("click", function () {
  if (
    startLoc &&
    endLoc &&
    document.getElementById("txtautocomplete_podcast").value != ""
  ) {
    $("#page1").css("display", "none");
    $("#page2").css("display", "block");
    getDistanceTime(startLoc, endLoc);
  } else {
    alert("Please complete all text fields!");
  }
});

var myVar;
function myFunction() {
  myVar = setTimeout(alertFunc, 5000);
}

function alertFunc() {
  $("#page2").css("display", "none");
  $("#page3").css("display", "block");
}

$(document).ready(function () {
  function getQuote() {
    var quotes = [
      {
        quote:
          "Naps under trees. Blurry thoughts. Breaths. Angry thoughts. Breaths. Trees.",
        name: "Maira Kalman",
      },
      {
        quote: "All truly great thoughts are conceived while walking.",
        name: "Friedrich Nietzsche",
      },
      {
        quote:
          "If I could not walk far and fast, I think I should just explode and perish.",
        name: "Charles Dickens",
      },
      {
        quote: "An early morning walk is a blessing for the whole day.",
        name: "Henry David Thoreau",
      },
      {
        quote: "Walking is a mode of making the world as well as being in it.",
        name: "Rebecca Solnit",
      },
    ];
    var quote = $("#quoteContainer").text();
    var quoteName = $("#quoteName").text();
    var sourceLength = quotes.length;
    var randomNumber = Math.floor(Math.random() * sourceLength);
    for (i = 0; i <= sourceLength; i += 1) {
      var newQuoteText = quotes[randomNumber].quote;
      var newQuoteName = quotes[randomNumber].name;
    }
    var timeAnimation = 500;
    var quoteContainer = $("#quoteContainer");
    quoteContainer.fadeOut(timeAnimation, function () {
      quoteContainer.html("");
      quoteContainer.append(
        "<p>" +
          newQuoteText +
          "</p>" +
          '<p id="quoteName">' +
          "-	" +
          newQuoteName +
          "</p>"
      );
      quoteContainer.fadeIn(timeAnimation);
    }); //end of fadeOut
  } //end of getQuote
  getQuote();
  $("#quoteButton").click(getQuote);
});
