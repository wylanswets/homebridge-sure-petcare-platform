var SurePetcareAccessory = require('./SurePetcareAccessory.js');

function SurePetcarePetFlap(log, accessory, device, session) {
    SurePetcareAccessory.call(this, log, accessory, device, session);

    this.lock = device;

    this.service = this.accessory.getService(global.Service.LockMechanism);

    this.service
        .getCharacteristic(global.Characteristic.LockCurrentState)
        .on('get', this._getLockState.bind(this));

    this.service
        .getCharacteristic(global.Characteristic.LockTargetState)
        .on('set', this._setLockState.bind(this))
        .on('get', this._getLockState.bind(this));

    //add battery service if needed
    this.battery = this.accessory.getService(global.Service.BatteryService);
    if(this.battery == undefined) {
        this.accessory.addService(global.Service.BatteryService);
        this.battery = this.accessory.getService(global.Service.BatteryService);
    }

    this.battery
        .getCharacteristic(global.Characteristic.BatteryLevel)
        .on('get', this._getBatteryLevel.bind(this));
    
    this.battery
        .getCharacteristic(global.Characteristic.ChargingState)
        .on('get', this._getBatteryChargeState.bind(this));

    this.battery
        .getCharacteristic(global.Characteristic.StatusLowBattery)
        .on('get', this._getBatteryLowLevel.bind(this));

    this.accessory.updateReachability(true);
}

SurePetcarePetFlap.prototype = Object.create(SurePetcarePetFlap.prototype);

SurePetcarePetFlap.prototype.pollStatus = function(data) {
    for(index in data.data.devices) {

        var dev = data.data.devices[index];

        if(dev.id == this.lock.id) {
            var state = dev.status.locking.mode;
            state = state >= 1 ? 1 : 0; //Make sure we are only 1 (locked) or 0 (unlocked).
            this.service
                .getCharacteristic(Characteristic.LockTargetState)
                .setValue(state, null, "internal");
            this.service
                .getCharacteristic(Characteristic.LockCurrentState)
                .setValue(state, null, "internal");

            return;
        }
    }
}

SurePetcarePetFlap.prototype._getLockState = function(callback) {
    this.session.getLockStatus(this.lock.id, function(data) {
        var locked = data.status.locking.mode > 0 ? true : false;
        callback(null, locked);
    });
}

SurePetcarePetFlap.prototype._setLockState = function(targetState, callback, context) {
    if (context == "internal") return callback(null); // we set this state ourself, no need to react to it
    
    var self = this;
    this.session.setLock(this.lock.id, targetState, function(data) {
        self.service
          .getCharacteristic(Characteristic.LockCurrentState)
          .setValue(targetState, null, "internal");
        callback(null);
    });
}

SurePetcarePetFlap.prototype._getBatteryLevel = function(callback) {
    var self = this;
    this.session.getLockStatus(this.lock.id, function(data) {
        var battery = self.session.translateBatteryToPercent(data.status.battery);
        callback(null, battery);
    });
}

SurePetcarePetFlap.prototype._getBatteryChargeState = function(callback) {
    callback(2);
}

SurePetcarePetFlap.prototype._getBatteryLowLevel = function(callback) {
    var self = this;
    this.session.getLockStatus(this.lock.id, function(data) {
        var battery = self.session.translateBatteryToPercent(data.status.battery);
        var low_level = 0;
        //See if battery is less than or equal to 25%
        //BATTERY_LEVEL_LOW = 1;
        //BATTERY_LEVEL_NORMAL = 0;
        if(battery <= 25) {
            low_level = 1;
        }
        callback(null, low_level);
    });
}

module.exports = SurePetcarePetFlap;