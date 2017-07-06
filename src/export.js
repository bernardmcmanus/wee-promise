import WeePromise from './main';

if (typeof exports == 'object') {
  module.exports = WeePromise;
}
else {
  global.WeePromise = WeePromise;
}
