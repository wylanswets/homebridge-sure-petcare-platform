var SurePetcareAccessory = require('./SurePetcareAccessory.js');

function SurePetcareCatFlap(log, accessory, device, session) {
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

    this.accessory.updateReachability(true);
}

SurePetcareCatFlap.prototype = Object.create(SurePetcareCatFlap.prototype);

SurePetcareCatFlap.prototype.pollStatus = function(data) {
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

SurePetcareCatFlap.prototype._getLockState = function(callback) {
    this.session.getLockStatus(this.lock.id, function(data) {
        var locked = data.status.locking.mode > 0 ? true : false;
        callback(null, locked);
    });
}

SurePetcareCatFlap.prototype._setLockState = function(targetState, callback, context) {
    if (context == "internal") return callback(null); // we set this state ourself, no need to react to it
    
    var self = this;
    this.session.setLock(this.lock.id, targetState, function(data) {
        self.service
          .getCharacteristic(Characteristic.LockCurrentState)
          .setValue(targetState, null, "internal");
        callback(null);
    });
}

module.exports = SurePetcareCatFlap;