import { common } from './Global';
import file = require('./lib/FileUtil');
import CompileLib = require('./Make');


var args;

function parseArgs() {
    var i = 0;
    var commands = [];
    var options: any = {};
    var args = process.argv.concat();
    args.splice(0, 2);
    while (i < args.length) {
        var s = args[i++];
        if (s.charAt(0) === '-') {
            s = s.slice(s.charAt(1) === '-' ? 2 : 1).toLowerCase();
            if (!args[i] || args[i].charAt(0) == '-') {
                options[s] = true;
            }
            else {
                options[s] = args[i++] || "";
            }
        }
        else {
            commands.push(s);
        }
    }
    if (commands.length > 0) {
        options.command = commands[0];
        if (commands.length > 1 && file.isDirectory(commands[1])) {
            options.projectDir = commands[1];
        }
    }
    if (options.projectDir == null) {
        options.projectDir = process.cwd();
    }
    else {
        var absPath = file.joinPath(process.cwd(), options.projectDir);
        if (file.isDirectory(absPath)) {
            options.projectDir = absPath;
        }
    }
    options.projectDir = file.joinPath(options.projectDir, "/");
    return options;
}


function entry() {
    args = parseArgs();
    let target = args.path ?? process.argv[0]
    common.projectDir = target
    common.registerClass = args.command
    if (!common.registerClass) {
        console.log("请输入一个包名\n 正确使用方式 包名 --path 包路径")
        return

    }

    return new CompileLib().execute()



}


entry();
