"use strict";
exports.__esModule = true;
var ld = require("lodash");
var path_1 = require("path");
var through2 = require("through2");
var toposort = require("toposort");
var typescript_collections_1 = require("typescript-collections");
var graph_sequencer_1 = require("graph-sequencer");
var lodash_1 = require("lodash");
var Config_1 = require("./Config");
var Package_1 = require("./Package");
var Packages = /** @class */ (function () {
    function Packages() {
    }
    Packages.CreatePackage = function (chunck) {
        var file = chunck;
        var json;
        if (file.contents) {
            var content = file.contents;
            json = content.toString('utf-8');
        }
        return new Package_1.Package(JSON.parse(json), file.path);
    };
    Packages.RemoveSubPackages = function (packages) {
        var keys = packages.keys();
        var paths = packages.values().forEach(function (pkg, ix, arr) {
            ld.filter(keys, function (key) {
                var pkg2 = packages.getValue(key);
                return pkg2 && key !== pkg.Name && ld.includes(path_1.dirname(pkg2.Path), path_1.dirname(pkg.Path));
            })
                .forEach(function (key, ix, arr) {
                packages.remove(key);
            });
        });
    };
    Packages.GroupPackages = function (packages) {
        var edges = [];
        var nodes = [];
        packages.forEach(function (key, pkg) {
            nodes.push(key);
            pkg.Dependencies.forEach(function (value, ix, arr) {
                if (packages.containsKey(value)) {
                    edges.push([key, value]);
                }
            });
        });
        var temp = nodes.map(function (t) { return [t, lodash_1.filter(edges, function (e) { return e[0] === t; }).map(function (s) { return s[1]; })]; });
        var groups = graph_sequencer_1["default"]({
            graph: new Map(temp),
            groups: [
                nodes,
            ]
        });
        var sorted = toposort.array(nodes, edges);
        return groups;
    };
    Packages.SortPackages = function (packages) {
        var edges = [];
        var nodes = [];
        packages.forEach(function (key, pkg) {
            nodes.push(key);
            pkg.Dependencies.forEach(function (value, ix, arr) {
                if (packages.containsKey(value)) {
                    edges.push([key, value]);
                }
            });
        });
        var sorted = toposort.array(nodes, edges);
        return sorted.reverse().map(function (value) { return packages.getValue(value); });
    };
    Packages.SortedPackages = function (config_) {
        var config = config_ ? config_ : Config_1.defaultConfig;
        var mappings = new typescript_collections_1.Dictionary();
        return through2({ objectMode: true }, function (chunck, enc, cb) {
            var pkg = Packages.CreatePackage(chunck);
            mappings.setValue(pkg.Name, pkg);
            cb();
        }, function (cb) {
            var sorted = Packages.SortPackages(mappings);
            if (!config.keep_sub_packages) {
                Packages.RemoveSubPackages(mappings);
            }
            for (var _i = 0, sorted_1 = sorted; _i < sorted_1.length; _i++) {
                var pkg = sorted_1[_i];
                this.push(pkg);
            }
            cb();
        });
    };
    return Packages;
}());
exports.Packages = Packages;
