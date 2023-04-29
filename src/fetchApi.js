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
