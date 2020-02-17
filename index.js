var Accessory, Service, Characteristic, UUIDGen;
var SurePetcareApi = require('sure_petcare').SurePetcareApi;

var SurePetcareCatFlap = require('./accessories/SurePetcareCatFlap');

module.exports = function(homebridge) {

    // Accessory must be created from PlatformAccessory Constructor
    Accessory = homebridge.platformAccessory; global.Accessory = homebridge.platformAccessory;

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service; global.Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic; global.Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    // For platform plugin to be considered as dynamic platform plugin,
    // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
    homebridge.registerPlatform("homebridge-sure-petcare-platform", "SurePetcare", SurePetcare, true);
}

function SurePetcare(log, config, api) {
    this.log = log;
    this.accessories = [];
    this.api = api;
    // this.subscribed = false;
    var self = this;
    this.PetcareApi = null;
    this.config = config;
    if(config !== null) {
        this.api.on('didFinishLaunching', function() {
            self.PetcareApi = new SurePetcareApi({
                email_address: config.email,
                password: config.password,
                device_id: UUIDGen.generate(config.email)
            });
            self.PetcareApi.getDevices(function(data) {
                var devices = data;
                for(var i in devices) {
                    var device = devices[i];
                    self.addAccessories(device);
                }
            });
            self.pollStatus();
        });
    }
    
}

SurePetcare.prototype.pollStatus = function() {
    var self = this;
    var interval = self.config.poll_interval ? (self.config.poll_interval * 1000) : 30000;
    setTimeout(function() {
        var statuses = [];
        for(uuid in self.accessories) {
            statuses[uuid] = false;
            var acc = self.accessories[uuid];
            acc.pollStatus();
        }
        self.pollStatus();
    }, interval);
}

SurePetcare.prototype.addAccessories = function(device) {
    var self = this;
    var uuid = UUIDGen.generate(device.serial_number);
        
    //Add accessory
    var accessory = self.accessories[uuid];

    switch(device.product_id) {
        case 6: // cat flap
            if(accessory === undefined) {
                self.registerCatFlap(device);
            } else {
                self.accessories[uuid] = new SurePetcareCatFlap(self.log, (accessory instanceof SurePetcareCatFlap ? accessory.accessory : accessory), device, self.PetcareApi);
            }
            break;
    }    
}

SurePetcare.prototype.registerCatFlap = function(device) {
    var uuid = UUIDGen.generate(device.serial_number);
    var name = device.name == '' ? "Pet Door" : device.name;
    var acc = new Accessory(name, uuid);

    acc.addService(Service.LockMechanism);

    this.accessories[uuid] = new SurePetcareCatFlap(this.log, acc, device, this.PetcareApi);

    this.api.registerPlatformAccessories("homebridge-sure-petcare-platform", "SurePetcare", [acc]);

}

SurePetcare.prototype.configureAccessory = function(accessory) {
    this.accessories[accessory.UUID] = accessory;
}