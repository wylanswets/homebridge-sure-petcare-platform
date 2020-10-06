var Accessory, Service, Characteristic, UUIDGen;
var SurePetcareApi = require('sure_petcare').SurePetcareApi;

var SurePetcarePetFlap = require('./accessories/SurePetcarePetFlap');
var SurePetcareOccupancySensor = require('./accessories/SurePetcareOccupancySensor');

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
            self.PetcareApi.getStatuses(function(data) {
                var devices = data.data.devices;
                for(var i in devices) {
                    var device = devices[i];
                    self.addAccessories(device);
                }

                if(config.pet_occupancy) {
                    var pets = data.data.pets;
                    for(var i in pets) {
                        var pet = pets[i];
                        self.addPets(pet);
                    }
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
        self.PetcareApi.getStatuses(function(data) {
            for(uuid in self.accessories) {
                var acc = self.accessories[uuid];
                acc.pollStatus(data);
            }
            self.pollStatus();
        });

        
    }, interval);
}

SurePetcare.prototype.addAccessories = function(device) {

    switch(device.product_id) {
        case 6: // cat flap iDSCF
            var uuid = UUIDGen.generate(device.serial_number);
            //Add accessory
            var accessory = this.accessories[uuid];
            if(accessory === undefined) {
                this.registerCatFlap(device);
            } else {
                this.accessories[uuid] = new SurePetcarePetFlap(this.log, (accessory instanceof SurePetcarePetFlap ? accessory.accessory : accessory), device, this.PetcareApi, this.config);
            }
            break;
        case 3: // Pet flap
            var uuid = UUIDGen.generate(device.mac_address);
            var accessory = this.accessories[uuid];
            if(accessory === undefined) {
                this.registerCatFlap(device);
            } else {
                this.accessories[uuid] = new SurePetcarePetFlap(this.log, (accessory instanceof SurePetcarePetFlap ? accessory.accessory : accessory), device, this.PetcareApi, this.config);
            }
    }    
}

SurePetcare.prototype.addPets = function(pet) {
    
    // var self = this;
    var uuid = UUIDGen.generate("PET-" + pet.id);
        
    //Add accessory
    var accessory = this.accessories[uuid];

    var occupancy_flipped = this.config.occupancy_flipped ? this.config.occupancy_flipped : false;

    if(accessory === undefined) {
        this.registerOccupancySensor(pet, occupancy_flipped);
    } else {
        this.accessories[uuid] = new SurePetcareOccupancySensor(this.log, (accessory instanceof SurePetcareOccupancySensor ? accessory.accessory : accessory), pet, this.PetcareApi, occupancy_flipped);
    }
    
}

SurePetcare.prototype.registerCatFlap = function(device) {
    var uuid_string = device.serial_number == undefined ? device.mac_address : device.serial_number;
    var uuid = UUIDGen.generate(uuid_string);
    var name = device.name == '' ? "Pet Door" : device.name;
    var acc = new Accessory(name, uuid);

    acc.addService(Service.LockMechanism);

    this.accessories[uuid] = new SurePetcarePetFlap(this.log, acc, device, this.PetcareApi, this.config);

    this.api.registerPlatformAccessories("homebridge-sure-petcare-platform", "SurePetcare", [acc]);

}

SurePetcare.prototype.registerOccupancySensor = function(pet, occupancy_flipped) {

    var uuid = UUIDGen.generate("PET-" + pet.id);
    var name = pet.name == '' ? "Pet Occupancy" : pet.name;
    var acc = new Accessory(name, uuid);

    acc.addService(Service.OccupancySensor);
    
    this.accessories[uuid] = new SurePetcareOccupancySensor(this.log, acc, pet, this.PetcareApi, occupancy_flipped);

    this.api.registerPlatformAccessories("homebridge-sure-petcare-platform", "SurePetcare", [acc]);

}

SurePetcare.prototype.configureAccessory = function(accessory) {
    this.accessories[accessory.UUID] = accessory;
}