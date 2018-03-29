"use strict";
exports.__esModule = true;
var Package = /** @class */ (function () {
    function Package(data, path) {
        this.data = data;
        this.path = path;
    }
    Object.defineProperty(Package.prototype, "Name", {
        /**
         * Name in the name field of the package.
         */
        get: function () {
            return this.data['name'];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Package.prototype, "Dependencies", {
        /**
         * The names of all the dependencies of the package.
         */
        get: function () {
            var deps = this.data['dependencies'];
            var result = [];
            for (var name in deps) {
                if (deps.hasOwnProperty(name)) {
                    result.push(name);
                }
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Package.prototype, "Path", {
        /**
         * The location of the package.json file (including package.json)
         */
        get: function () {
            return this.path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Package.prototype, "Data", {
        /**
         * Object representing the package.json file.
         * Obtained by running JSON.parse on the file's content
         */
        get: function () {
            return this.data;
        },
        enumerable: true,
        configurable: true
    });
    return Package;
}());
exports.Package = Package;
