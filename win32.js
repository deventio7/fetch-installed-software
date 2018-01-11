const { exec, execSync } = require('child_process');

const MAX_BUFFER_SIZE = 1024 * 5000;

const getQueryStringArray = () => {
    switch(process.arch) {
        case 'x64': return [
            getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s',
            getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s'
        ];
        default: return [
            getWindowsCommandPath() + '\\REG QUERY HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\ /s'
        ];
    }
};

Array.prototype.removeFirst = function() {
    this.shift();
    return this;
};

const getWindowsCommandPath = () => {
    if (process.arch === 'ia32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
        return '%windir%\\sysnative\\cmd.exe /c %windir%\\System32'
    } else {
        return '%windir%\\System32';
    }
};

const getAllInstalledSoftware = () => {
    return new Promise ((resolve, reject) => {
        const resolvers = [];
        const rejectors = [];
        const execPromises = [];

        getQueryStringArray().forEach((queryString, index) => {
            execPromises.push(new Promise((execRes, execRej) => {
                resolvers.push(execRes);
                rejectors.push(execRej);
            }));

            exec(queryString, {maxBuffer: MAX_BUFFER_SIZE}, (err, stdout, stderr) => {
                if (!err) {
                    resolvers[index](stdout.toString());
                } else {
                    rejectors[index](stderr.toString());
                }
            });
        });

        Promise.all(execPromises).then(resultsArray => {
            const fullList = resultsArray.slice(1).reduce((accumulatingList, queryResult) => {
                return accumulatingList + queryResult.trimRight();
            }, resultsArray[0].trim());
            resolve(processCmdOutput(fullList));
        }).catch(error => {
            reject(error);
        });
    })
};

const getAllInstalledSoftwareSync = () => {
    const resultsArray = getQueryStringArray().map((queryString) => {
        return execSync(queryString).toString();
    });
    const fullList = resultsArray.slice(1).reduce((accumulatingList, queryResult) => {
        return accumulatingList + queryResult.trimRight();
    }, resultsArray[0].trim());
    return processCmdOutput(fullList);
};

const processCmdOutput = (fullList) => {
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
};

module.exports = exports = {
    getAllInstalledSoftwareSync: getAllInstalledSoftwareSync,
    getAllInstalledSoftware: getAllInstalledSoftware
};