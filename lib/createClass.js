var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };
var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

function createClass(type, properties) {
  function Class() {
    _classCallCheck(this, Class);
  }

  _prototypeProperties(Class, null, properties);

  return Class;
}

module.exports = createClass;