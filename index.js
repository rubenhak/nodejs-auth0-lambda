const axios = require('axios');

module.exports.DOMAIN = `https://${process.env.AUTH0_TENANT_NAME}.auth0.com`
module.exports.AUDIENCE = `${module.exports.DOMAIN}/api/v2/`;

module.exports.client = function(event) {
    var headers = {};
    var origIP = getOrigIP(event);
    if (origIP) {
        headers['auth0-forwarded-for'] = origIP;
    } else {

    }
    const instance = axios.create({
        headers: headers
    });
    return instance;
}

module.exports.post = function(event, url, postData) {
    var client = module.exports.client(event);
    var fullUrl = `${module.exports.DOMAIN}${url}`;
    return client.post(fullUrl, postData);
}

function getOrigIP(event)
{
    if (!event) {
        return null;
    }
    if (!event.headers) {
        return null;
    }
    return event.headers['X-Forwarded-For'];
}
