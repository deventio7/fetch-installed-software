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

    var fullList = execSync(queryString32).toString().trim() + execSync(queryString64).toString().trimRight();

    fullList.split(/^HKEY_LOCAL_MACHINE/m).removeFirst().forEach(function (softwareBlock, i) {
        var softwareObject = {};
        var lastKey = '';
        var lastValue = '';

        var softwareLines = softwareBlock.split(/\r?\n/);
        softwareObject['RegistryDirName'] = softwareLines.shift().match(/^(\\[^\\]+)*?\\([^\\]+)\s*$/)[2];
        softwareLines.forEach(function (infoLine) {
            if (infoLine.trim()) {
                var infoTokens = infoLine.match(/^\s+(.+?)\s+REG_[^ ]+\s*(.*)/);
                if (infoTokens) {
                    infoTokens = infoTokens.removeFirst();
                    lastKey = infoTokens[0];
                    lastValue = infoTokens[1];
                } else {
                    lastValue = lastValue + '\n' + infoLine;
                }
                softwareObject[lastKey] = lastValue;
            }
        });
        softwareList.push(softwareObject);
    });
    return softwareList;
}