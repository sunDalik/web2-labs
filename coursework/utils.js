function removeObjectFromArray(object, array) {
    const index = array.indexOf(object);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

module.exports = {removeObjectFromArray};