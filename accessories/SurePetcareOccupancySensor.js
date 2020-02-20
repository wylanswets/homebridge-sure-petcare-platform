var SurePetcareAccessory = require('./SurePetcareAccessory.js');

function SurePetcareOccupancySensor(log, accessory, device, session) {
    SurePetcareAccessory.call(this, log, accessory, device, session);

    this.sensor = device;

    this.service = this.accessory.getService(global.Service.OccupancySensor);

    this.service
        .getCharacteristic(global.Characteristic.OccupancyDetected)
        .on('get', this._getOccupancy.bind(this));


    this.accessory.updateReachability(true);
}

SurePetcareOccupancySensor.prototype = Object.create(SurePetcareOccupancySensor.prototype);

SurePetcareOccupancySensor.prototype.pollStatus = function(data) {

    var pets = data.data.pets;

        for(var i in pets) {
            var pet = pets[i];
            if(pet.id == this.sensor.id) {
                var where = pet.position.where == 2 ? 0 : 1;
                this.service
                    .getCharacteristic(Characteristic.OccupancyDetected)
                    .setValue(where);

                return;
            }
        }
}

SurePetcareOccupancySensor.prototype._getOccupancy = function(callback) {
    var self = this;
    console.log("getting pet status");
    this.session.getStatuses(function(data) {

        var pets = data.data.pets;

        for(var i in pets) {
            var pet = pets[i];
            if(pet.id == self.sensor.id) {
                //Pet position is 1 for inside and 2 for outside.
                //This needs to be 0 for no occupancy and 1 for occupancy
                var where = pet.position.where == 2 ? 0 : 1;
                callback(null, where);
                return;
            }
        }
    });
}


module.exports = SurePetcareOccupancySensor;