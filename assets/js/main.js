
/**********************************************************************************/
$(document).ready(function(){
//get list country
$.getJSON('plugin/listCountries.json', function(response) {

    var data = response.data

    var listCountries=""
    for(i=0;i<data.length;i++){
    listCountries+='<option value="'+data[i].iso_a2+'">'+data[i].name+'</option>'
    }
    $('#countrySelected').append(listCountries)
    sortSelectOptions()

});//list Countries

/****************************************************************/
//sort by name
    function sortSelectOptions() {
        $("#countrySelected").append($("#countrySelected option")
            .remove().sort(function(a, b) {
                var at = $(a).text(),
                    bt = $(b).text();
                return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
            })
        );
        navigator.geolocation.getCurrentPosition(getUserLocation);
    };

/*******************************************************************/

function getUserLocation(position) {
    var userPositionlat = position.coords.latitude;
    var userPositionlng = position.coords.longitude;
    
    $.ajax({
        url: './php/getCountryCodeInfo.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: userPositionlat,
            lng: userPositionlng
        },

        success: function(result) {

            isoa2 = result['code'];
            console.log(isoa2)
            if(isoa2=="-99"){
                  isoa2='GB'
                }

            $('#countrySelected option[value=' +isoa2+']').prop("selected", true).change();

        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    })
};

/******************************************************************************************/

})//ready

/**********************************************************************************/

//create map
var map = L.map("map").setView([24.05179, -74.53138], 10)

// Add a tile layer
 var thunderforest=L.tileLayer(
                'https://tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=0832bc7dfea74364bb929bc30df35653', {
                attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18
            }).addTo(map);

/************************************************************************************/
// Add a GeoJSON layer with custom styling
      var geojsonLayer = L.geoJSON(null, {
        style: function (feature) {
          return {
            color: "#000",
            weight: 1,
            fillOpacity: 0.2,
            fillColor: "#f00",
          };
        },
      }).addTo(map);

      /**********************************************************************************/
      L.control.locate({
  position: 'topleft',
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: false,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: 'fa fa-location-arrow',
  metric: true,
  strings: {
    title: 'Show me where I am',
    popup: 'You are within {distance} {unit} from this point',
    outsideMapBoundsMsg: 'You seem located outside the boundaries of the map'
  },
  locateOptions: {
    maxZoom: 7,
    enableHighAccuracy: true
  }
}).addTo(map);

/*************************************************************************************/
var myStyle = {
    "color": "#36454f",
    "weight": 2,
    "opacity": 0.5,
    "fillOpacity": 0
};

/**************************************************************************************/
$('#countrySelected').change(function() {
    var isoa2 = $(this).val();
    if(isoa2=="-99"){
                  isoa2='GB'
                  $('#countrySelected option[value=' +isoa2+']').prop("selected", true).change();
                }
    map.eachLayer(function(layer){
      map.removeLayer(layer);
      });
      map.addLayer(thunderforest);


    $.getJSON("./data/countries.geojson", function (data) {
      L.geoJSON(data, {
      style: function (feature) {
        return {
          color: "transparent",
          opacity: 1,
          weight: 1,
          fillColor: "transparent",
          fillOpacity: 0,
        };
      },
    onEachFeature: (feature, layer) => {

console.log(isoa2)


    if(feature.properties.ISO_A2==isoa2){
      console.log("ISO_A2   =>"+feature.properties.ISO_A2+" isoa2=>  "+isoa2)
      map.flyToBounds(layer.getBounds());
      layer.setStyle({
                  color: "red",
                  opacity: 1,
                  weight: 2,
                  fillColor: "transparent",
                  fillOpacity: 1,
                });


/************************************************************/
       weatherInformation.remove();
       weatherInformation.addTo(map);
       wikiInformation.remove();
       wikiInformation.addTo(map);
       exchangeRate.remove();
       exchangeRate.addTo(map);
      
       getMarkers(isoa2)
   
  /*************************************************************/


              layer.on('click', function (e) {

              $.ajax({
            url:'./php/getCountryInfo.php',
            method:'post',
            async:false,
            data:{lang:isoa2,country:isoa2},
            success:function(response){
              console.log(response.code)

          var data = response.code[0]
              


               layer.bindPopup("<table style='width:500px' class='table table-striped'><tr  class='bg-success'><th colspan='2' style='color:#fff'>Country Information </th></tr><tr><td> Country Name </td><td style='text-align:right'> " + data.countryName + "</td></tr><tr><td> Capital </td><td  style='text-align:right'>"+data.capital
               +"</td></tr><tr><td> Country Code  </td><td  style='text-align:right'>"+data.countryCode
               +"</td></tr><tr><td>Population  </td><td  style='text-align:right'>"+data.population
               +"</td></tr></table>");
            
            }
          })
              this.openPopup();
            });//click layer




  /********************************************************/

}//end if



    }
   
}).addData(data).addTo(map);
})//end geojson

});//change country
    

    /*******************************************************************************************/
   

     var exchangeRate = L.easyButton({
    position: 'topleft',
    states: [{
        stateName: 'exchange-rate-modal',
        icon: 'fas fa-star fa-2x',
        title: 'exchange rate',
        onClick: function onEachFeature(f, l){
                var isoa2 = $('#countrySelected option:selected').val();
                //modalGeneration(isoa2);
               
                if(isoa2=="-99"){
                  isoa2='GB'
                }
                rateExchangeModal(isoa2)

        }
    }]
});

   

   /*********************************************************************************************/
var weatherInformation = L.easyButton({
    position: 'topleft',
    states: [{
        stateName: 'weather-modal',
        icon: 'fa-cloud-sun-rain fa-2x',
        title: ' Weather Information',
        onClick: function onEachFeature(f, l) {
          
                   var isoa2 = $('#countrySelected').val(); 
                
           if(isoa2=="-99"){
                  isoa2='GB'
                }

var country = $('#countrySelected option:selected').text();
            
            weatherModal(isoa2,country);
        }
    }],style: {
        'background-color': 'white',
        'border-radius': '4px',
        'padding': '8px'
    }
});
/***************************************************************************************************/
      /*********************************************************************************************/
var wikiInformation = L.easyButton({
    position: 'topleft',
    states: [{
        stateName: 'wiki-modal',

        icon: 'fab fa-wikipedia-w fa-2x',
        title: ' Wiki Information',
        onClick: function onEachFeature(f, l) {
            var isoa2 = $('#countrySelected').val(); 
          
            if(isoa2=="-99"){
                  isoa2='GB'
                }
            wikiModal(isoa2);
        }
    }]
});
/***************************************************************************************************/


            
var weatherModal = function(isoa2,country){
 
           $.ajax({
            url:'./php/getCountryInfo.php',
            method:'post',
            async:false,
            data:{lang:isoa2,country:isoa2},
            success:function(response){
             
                 var data = response.code[0]


             var east = data.east
             var north= data.north
             var south = data.south
             var west = data.west

                  $.ajax({
                    url:'./php/getWeatherInfo.php',
                    async:false,
                    data:{east:east,north:north,south:south,west:west},
                    success:function(result){
                    $('#weatherPlaceName').text('Weather In '+ country)
                      console.log(result)


var data = result.data


                      var weatherBody = '<table class="table table-striped"><tr  class="bg-success"><th  style="color:#fff">Weather </th><th style="text-align:right;color:#fff !important"> <button style="color:#fff !important" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></th></tr></table>';

                      for(i=0;i<data.length;i++){
                        weatherBody+='<table style="border-color:white;" class="table table-striped"><tr><th>Temperature</th><td style="text-align:right">'+data[i].temperature+'</td></tr><tr><th>Clouds</th><td style="text-align:right">'+data[i].clouds+'</td></tr><tr><th>Humidity</th><td style="text-align:right">'+data[i].humidity+'</td></tr><tr><th>Station Name</th><td style="text-align:right">'+data[i].stationName+'</td></tr></table><hr style="border-top: 6px solid;color: #188050;"/>'
                      }

weatherBody+='</div></div>'
$('.weatherBody').empty()
                      $('.weatherBody').append(weatherBody)


            $('#modalWeather').modal('show');

          }
        })
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    });
};
/***********************************************************************************************/

var wikiModal = function(isoa2){
 
           $.ajax({
            url:'./php/getWikiInfo.php',
            method:'post',
            async:false,
            data:{q:isoa2},
            success:function(response){
         
          var data =response.data[0]
//$('#wikiPlaceName').text('Wiki '+isoa2)
$('.wiki_body').empty()

$('.wiki_body').append('<table class="table table-striped"><tr  class="bg-success"><th  style="color:#fff">Wiki '+isoa2+' </th><th style="text-align:right;color:#fff !important"> <button style="color:#fff !important" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></th></tr><tr><td style="white-space: nowrap;"> Title </td><td style="text-align:right"> '+data.title+'</td></tr><tr><td style="white-space: nowrap;"> Country Code </td><td style="text-align:right">  '+data.countryCode+'</td></tr><tr><td style="white-space: nowrap;"> Elevation </td><td style="text-align:right">  '+data.elevation+'</td></tr><tr style="white-space: nowrap;"><td> Feature </td><td style="text-align:right"> '+data.feature+'</td></tr><tr><td style="white-space: nowrap;"> Lang </td><td style="text-align:right"> '+data.lang+'</td></tr><tr><td style="white-space: nowrap;"> Latitude </td><td style="text-align:right"> '+data.lat+'</td></tr><tr><td style="white-space: nowrap;"> Longitude </td><td style="text-align:right"> '+data.lng+'</td></tr><tr><td style="white-space: nowrap;"> Summary </td><td style="text-align:right"> '+data.summary+'</td></tr><tr><td style="white-space: nowrap;"> Wikipedia Url  </td><td style="text-align:right"><a target="_blank" href="//'+data.wikipediaUrl+'"> '+data.wikipediaUrl+'</a></td></tr></table>')

            $('#modalWiki').modal('show');
       
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    });
};


/**************************************************************************************************/

var rateExchangeModal = function(isoa2){
 
     $.ajax({
            url:'./php/getCountryInfo.php',
            method:'post',
            async:false,
            data:{lang:isoa2,country:isoa2},
            success:function(response){
              var data = response.code[0]

var currencyCode = data.currencyCode


                $.ajax({
                  url:'./php/exchangeRateInfo.php',
                  async:false,
            data:{appid:"61f2c1ce7bcd4806bff88edb53c22bd3"},
                  success:function(response){
                  

                    var listCurrency = response.data.rates
                   
                    $.each(listCurrency, function(key, value) {
    if(key === currencyCode) {
      var base = response.data.base
    
$('.exchageRate_body').empty()
        $('.exchageRate_body').append('<table class="table table-striped"><tr  class="bg-success"><th  style="color:#fff">Rate Exchange </th><th style="text-align:right;color:#fff !important"> <button style="color:#fff !important" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></th></tr><tr><td>Currency Code</td><td>'+key+'</td></tr><tr><td>Rate</td><td>'+value+'</td></tr></table>')



/*$('.exchageRate_body').append('<table class="table table-bordered"><tr><th>Currency Code</th><th>Base</th><th>Rate</th></tr><tr><td>'+key+'</td><td>'+base+'</td><td>'+value+'</td></tr></table>')*/
           $('#modalRateExchange').modal('show');
    }
});
                  }
                })
              }
              })
};

/********************************************************************************************************** */

function getMarkers(isoa2){
  
$.ajax({
  url:'./php/send/cityMarkers.php',
  async:false,
  method:'post',
  data:{iso:isoa2},
  success:function(response){
    
   /*const markers =  L.markerClusterGroup({
  iconCreateFunction: function(cluster) {
    var childCount = cluster.getChildCount();
    var color = 'green';
    if (childCount >= 10) {
      color = 'red';
    } else if (childCount >= 5) {
      color = 'orange';
    }
    return L.divIcon({
      html: childCount,
      className: 'marker-cluster',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      style: 'background-color: ' + color
    });
  }
})*/
var markerCluster = L.markerClusterGroup();
markerCluster.addTo(map);

/******************/
  var redMarker = L.ExtraMarkers.icon({
    icon: 'fas fa-building',
    markerColor: 'red',
    shape: 'square',
    prefix: 'fa'
  });

  /************************/
      var myIcon = L.divIcon({
      className: 'my-icon',
      
      html: '<i class="fas fa-building" style="color: #ccc; font-size: 40px;"></i>',
    iconSize: [50, 50],
    iconAnchor: [25, 50]
  });
  L.geoJSON(response, {
    pointToLayer: function(feature, latlng) {

  return markerCluster.addLayer(L.marker(latlng, {icon: redMarker})).addTo(map);
     // return markers.addLayer(L.marker(latlng, {icon: redMarker})).addTo(map);
    }
  }).addTo(map);
map.addLayer(markerCluster);
   }
})
}

