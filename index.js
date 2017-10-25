const win32 = require('./win32.js');

module.exports = exports = {
    getAllInstalledSoftwares: getAllInstalledSoftwares,
}

function getAllInstalledSoftwares() {
    var getters = {
        darwin: unimplemented,
        win32: win32.getAllInstalledSoftwares,
        linux: unimplemented,
        freebsd: unimplemented
    };

    return getters[process.platform]();
}

function unimplemented() {
    return [];
}
