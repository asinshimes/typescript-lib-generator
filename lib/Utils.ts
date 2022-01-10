import UglifyJS = require("./uglify-js/uglifyjs");
import file = require('./FileUtil');

export function uglify(sourceFile: any) {
    const defines = {
        DEBUG: false,
        RELEASE: true
    }
    const result = UglifyJS.minify(sourceFile, { compress: { global_defs: defines }, fromString: true, output: { beautify: false } });
    const code = result.code;
    return code;
}

export function format(text: string, ...args): string {
    var length = args.length;
    for (var i = 0; i < length || i < 5; i++) {
        text = text.replace(new RegExp("\\{" + i + "\\}", "ig"), args[i] || "");
    }


    return text;
}






export function minify(sourceFile: string): string
export function minify(sourceFile: string, output: string): void
export function minify(sourceFile: string, output?: string) {
    const defines = {
        DEBUG: false,
        RELEASE: true
    }
    //UglifyJS参数参考这个页面：https://github.com/mishoo/UglifyJS2
    const result = UglifyJS.minify(sourceFile, { compress: { global_defs: defines }, output: { beautify: false } });
    const code = result.code;
    if (output) {
        file.save(output, code);
    }
    else {
        return code;
    }

}