"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Package {
    constructor(data, path) {
        this.data = data;
        this.path = path;
    }
    /**
     * Name in the name field of the package.
     */
    get Name() {
        return this.data['name'];
    }
    /**
     * The names of all the dependencies of the package.
     */
    get Dependencies() {
        var deps = this.data['dependencies'];
        var result = [];
        for (var name in deps) {
            if (deps.hasOwnProperty(name)) {
                result.push(name);
            }
        }
        return result;
    }
    /**
     * The location of the package.json file (including package.json)
     */
    get Path() {
        return this.path;
    }
    /**
     * Object representing the package.json file.
     * Obtained by running JSON.parse on the file's content
     */
    get Data() {
        return this.data;
    }
}
exports.Package = Package;
//# sourceMappingURL=Package.js.map