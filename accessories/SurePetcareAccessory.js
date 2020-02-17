function SurePetcareAccessory(log, accessory, device, session) {
    var info = accessory.getService(global.Service.AccessoryInformation);

    accessory.context.manufacturer = "Sure Petcare"
    info.setCharacteristic(global.Characteristic.Manufacturer, accessory.context.manufacturer.toString());
    
    accessory.context.model = device.product_id;
    info.setCharacteristic(global.Characteristic.Model, accessory.context.model.toString());
    
    accessory.context.serial = device.serial_number;
    info.setCharacteristic(global.Characteristic.SerialNumber, accessory.context.serial.toString());
    
    accessory.context.revision = device.version;
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
  