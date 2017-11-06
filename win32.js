const {exec, execSync} = require('child_process');

module.exports = exports = {
    getAllInstalledSoftwareSync: getAllInstalledSoftwareSync,
    getAllInstalledSoftware: getAllInstalledSoftware
};

const MAX_BUFFER_SIZE = 1024 * 5000;

const queryStrings = {
    '32': getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s',
    '64': getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s'
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
    return new Promise ((resolve, reject) => {
        const resolvers = {};
        const rejectors = {};
        const execPromises = {};

        ['32', '64'].forEach(arch => {
            execPromises[arch] = new Promise((execRes, execRej) => {
                resolvers[arch] = execRes;
                rejectors[arch] = execRej;
            });

            exec(queryStrings[arch], {maxBuffer: MAX_BUFFER_SIZE}, (err, stdout, stderr) => {
                if (!err) {
                    resolvers[arch](stdout.toString());
                } else {
                    rejectors[arch](stderr.toString());
                }
            });
        });

        Promise.all([execPromises['32'], execPromises['64']]).then(resultsArray => {
            const fullList = resultsArray[0].trim() + resultsArray[1].trimRight();
            resolve(processCmdOutput(fullList));
        }).catch(error => {
            reject(error);
        });
    })
}

function getAllInstalledSoftwareSync() {
    const fullList = execSync(queryStrings['32']).toString().trim() + execSync(queryStrings['64']).toString().trimRight();
    return processCmdOutput(fullList);
}

function processCmdOutput(fullList) {
    const softwareList = [];
    fullList.split(/^HKEY_LOCAL_MACHINE/m).removeFirst().forEach(softwareBlock => {
        const softwareObject = {};
        let lastKey = '';
        let lastValue = '';

        const softwareLines = softwareBlock.split(/\r?\n/);
        softwareObject['RegistryDirName'] = softwareLines.shift().match(/^(\\[^\\]+)*?\\([^\\]+)\s*$/)[2];
        softwareLines.forEach(infoLine => {
            if (infoLine.trim()) {
                let infoTokens = infoLine.match(/^\s+(.+?)\s+REG_[^ ]+\s*(.*)/);
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