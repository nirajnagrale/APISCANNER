/**
 * The function exports a promise-based method to fetch JSON data from a given URL using the HTTPS
 * module in Node.js.
 * @param url - The URL of the JSON resource that needs to be fetched.
 * @returns The `fetchJSON` function is being exported as part of a module. It returns a Promise that
 * resolves to a JSON object fetched from the specified URL. If there is an error during the fetch or
 * parsing of the JSON, the Promise will be rejected with an error.
 */
const https = require('https');

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (err) {
                    reject(err);
                }
            });
        });
        req.on('error', (err) => {
            reject(err);
        });
        req.end();
    });
}


module.exports = {
    fetchJSON
}
