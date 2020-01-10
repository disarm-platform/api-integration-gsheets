function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('DISARM API')
      .addItem('Adaptive sampler', 'sendDataToAdaptiveSampler')
      .addToUi();
}

function getByName(colName, row) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var col = data[0].indexOf(colName);
  if (col != -1) {
    return data[row][col];
  }
}
function testGetByName(){
  Logger.log(getByName("n_trials", 1))
}


function request(e) {
  var payload = JSON.stringify(e);
  var url = 'https://faas.srv.disarm.io/function/fn-adaptive-sampling';
  var options = {
      'method': 'post',
      "contentType" : "application/json",
      'payload': payload
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var response = JSON.parse(response);
  //var md =  ImportJSON(url,options);
  
  
  var result_array = response["result"]["features"]
  var sheet = SpreadsheetApp.getActiveSheet()
  
  var col = SpreadsheetApp.getActiveSheet().getLastColumn() + 1;

  sheet.getRange(1,col).setValue('adaptively_selected');
  
  var filtered = result_array.reduce(function(a, o){
    return a.concat(o.properties.adaptively_selected) 
  },[])
  
  var mainSheet = SpreadsheetApp.getActiveSheet()
  var array = filtered.map(function (el) {
    return [el];
  });
  var range = sheet.getRange(2, col, filtered.length, 1)
  range.setValues(array)
  
}



function sendDataToAdaptiveSampler(){

  var data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("point_500").getDataRange().getValues();
  var data_to_send = {"uncertainty_fieldname": "exceedance_uncertainty","from":"google-sheet", "batch_size": 2,};
  
  
  const features = [];
  for(i in data){
    if(!(i == 0)){
      features.push(  
        {
          "type": "Feature",
          "properties": {
            "n_trials":parseFloat(getByName("n_trials", i)),
            "n_positive":parseFloat(getByName("n_positive", i)),
            "exceedance_uncertainty":parseFloat(getByName("exceedance_uncertainty", i)),
            "id":getByName("id", i)
          },
          "geometry": {
            "type": "Point",
            "coordinates": [ parseFloat(getByName("longitude", i)), parseFloat(getByName("latitude", i)) ] 
          } 
        }
      )
    };
  }       
  const fc = {
  "type": "FeatureCollection",
  "features": features,
  }
 data_to_send['point_data'] = fc;
 request(data_to_send);  
            
}

