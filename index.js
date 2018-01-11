const win32 = require('./win32.js');

module.exports = exports = {
    getAllInstalledSoftwareSync: getAllInstalledSoftwareSync,
    getAllInstalledSoftware: getAllInstalledSoftware
};

function getAllInstalledSoftware() {
    const getters = {
        darwin: unimplemented,
        win32: win32.getAllInstalledSoftware,
        linux: unimplemented,
        freebsd: unimplemented
    };

    return getters[process.platform]();
}

function getAllInstalledSoftwareSync() {
    const getters = {
        darwin: unimplemented,
        win32: win32.getAllInstalledSoftwareSync,
        linux: unimplemented,
        freebsd: unimplemented
    };

    return getters[process.platform]();
}

function unimplemented() {
    throw new Error('fetch-installed-software module does not currently support this platform.');
}