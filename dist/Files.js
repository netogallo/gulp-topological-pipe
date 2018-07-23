"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ld = require("lodash");
const path_1 = require("path");
const through2 = require("through2");
const toposort = require("toposort");
const typescript_collections_1 = require("typescript-collections");
const graphSequencer = require("graph-sequencer");
const lodash_1 = require("lodash");
const Config_1 = require("./Config");
const Package_1 = require("./Package");
class Packages {
    static CreatePackage(chunck) {
        var file = chunck;
        var json;
        if (file.contents) {
            var content = file.contents;
            json = content.toString('utf-8');
        }
        return new Package_1.Package(JSON.parse(json), file.path);
    }
    static RemoveSubPackages(packages) {
        var keys = packages.keys();
        var paths = packages.values().forEach((pkg, ix, arr) => {
            ld.filter(keys, key => {
                var pkg2 = packages.getValue(key);
                return pkg2 && key !== pkg.Name && ld.includes(path_1.dirname(pkg2.Path), path_1.dirname(pkg.Path));
            })
                .forEach((key, ix, arr) => {
                packages.remove(key);
            });
        });
    }
    static GroupPackages(packages) {
        var edges = [];
        var nodes = [];
        packages.forEach((key, pkg) => {
            nodes.push(key);
            pkg.Dependencies.forEach((value, ix, arr) => {
                if (packages.containsKey(value)) {
                    edges.push([key, value]);
                }
            });
        });
        const temp = nodes.map((t) => [t, lodash_1.filter(edges, (e) => e[0] === t).map((s) => s[1])]);
        var groups = graphSequencer({
            graph: new Map(temp),
            groups: [
                nodes,
            ],
        });
        // var sorted : string[] = toposort.array(nodes, edges);
        return groups.chunks.map(value => value.map((v) => packages.getValue(v)));
    }
    static SortPackages(packages) {
        var edges = [];
        var nodes = [];
        packages.forEach((key, pkg) => {
            nodes.push(key);
            pkg.Dependencies.forEach((value, ix, arr) => {
                if (packages.containsKey(value)) {
                    edges.push([key, value]);
                }
            });
        });
        var sorted = toposort.array(nodes, edges);
        return sorted.reverse().map(value => packages.getValue(value));
    }
    static SortedPackages(config_) {
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
            for (let pkg of sorted) {
                this.push(pkg);
            }
            cb();
        });
    }
    static GroupedPackages(config_) {
        var config = config_ ? config_ : Config_1.defaultConfig;
        var mappings = new typescript_collections_1.Dictionary();
        return through2({ objectMode: true }, function (chunck, enc, cb) {
            var pkg = Packages.CreatePackage(chunck);
            mappings.setValue(pkg.Name, pkg);
            cb();
        }, function (cb) {
            var sorted = Packages.GroupPackages(mappings);
            if (!config.keep_sub_packages) {
                Packages.RemoveSubPackages(mappings);
            }
            for (let pkg of sorted) {
                this.push(pkg);
            }
            cb();
        });
    }
}
exports.Packages = Packages;
//# sourceMappingURL=Files.js.map