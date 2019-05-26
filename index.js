const axios = require('axios');

module.exports.DOMAIN = `https://${process.env.AUTH0_TENANT_NAME}.auth0.com`
module.exports.AUDIENCE = `${module.exports.DOMAIN}/api/v2/`;

module.exports.client = function(context) {
    var headers = {};
    var origIP = getOrigIP(context);
    if (origIP) {
        headers['auth0-forwarded-for'] = origIP;
    } else {

    }
    const instance = axios.create({
        headers: headers
    });
    return instance;
}

module.exports.post = function(context, url, postData) {
    var client = module.exports.client(context);
    var fullUrl = `${module.exports.DOMAIN}${url}`;
    return client.post(fullUrl, postData);
}

function getOrigIP(context)
{
    if (!context) {
        return null;
    }
    if (!context.headers) {
        return null;
    }
    return context.headers['X-Forwarded-For'];
}
