function SurePetcareAccessory(log, accessory, device, session) {
    var info = accessory.getService(global.Service.AccessoryInformation);

    accessory.context.manufacturer = "Sure Petcare"
    info.setCharacteristic(global.Characteristic.Manufacturer, accessory.context.manufacturer.toString());
    
    if(device.product_id === undefined || device.gender !== undefined) {
      //This is a pet so do some other things instead...
      accessory.context.model = "Pet";
      accessory.context.serial = device.id;
      accessory.context.revision = "1"
    } else {
      accessory.context.model = device.product_id == undefined ? "Sure Petcare" : device.product_id;
      accessory.context.serial = device.serial_number == undefined ? device.mac_address : device.serial_number;
      accessory.context.revision = device.version;
    }

    if(accessory.context.model.toString().length < 2) {
      accessory.context.model = "Model " + accessory.context.model;
    }

    info.setCharacteristic(global.Characteristic.Model, accessory.context.model.toString());
    
    info.setCharacteristic(global.Characteristic.SerialNumber, accessory.context.serial.toString());
    
    info.setCharacteristic(global.Characteristic.FirmwareRevision, accessory.context.revision.toString());
    
    this.accessory = accessory;
    this.log = log;
    this.session = session;
    this.deviceId = device.id;
  }
  
  SurePetcareAccessory.prototype.event = function(event) {
    //This method needs to be overridden in each accessory type
  }

  SurePetcareAccessory.prototype.pollStatus = function(event) {
    //This method needs to be overridden in each accessory type
    console.log("Override poll status in accessory.");
  }
  
  module.exports = SurePetcareAccessory;
  