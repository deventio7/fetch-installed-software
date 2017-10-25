const {execSync} = require('child_process');

module.exports = exports = {
    getAllInstalledSoftware: getAllInstalledSoftware
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

function getAllInstalledSoftware() {
    var softwareList = [];
    var queryString64 = getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s';
    var queryString32 = getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s';

    var fullList = execSync(queryString32).toString() + execSync(queryString64).toString();
    fullList.split('HKEY_LOCAL_MACHINE').removeFirst().forEach(function (softwareBlock) {
        var softwareObject = {};

        softwareBlock.split(/\r?\n/).removeFirst().forEach(function (infoLine) {
            var infoTokens = infoLine.split(/ +/).removeFirst();
            if (infoTokens[2]) {
                softwareObject[infoTokens[0]] = infoTokens[2];
            }
        });
        softwareList.push(softwareObject);
    });

    return softwareList;
}