import {readFile} from 'fs';
import * as gulp from 'gulp';
import * as ld from 'lodash';
import {dirname} from 'path';
import {Readable} from 'stream';
import * as through2 from 'through2';
import * as toposort from 'toposort';
import {Dictionary} from 'typescript-collections';
import * as File from 'vinyl';

import {defaultConfig, IConfig} from './Config';
import {Package} from './Package';
import {PackageStream} from './PackageStream';

export class Packages{

    public static readonly PackageJson = "package.json";

    public static GetPackages(src : string[])
    {
        return gulp.src(src);
    }

    public static LoadPackages(src : string[])
    {
        var packages = Packages.GetPackages(src);
        var th = through2(
            {objectMode: true},
            (chunck, enc, callback) => {
                var file : File = chunck;
                var json : string;

                if(<Buffer>file.contents)
                {
                    var content : Buffer = <Buffer>file.contents;
                    json = content.toString('utf-8');
                }
                
                th.push(new Package(JSON.parse(json), file.path));
                callback();
            });

        return packages.pipe(th);
    }

    private static RemoveSubPackages(packages : Dictionary<string,Package>){
        var keys = packages.keys();
        var paths = packages.values().forEach((pkg, ix, arr) => {

            ld.filter(
                keys,
                key => {
                    var pkg2 = packages.getValue(key);
                    return pkg2 && key != pkg.Name && ld.includes(dirname(pkg2.Path), dirname(pkg.Path));
            })
            .forEach((key, ix, arr) => {
                packages.remove(key);
            });
        });
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

    public static SortedPackages(src : string[], config_? : IConfig) : Readable
    {
        var config = config_ ? config_ : defaultConfig;
        var packages = Packages.LoadPackages(src);
        var result = new PackageStream();
        var mappings = new Dictionary<string, Package>();

        packages.on('data', (data) => mappings.setValue((<Package>data).Name, data));
        packages.on('end', () => {

            if(!config.keep_sub_packages){
                Packages.RemoveSubPackages(mappings);
            }

            var sorted : Package[] = Packages.SortPackages(mappings);
            sorted.push(null);
            result.PushPackages(sorted);
        });

        return result;
    }
}