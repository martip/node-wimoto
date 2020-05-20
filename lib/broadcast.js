const events = require('events');
const util = require('util');

const noble = require('@abandonware/noble');

const ClimateUtil = require('./climate/util');

const Broadcast = function() {
  noble.on('discover', this.onDiscover.bind(this));
};

util.inherits(Broadcast, events.EventEmitter);

Broadcast.prototype.startScanning = function() {
  if (noble.state === 'poweredOn') {
    noble.startScanning([], true);
  } else {
    noble.once('stateChange', function() {
      noble.startScanning([], true);
    });
  }
};

Broadcast.prototype.stopScanning = function() {
  noble.stopScanning();
};

Broadcast.prototype.isBroadcast = function(peripheral) {
  const localName        = peripheral.advertisement.localName;
  const manufacturerData = peripheral.advertisement.manufacturerData;

  return (localName && localName.indexOf('_') !== -1 &&
        manufacturerData && manufacturerData.length !== 9 && manufacturerData[0] === 0x01 && manufacturerData[1] === 0x17);
}

Broadcast.prototype.parseBroadcast = function(peripheral){
  const localName        = peripheral.advertisement.localName;
  const manufacturerData = peripheral.advertisement.manufacturerData;

  const splitLocalName = localName.split('_');
  const type           = splitLocalName[0].toLowerCase();
  const id             = splitLocalName[1].toLowerCase();
  const sensorData     = manufacturerData.slice(2);

  const broadcast = {};

  if (type === 'climate') {
    broadcast.temperature = ClimateUtil.convertCurrentTemperature(sensorData.readUInt16LE(0));
    broadcast.light       = ClimateUtil.convertCurrentLight(sensorData.readUInt16LE(2));
    broadcast.humidity    = ClimateUtil.convertCurrentHumidity(sensorData.readUInt16LE(4));
    broadcast.battery     = sensorData.readUInt8(6);
  }

  return broadcast;
}

Broadcast.prototype.onDiscover = function(peripheral) {
  if (!this.isBroadcast(peripheral)) {
    return;
  }

  const broadcast = this.parseBroadcast(peripheral);

  this.emit('data', broadcast);
};

module.exports = Broadcast;
