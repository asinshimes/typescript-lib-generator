import utils = require('./lib/utils');
import { Compiler } from './Complier';
import FileUtil = require('./lib/FileUtil');
import path = require('path');
import ts = require("./lib/typescript-plus/lib/typescript");
import { common } from './Global';

const ANY = 'any';
declare var global: any;

class CompileLib {

    private compiler: Compiler;

    public execute(): number {

        var code = 0;
        var currentPlatform: string, currentConfig: string;
        global.registerClass = common.registerClass;
        var outputDir = this.getModuleOutputPath();
        this.compiler = new Compiler();
        global.registerClass = common.registerClass;
        var configurations: any[] = [
            { name: "debug", declaration: true },
            { name: "release", minify: true }
        ];


        FileUtil.clean(outputDir);

        let files = listModuleFiles();
        for (let config of configurations) {

            code = this.buildModule(files, config);
            if (code != 0) {
                return code;
            }
        }
        // break;



        // this.hideInternalMethods();
        return code;
    }

    private buildModule(files: string[], configuration: any) {


        var name = common.registerClass;
        var fileName = name;

        if (configuration.minify) {
            fileName += ".min";
        }


        var singleFile = this.getModuleOutputPath(name, fileName + ".js");
        //var modFile = this.getModuleOutputPath(m.name, fileName + ".mod.js", m.outFile);


        var tss: string[] = [];
        files.forEach((file) => {
            var path: string = file;
            var sourceConfig: string = null;
            var configOK = sourceConfig == null || sourceConfig == configuration.name;
            if (configOK) {
                tss.push(path);
            }
        });
        if (tss.length == 0)
            return 0;
        var dts = configuration.declaration;
        let isPublish = configuration.name != "debug"
        let compileOptions: ts.CompilerOptions = this.compiler.parseTsconfig(common.projectDir, isPublish).options;
        // com
        //make 使用引擎的配置,必须用下面的参数
        compileOptions.declaration = dts;
        compileOptions.out = singleFile;
        compileOptions.emitReflection = true;


        var result = this.compiler.compile(compileOptions, tss);
        if (result.exitStatus != 0) {
            result.messages.forEach(m => console.log(m));
            return result.exitStatus;
        }
        if (configuration.minify) {
            utils.minify(singleFile, singleFile);
        }

        return 0;
    }

    private getModuleOutputPath(m?: string, filePath: string = "", outFile: string = "build/") {
        var path = FileUtil.joinPath(common.projectDir, outFile);
        if (m)
            path += m + '/';
        path += filePath;
        return path;
    }

    //     private hideInternalMethods() {
    //         return;
    //         var tempDts: string[] = [];
    //         global.ignoreDollar = true;
    //         this.dtsFiles.forEach(d => {
    //             var dts = d[0], depends = d[1];
    //             var tempDtsName = dts.replace(/\.d\.ts/, 'd.ts');
    //             var singleFile = dts.replace(/\.d\.ts/, 'd.js');
    //             FileUtil.copy(dts, tempDtsName);
    //             var tss = depends.concat(tempDtsName);
    //             var result = this.compiler.compile({
    //                 args: egret.args,
    //                 def: true,
    //                 out: singleFile,
    //                 files: tss,
    //                 outDir: null
    //             });
    //             if (result.messages && result.messages.length) {
    //                 result.messages.forEach(m => console.log(m));
    //             }
    //             FileUtil.remove(singleFile);
    //             FileUtil.remove(tempDtsName);
    //             tempDts.push(tempDtsName.replace(/\.ts$/, '.d.ts'));
    //         });

    //         this.dtsFiles.forEach(d => {
    //             FileUtil.remove(d[0]);
    //         });

    //         tempDts.forEach(d => {
    //             var dts = d.replace(/d\.d\.ts$/, '.d.ts');
    //             FileUtil.copy(d, dts);
    //             FileUtil.remove(d);
    //         })

    //         global.ignoreDollar = false;
    //     }

}

function listModuleFiles() {
    var tsFiles = FileUtil.search(FileUtil.joinPath(common.projectDir, "/src"), "ts");
    return tsFiles
}







export = CompileLib;