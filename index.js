const win32 = require('./win32.js');

module.exports = exports = {
    getAllInstalledSoftware: getAllInstalledSoftware
};

function getAllInstalledSoftware() {
    var getters = {
        darwin: unimplemented,
        win32: win32.getAllInstalledSoftware,
        linux: unimplemented,
        freebsd: unimplemented
    };

    return getters[process.platform]();
}

function unimplemented() {
    throw {message: 'fetch-installed-software module does not currently support this architecture.'};
}
