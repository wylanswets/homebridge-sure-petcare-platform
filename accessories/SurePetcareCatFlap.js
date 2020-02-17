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

SurePetcareCatFlap.prototype.pollStatus = function() {
    var self = this;
    this._getLockState(function(nothing, data) {
        self.service
          .getCharacteristic(Characteristic.LockTargetState)
          .setValue(data, null, "internal");
        self.service
          .getCharacteristic(Characteristic.LockCurrentState)
          .setValue(data, null, "internal");
    });
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