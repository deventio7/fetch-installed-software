const {execSync} = require('child_process');

module.exports = exports = {
    getAllInstalledSoftwares: getAllInstalledSoftwares
};

Array.prototype.removeFirst = function() {
    this.shift();
    return this;
};

function getWindowsCommandPath() {
    if (process.arch === 'ia32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
        return '%windir%\\sysnative\\cmd.exe /c %windir%\\System32'
    } else {
        return '%windir%\\System32';
    }
}

function getAllInstalledSoftwares() {
    let softwares = [];
    let queryString64 = getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s';
    let queryString32 = getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s';

    let fullList = execSync(queryString32).toString() + execSync(queryString64).toString();
    fullList.split('HKEY_LOCAL_MACHINE').removeFirst().forEach(function (softwareBlock) {
        let softwareObject = {};

        softwareBlock.split(/\r?\n/).removeFirst().forEach(function (infoLine) {
            var infoTokens = infoLine.split(/ +/).removeFirst();
            if (infoTokens[2]) {
                softwareObject[infoTokens[0]] = infoTokens[2];
            }
        });
        softwares.push(softwareObject);
    });

    return softwares;
}