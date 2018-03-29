import {readFile} from 'fs';
import * as gulp from 'gulp';
import * as ld from 'lodash';
import {dirname} from 'path';
import {Readable} from 'stream';
import * as through2 from 'through2';
import * as toposort from 'toposort';
import {Dictionary} from 'typescript-collections';
const graphSequencer = require("graph-sequencer");
import {filter} from "lodash";
import * as File from 'vinyl';

import {defaultConfig, IConfig} from './Config';
import {Package} from './Package';

export class Packages{
    public static CreatePackage(chunck){
        var file : File = chunck;
        var json : string;

        if(<Buffer>file.contents)
        {
            var content : Buffer = <Buffer>file.contents;
            json = content.toString('utf-8');
        }
        
        return new Package(JSON.parse(json), file.path);
    }

    private static RemoveSubPackages(packages : Dictionary<string,Package>){
        var keys = packages.keys();
        var paths = packages.values().forEach((pkg, ix, arr) => {

            ld.filter(
                keys,
                key => {
                    var pkg2 = packages.getValue(key);
                    return pkg2 && key !== pkg.Name && ld.includes(dirname(pkg2.Path), dirname(pkg.Path));
            })
            .forEach((key, ix, arr) => {
                packages.remove(key);
            });
        });
    }

    private static GroupPackages(packages : Dictionary<string, Package>) : Package[]
    {
        var edges = [];
        var nodes = [];

        packages.forEach((key, pkg) => {
            nodes.push(key);
            pkg.Dependencies.forEach((value, ix, arr) => {
                if(packages.containsKey(value))
                {
                    edges.push([key, value]);
                }
            });
        });

        const temp = nodes.map((t) => [t, filter(edges, (e) => e[0] === t).map((s) => s[1])]);
        var groups = graphSequencer({
            graph: new Map(temp as any),
            groups: [
                nodes, // higher prioritylower priority
            ],
        });

        // var sorted : string[] = toposort.array(nodes, edges);
        return groups.chunks.map(value => value.map((v) => packages.getValue(v)));

    }

    private static SortPackages(packages : Dictionary<string, Package>) : Package[]
    {
        var edges = [];
        var nodes = [];

        packages.forEach((key, pkg) => {
            nodes.push(key);
            pkg.Dependencies.forEach((value, ix, arr) => {
                if(packages.containsKey(value))
                {
                    edges.push([key, value]);
                }
            });
        });

        var sorted : string[] = toposort.array(nodes, edges);
        return sorted.reverse().map<Package>(value => packages.getValue(value));
    }

    public static SortedPackages(config_? : IConfig){
        var config = config_ ? config_ : defaultConfig;
        var mappings = new Dictionary<string, Package>();
        return through2(
            {objectMode: true},
            function(chunck, enc, cb){
                var pkg = Packages.CreatePackage(chunck);
                mappings.setValue(pkg.Name, pkg);
                cb();
            },
            function(cb){
                var sorted = Packages.SortPackages(mappings);
                
                if(!config.keep_sub_packages){
                    Packages.RemoveSubPackages(mappings);
                }

                for(let pkg of sorted){
                    this.push(pkg);
                }
                cb();
            }
        )
    }

    public static GroupedPackages(config_? : IConfig){
        var config = config_ ? config_ : defaultConfig;
        var mappings = new Dictionary<string, Package>();
        return through2(
            {objectMode: true},
            function(chunck, enc, cb){
                var pkg = Packages.CreatePackage(chunck);
                mappings.setValue(pkg.Name, pkg);
                cb();
            },
            function(cb){
                var sorted = Packages.GroupPackages(mappings);

                if(!config.keep_sub_packages){
                    Packages.RemoveSubPackages(mappings);
                }

                for(let pkg of sorted){
                    this.push(pkg);
                }
                cb();
            }
        )
    }
}
