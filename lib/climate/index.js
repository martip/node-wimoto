var NobleDevice = require('noble-device');

var Util = require('./util');

var TEMPERATURE_SERVICE_UUID                = 'e0035608ec484ed09f3b5419c00a94fd';
var LIGHT_SERVICE_UUID                      = 'e003560eec484ed09f3b5419c00a94fd';
var HUMIDITY_SERVICE_UUID                   = 'e0035614ec484ed09f3b5419c00a94fd';

var CURRENT_TEMPERATURE_CHARACTERISTIC_UUID = 'e0035609ec484ed09f3b5419c00a94fd';
var CURRENT_LIGHT_CHARACTERISTIC_UUID       = 'e003560fec484ed09f3b5419c00a94fd';
var CURRENT_HUMIDITY_CHARACTERISTIC_UUID    = 'e0035615ec484ed09f3b5419c00a94fd';

var WimotoClimate = function(peripheral) {
  NobleDevice.call(this, peripheral);

  this._onCurrentTemperatureChangeBinded = this._onCurrentTemperatureChange.bind(this);
};

WimotoClimate.SCAN_UUIDS = ['5608', '5614', '560e'];

NobleDevice.Util.inherits(WimotoClimate, NobleDevice);

NobleDevice.Util.mixin(WimotoClimate, NobleDevice.DeviceInformationService, [
  'readManufacturerName',
  'readModelNumber',
  'readSystemId'
]);
NobleDevice.Util.mixin(WimotoClimate, NobleDevice.BatteryService);


WimotoClimate.prototype.readCurrentTemperature = function(callback) {
  this.readUInt16LECharacteristic(TEMPERATURE_SERVICE_UUID, CURRENT_TEMPERATURE_CHARACTERISTIC_UUID, function(error, value) {
    if (error) {
      return callback(error);
    }

    var currentTemperature = Util.convertCurrentTemperature(value);

    callback(null, currentTemperature);
  });
};

WimotoClimate.prototype.notifyCurrentTemperature = function(callback) {
  this.notifyCharacteristic(TEMPERATURE_SERVICE_UUID, CURRENT_TEMPERATURE_CHARACTERISTIC_UUID, true, this._onCurrentTemperatureChangeBinded, callback);
};

WimotoClimate.prototype.unnotifyCurrentTemperature = function(callback) {
  this.notifyCharacteristic(TEMPERATURE_SERVICE_UUID, CURRENT_TEMPERATURE_CHARACTERISTIC_UUID, false, this._onCurrentTemperatureChangeBinded, callback);
};

WimotoClimate.prototype._onCurrentTemperatureChange = function(data) {
  var value = data.readUInt16LE(0);
  var currentTemperature = Util.convertCurrentTemperature(value);

  this.emit('currentTemperatureChange', currentTemperature);
};

WimotoClimate.prototype.readCurrentLight = function(callback) {
  this.readUInt16LECharacteristic(LIGHT_SERVICE_UUID, CURRENT_LIGHT_CHARACTERISTIC_UUID, function(error, value) {
    if (error) {
      return callback(error);
    }

    var currentLight = Util.convertCurrentLight(value);

    callback(null, currentLight);
  });
};

WimotoClimate.prototype.readCurrentHumidity = function(callback) {
  this.readUInt16LECharacteristic(HUMIDITY_SERVICE_UUID, CURRENT_HUMIDITY_CHARACTERISTIC_UUID, function(error, value) {
    if (error) {
      return callback(error);
    }

    var currentHumidity = Util.convertCurrentHumidity(value);

    callback(null, currentHumidity);
  });
};

module.exports = WimotoClimate;