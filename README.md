#gulp-topological-packages

Stream intended to be used with gulp which is designed to run a command on multiple packages. The stream provides every package sorted topologically.

## Example

Here is a small example shoing how a command would be executed on multiple projects inside a folder called *local_packages*.

```
const topo = require(gulp-topological-packages);

gulp.task('for-each-package', () => {
    return topo.Packages.SortedPackages(
    [
        './local_packages/**/package.json',      // Glob matching all the package.json files in the local_packages directory
        '!./local_packages/**/node_modules/**/*' // Glob to exclude things located in a node_modules directory just in case
    ]).pipe(through2(
        {objectMode: true}, // Must be true because SortedPacakges is an object stream
        (package, enc, callback => {
            // Do stuff with package. See: doc/classes/_package_.package.html to learn about the package fields
            callback(); // Finish this stream 
        }));
});
```