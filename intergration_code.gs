function onOpen() {
    var ui = SpreadsheetApp.getUi();
    // Or DocumentApp or FormApp.
    ui.createMenu('DISARM API')
        .addItem('Adaptive sampler', 'sendDataToAdaptiveSampler')
        .addToUi();
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
    SpreadsheetApp.getActiveSheet().getRange('H1').setValue('adaptively_selected');
    for each (var item in result_array)
    {
      var data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("point_500").getDataRange().getValues();
      
      for(var i in data){
        if(data[i][3] === item["properties"]["id"]){
          var index = parseInt(i) + 1
          SpreadsheetApp.getActiveSheet().getRange("H" + index).setValue(item["properties"]["adaptively_selected"]);
        }
      }
    }
    
  }
  
  
  
  function sendDataToAdaptiveSampler(){
  
    var data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("point_500").getDataRange().getValues();
     var data_to_send = {"uncertainty_fieldname": "exceedance_uncertainty","from":"google-sheet", "batch_size": 2,};
    
    
    const features = [];
    for(i in data){
      
      if(data[i][0] !== 'latitude'){
        features.push(  
          {
            "type": "Feature",
            "properties": {
              "n_trials":parseFloat(data[i][5]),
              "n_positive":parseFloat(data[i][6]),
              "exceedance_uncertainty":parseFloat(data[i][1]),
              "id":data[i][3]
            },
            "geometry": {
              "type": "Point",
              "coordinates": [ parseFloat(data[i][0]), parseFloat(data[i][1]) ] 
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
  