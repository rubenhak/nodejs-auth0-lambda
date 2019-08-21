const axios = require('axios');

module.exports.DOMAIN = `https://${process.env.AUTH0_TENANT_NAME}.auth0.com`
module.exports.AUDIENCE = `${module.exports.DOMAIN}/api/v2/`;

module.exports.client = function(event, extraHeaders) {
    var headers = extraHeaders || {};
    var origIP = getOrigIP(event);
    if (origIP) {
        headers['auth0-forwarded-for'] = origIP;
    }
    const instance = axios.create({
        headers: headers
    });
    return instance;
}

module.exports.clientAuth = function(event) {
    var extraHeaders = {};
    if (event.headers.Authorization) {
        extraHeaders.Authorization =  `Bearer ${event.headers.Authorization}`;
    }
    return module.exports.client(event, extraHeaders)
}

module.exports.post = function(event, url, postData) {
    var client = module.exports.client(event);
    var fullUrl = `${module.exports.DOMAIN}${url}`;
    return client.post(fullUrl, postData);
}

module.exports.getAuth = function(event, url) {
    var client = module.exports.clientAuth(event);
    var fullUrl = `${module.exports.DOMAIN}${url}`;
    return client.get(fullUrl);
}

module.exports.postAuth = function(event, url, postData) {
    var client = module.exports.clientAuth(event);
    var fullUrl = `${module.exports.DOMAIN}${url}`;
    return client.post(fullUrl, postData);
}

module.exports.getUserInfo = function(event) {
    return module.exports.getAuth(event, '/userinfo');
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
