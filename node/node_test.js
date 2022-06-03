const util = require("util");
https = require('https');
/*
void https.get('https://kodaktor.ru/appver', (r, b = '') => {
    r.on('data', d => b += d).on('end', () => console.log(b));
});
const newGet = (url, err, value) => {
    https.get(url, (r, b = '') => {
        r.on('data', d => b += d).on('end', value());
    });
};
const test = util.promisify(newGet);
test('https://kodaktor.ru/appver').then(v => console.log(v));
 */

let i = 0;
https.get ('https://kodaktor.ru/lines30k.txt', async r => {
    for await (const d of r) {
        ++i;
    }
    console.log(i);
})