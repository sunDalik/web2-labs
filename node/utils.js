function removeObjectFromArray(object, array) {
    const index = array.indexOf(object);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

function getRandomString(len) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let string = "";
    for (let i = 0; i < len; i++) {
        string += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return string;
}

module.exports = {removeObjectFromArray, getRandomString};