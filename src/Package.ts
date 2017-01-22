export class Package{    
    private data : any;
    public readonly path : string;

    constructor(data : any, path : string){
        this.data = data;
        this.path = path;
    }

    get Name(){
        return this.data['name'];
    }

    get Dependencies()
    {
        var deps = this.data['dependencies'];
        var result : string[] = [];

        for(var name in deps)
        {
            if(deps.hasOwnProperty(name))
            {
                result.push(name);
            }
        }

        return result;
    }
}