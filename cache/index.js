const fs = require('fs');

module.exports = class Cache {
  static _instance = new Cache();
  map = {}

  constructor() {
    this.map = JSON.parse(fs.readFileSync('./cache/map.json'))
  }
}
