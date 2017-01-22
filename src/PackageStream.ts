import {Readable} from 'stream';
import {inherits} from 'util';

import {Package} from './Package';

export class PackageStream extends Readable{

    private packages : Package [] = [];
    private pendingRead = false;

    constructor(){
        super({objectMode: true});
    }

    _read(){

        if(this.packages.length > 0)
        {
            this.flushPackages();
        }
        else
        {
            this.pendingRead = true;
        }
    }

    private flushPackages()
    {
        while(this.packages.length > 0)
        {
            this.push(this.packages.shift());
        }
    }

    public PushPackages(pkgs : Package[])
    {
        pkgs.forEach(element => {
            this.packages.push(element);
        });

        if(this.pendingRead)
        {
            this.pendingRead = false;
            this.flushPackages();
        }
    }
}

inherits(PackageStream, Readable);
