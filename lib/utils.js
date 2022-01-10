Object.defineProperty(exports, "__esModule", { value: true });
exports.minify = exports.format = exports.uglify = void 0;
var UglifyJS = require("./uglify-js/uglifyjs");
var file = require("./FileUtil");
function uglify(sourceFile) {
    var defines = {
        DEBUG: false,
        RELEASE: true
    };
    var result = UglifyJS.minify(sourceFile, { compress: { global_defs: defines }, fromString: true, output: { beautify: false } });
    var code = result.code;
    return code;
}
exports.uglify = uglify;
function format(text) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var length = args.length;
    for (var i = 0; i < length || i < 5; i++) {
        text = text.replace(new RegExp("\\{" + i + "\\}", "ig"), args[i] || "");
    }
    return text;
}
exports.format = format;
function minify(sourceFile, output) {
    var defines = {
        DEBUG: false,
        RELEASE: true
    };
    //UglifyJS参数参考这个页面：https://github.com/mishoo/UglifyJS2
    var result = UglifyJS.minify(sourceFile, { compress: { global_defs: defines }, output: { beautify: false } });
    var code = result.code;
    if (output) {
        file.save(output, code);
    }
    else {
        return code;
    }
}
exports.minify = minify;
