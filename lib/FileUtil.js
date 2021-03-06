//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJSONAsync = exports.statSync = exports.readJSONSync = exports.readJSONAsync = exports.readFileSync = exports.removeAsync = exports.copyAsync = exports.existsAsync = exports.existsSync = exports.moveAsync = exports.searchPath = exports.getAbsolutePath = exports.relative = exports.basename = exports.getRelativePath = exports.joinPath = exports.escapePath = exports.exists = exports.searchByFunction = exports.search = exports.getDirectoryAllListing = exports.getDirectoryListing = exports.getFileName = exports.getExtension = exports.getDirectory = exports.rename = exports.remove = exports.isFile = exports.isSymbolicLink = exports.isDirectory = exports.copy = exports.readBinary = exports.readFileAsync = exports.read = exports.clean = exports.createDirectory = exports.writeFileAsync = exports.save = void 0;
var FS = require("fs");
var Path = require("path");
var Global_1 = require("../Global");
var charset = "utf-8";
/**
 * ???????????????????????????
 * @param path ?????????????????????
 * @param data ??????????????????
 */
function save(path, data) {
    if (exists(path)) {
        remove(path);
    }
    path = escapePath(path);
    textTemp[path] = data;
    createDirectory(Path.dirname(path));
    FS.writeFileSync(path, data, { encoding: charset });
}
exports.save = save;
function writeFileAsync(path, content, charset) {
    return new Promise(function (resolve, reject) {
        FS.writeFile(path, content, { encoding: charset }, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}
exports.writeFileAsync = writeFileAsync;
/**
 * ???????????????
 */
function createDirectory(path, mode) {
    path = escapePath(path);
    if (mode === undefined) {
        mode = 511 & (~process.umask());
    }
    if (typeof mode === 'string')
        mode = parseInt(mode, 8);
    path = Path.resolve(path);
    try {
        FS.mkdirSync(path, mode);
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT':
                createDirectory(Path.dirname(path), mode);
                createDirectory(path, mode);
                break;
            default:
                var stat;
                try {
                    stat = FS.statSync(path);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory())
                    throw err0;
                break;
        }
    }
}
exports.createDirectory = createDirectory;
/**
 * ??????????????????????????????
 * @param path ??????????????????
 * @param excludes ??????????????????????????????
 */
function clean(path, excludes) {
    var fileList = getDirectoryListing(path);
    var length = fileList.length;
    for (var i = 0; i < length; i++) {
        var path = fileList[i];
        if (excludes && excludes.indexOf(path) >= 0)
            continue;
        remove(path);
    }
}
exports.clean = clean;
var textTemp = {};
/**
 * ??????????????????,?????????????????????????????????????????????????????????"".
 * @param path ????????????????????????
 */
function read(path, ignoreCache) {
    if (ignoreCache === void 0) { ignoreCache = false; }
    path = escapePath(path);
    var text = textTemp[path];
    if (text && !ignoreCache) {
        return text;
    }
    try {
        text = FS.readFileSync(path, charset);
        text = text.replace(/^\uFEFF/, '');
    }
    catch (err0) {
        return "";
    }
    if (text) {
        var ext = getExtension(path).toLowerCase();
        if (ext == "ts" || ext == "exml") {
            textTemp[path] = text;
        }
    }
    return text;
}
exports.read = read;
function readFileAsync(path, charset) {
    return new Promise(function (resolve, reject) {
        FS.readFile(path, charset, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
exports.readFileAsync = readFileAsync;
/**
 * ?????????????????????,????????????????????????????????????null.
 * @param path ????????????????????????
 */
function readBinary(path) {
    path = escapePath(path);
    try {
        var binary = FS.readFileSync(path);
    }
    catch (e) {
        return null;
    }
    return binary;
}
exports.readBinary = readBinary;
/**
 * ?????????????????????
 * @param source ???????????????
 * @param dest ?????????????????????????????????
 */
function copy(source, dest) {
    source = escapePath(source);
    dest = escapePath(dest);
    var stat = FS.lstatSync(source);
    if (stat.isDirectory()) {
        _copy_dir(source, dest);
    }
    else {
        _copy_file(source, dest);
    }
}
exports.copy = copy;
function isDirectory(path) {
    path = escapePath(path);
    try {
        var stat = FS.statSync(path);
    }
    catch (e) {
        return false;
    }
    return stat.isDirectory();
}
exports.isDirectory = isDirectory;
function isSymbolicLink(path) {
    path = escapePath(path);
    try {
        var stat = FS.statSync(path);
    }
    catch (e) {
        return false;
    }
    return stat.isSymbolicLink();
}
exports.isSymbolicLink = isSymbolicLink;
function isFile(path) {
    path = escapePath(path);
    try {
        var stat = FS.statSync(path);
    }
    catch (e) {
        return false;
    }
    return stat.isFile();
}
exports.isFile = isFile;
function _copy_file(source_file, output_file) {
    createDirectory(Path.dirname(output_file));
    var byteArray = FS.readFileSync(source_file);
    FS.writeFileSync(output_file, byteArray);
}
function _copy_dir(sourceDir, outputDir) {
    createDirectory(outputDir);
    var list = readdirSync(sourceDir);
    list.forEach(function (fileName) {
        copy(Path.join(sourceDir, fileName), Path.join(outputDir, fileName));
    });
}
/**
 * ?????????????????????
 * @param path ???????????????????????????
 */
function remove(path) {
    path = escapePath(path);
    try {
        FS.lstatSync(path).isDirectory()
            ? rmdir(path)
            : FS.unlinkSync(path);
        getDirectoryListing(path);
    }
    catch (e) {
    }
}
exports.remove = remove;
function rmdir(path) {
    var files = [];
    if (FS.existsSync(path)) {
        files = readdirSync(path);
        files.forEach(function (file) {
            var curPath = path + "/" + file;
            if (FS.statSync(curPath).isDirectory()) {
                rmdir(curPath);
            }
            else {
                FS.unlinkSync(curPath);
            }
        });
        FS.rmdirSync(path);
    }
}
function rename(oldPath, newPath) {
    if (isDirectory(oldPath)) {
        FS.renameSync(oldPath, newPath);
    }
}
exports.rename = rename;
/**
 * ??????????????????????????????????????????,?????????????????????????????????????????????
 */
function getDirectory(path) {
    path = escapePath(path);
    return Path.dirname(path) + "/";
}
exports.getDirectory = getDirectory;
/**
 * ????????????????????????,?????????????????????
 */
function getExtension(path) {
    path = escapePath(path);
    var index = path.lastIndexOf(".");
    if (index == -1)
        return "";
    var i = path.lastIndexOf("/");
    if (i > index)
        return "";
    return path.substring(index + 1);
}
exports.getExtension = getExtension;
/**
 * ????????????????????????(???????????????)???????????????
 */
function getFileName(path) {
    if (!path)
        return "";
    path = escapePath(path);
    var startIndex = path.lastIndexOf("/");
    var endIndex;
    if (startIndex > 0 && startIndex == path.length - 1) {
        path = path.substring(0, path.length - 1);
        startIndex = path.lastIndexOf("/");
        endIndex = path.length;
        return path.substring(startIndex + 1, endIndex);
    }
    endIndex = path.lastIndexOf(".");
    if (endIndex == -1 || isDirectory(path))
        endIndex = path.length;
    return path.substring(startIndex + 1, endIndex);
}
exports.getFileName = getFileName;
/**
 * ??????????????????????????????????????????????????????????????????????????????????????????
 * @param path ?????????????????????
 * @param relative ????????????????????????????????????????????????false???????????????????????????
 */
function getDirectoryListing(path, relative) {
    if (relative === void 0) { relative = false; }
    path = escapePath(path);
    try {
        var list = readdirSync(path);
    }
    catch (e) {
        return [];
    }
    var length = list.length;
    if (!relative) {
        for (var i = length - 1; i >= 0; i--) {
            if (list[i].charAt(0) == ".") {
                list.splice(i, 1);
            }
            else {
                list[i] = joinPath(path, list[i]);
            }
        }
    }
    else {
        for (i = length - 1; i >= 0; i--) {
            if (list[i].charAt(0) == ".") {
                list.splice(i, 1);
            }
        }
    }
    return list;
}
exports.getDirectoryListing = getDirectoryListing;
/**
 * ??????????????????????????????????????????????????????????????????
 * @param path
 * @returns {any}
 */
function getDirectoryAllListing(path) {
    var list = [];
    if (isDirectory(path)) {
        var fileList = getDirectoryListing(path);
        for (var key in fileList) {
            list = list.concat(getDirectoryAllListing(fileList[key]));
        }
        return list;
    }
    return [path];
}
exports.getDirectoryAllListing = getDirectoryAllListing;
/**
 * ????????????????????????????????????????????????????????????????????????
 * @param dir ?????????????????????
 * @param extension ???????????????????????????,??????????????????????????????"png"?????????????????????????????????????????????
 */
function search(dir, extension) {
    var list = [];
    try {
        var stat = FS.statSync(dir);
    }
    catch (e) {
        return list;
    }
    if (stat.isDirectory()) {
        findFiles(dir, list, extension, null);
    }
    return list;
}
exports.search = search;
/**
 * ?????????????????????????????????????????????????????????????????????
 * @param dir ?????????????????????
 * @param filterFunc ???????????????filterFunc(file:File):Boolean,???????????????????????????????????????????????????true?????????????????????
 */
function searchByFunction(dir, filterFunc, checkDir) {
    var list = [];
    try {
        var stat = FS.statSync(dir);
    }
    catch (e) {
        return list;
    }
    if (stat.isDirectory()) {
        findFiles(dir, list, "", filterFunc, checkDir);
    }
    return list;
}
exports.searchByFunction = searchByFunction;
function readdirSync(filePath) {
    var files = FS.readdirSync(filePath);
    files.sort();
    return files;
}
function findFiles(filePath, list, extension, filterFunc, checkDir) {
    var files = readdirSync(filePath);
    var length = files.length;
    for (var i = 0; i < length; i++) {
        if (files[i].charAt(0) == ".") {
            continue;
        }
        var path = joinPath(filePath, files[i]);
        var exists_1 = FS.existsSync(path);
        if (!exists_1) {
            continue;
        }
        var stat = FS.statSync(path);
        if (stat.isDirectory()) {
            if (checkDir) {
                if (!filterFunc(path)) {
                    continue;
                }
            }
            findFiles(path, list, extension, filterFunc);
        }
        else if (filterFunc != null) {
            if (filterFunc(path)) {
                list.push(path);
            }
        }
        else if (extension) {
            var len = extension.length;
            if (path.charAt(path.length - len - 1) == "." &&
                path.substr(path.length - len, len).toLowerCase() == extension) {
                list.push(path);
            }
        }
        else {
            list.push(path);
        }
    }
}
/**
 * ?????????????????????????????????????????????
 */
function exists(path) {
    path = escapePath(path);
    return FS.existsSync(path);
}
exports.exists = exists;
/**
 * ?????????????????????Unix???????????????
 */
function escapePath(path) {
    if (!path)
        return "";
    return path.split("\\").join("/");
}
exports.escapePath = escapePath;
/**
 * ????????????,?????????????????????????????????????????????"../"??????????????????????????????????????????Unix?????????
 */
function joinPath(dir) {
    var filename = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        filename[_i - 1] = arguments[_i];
    }
    var path = Path.join.apply(null, arguments);
    path = escapePath(path);
    return path;
}
exports.joinPath = joinPath;
function getRelativePath(dir, filename) {
    var relative = Path.relative(dir, filename);
    return escapePath(relative);
    ;
}
exports.getRelativePath = getRelativePath;
function basename(p, ext) {
    var path = Path.basename.apply(null, arguments);
    path = escapePath(path);
    return path;
}
exports.basename = basename;
//?????????????????? to?????????from?????????
function relative(from, to) {
    var path = Path.relative.apply(null, arguments);
    path = escapePath(path);
    return path;
}
exports.relative = relative;
function getAbsolutePath(path) {
    if (Path.isAbsolute(path)) {
        return escapePath(path);
    }
    return joinPath(Global_1.common.projectDir, path);
}
exports.getAbsolutePath = getAbsolutePath;
function searchPath(searchPaths) {
    for (var _i = 0, searchPaths_1 = searchPaths; _i < searchPaths_1.length; _i++) {
        var searchPath_1 = searchPaths_1[_i];
        if (exists(searchPath_1)) {
            return searchPath_1;
        }
    }
    return null;
}
exports.searchPath = searchPath;
function moveAsync(oldPath, newPath) {
    return new Promise(function (resolve, reject) {
        copy(oldPath, newPath);
        remove(oldPath);
        return resolve();
    });
}
exports.moveAsync = moveAsync;
function existsSync(path) {
    return FS.existsSync(path);
}
exports.existsSync = existsSync;
function existsAsync(path) {
    return new Promise(function (resolve, reject) {
        FS.exists(path, function (isExist) {
            return resolve(isExist);
        });
    });
}
exports.existsAsync = existsAsync;
function copyAsync(src, dest) {
    return new Promise(function (resolve, reject) {
        copy(src, dest);
        return resolve();
    });
}
exports.copyAsync = copyAsync;
function removeAsync(dir) {
    return new Promise(function (resolve, reject) {
        remove(dir);
        return resolve();
    });
}
exports.removeAsync = removeAsync;
function readFileSync(filename, encoding) {
    return FS.readFileSync(filename, encoding);
}
exports.readFileSync = readFileSync;
function readJSONAsync(file, options) {
    return new Promise(function (resolve, reject) {
        FS.readFile(file, options, function (err, data) {
            if (err) {
                return reject(err);
            }
            else {
                try {
                    var retObj = JSON.parse(data);
                    return resolve(retObj);
                }
                catch (err) {
                    return reject(err);
                }
            }
        });
    });
}
exports.readJSONAsync = readJSONAsync;
function readJSONSync(file) {
    var content = readFileSync(file, 'utf-8');
    return JSON.parse(content);
}
exports.readJSONSync = readJSONSync;
function statSync(path) {
    return FS.statSync(path);
}
exports.statSync = statSync;
function writeJSONAsync(file, object) {
    return new Promise(function (resolve, reject) {
        try {
            var retObj = JSON.stringify(object, null, 4);
            FS.writeFile(file, retObj, { encoding: "utf-8" }, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }
        catch (err) {
            return reject(err);
        }
    });
}
exports.writeJSONAsync = writeJSONAsync;
