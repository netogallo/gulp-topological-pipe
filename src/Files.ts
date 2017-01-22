import {readFile} from 'fs';
import * as gulp from 'gulp';
import {Readable} from 'stream';
import * as through2 from 'through2';
import * as toposort from 'toposort';
import {Dictionary} from 'typescript-collections';
import * as File from 'vinyl';

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
        var out = new Readable({objectMode: true});
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

    public static SortedPackages(src : string[]) : Readable
    {
        var packages = Packages.LoadPackages(src);
        var result = new PackageStream();
        var mappings = new Dictionary<string, Package>();

        packages.on('data', (data) => mappings.setValue((<Package>data).Name, data));
        packages.on('end', () => {
            var sorted : Package[] = Packages.SortPackages(mappings);
            sorted.push(null);
            result.PushPackages(sorted);
        });

        return result;
    }
}