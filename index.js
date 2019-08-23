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

module.exports.managementClient = function(event, key, secret) {
    var client = module.exports.client(event);
    var options = {
        method: 'POST',
        url: `${module.exports.DOMAIN}/oauth/token`,
        headers: {'content-type': 'application/json'},
        json: true,
        data: {
          grant_type: 'client_credentials',
          client_id: key,
          client_secret: secret,
          audience: `${module.exports.DOMAIN}/api/v2/`
        }
    };
    return client(options)
        .then(result => {
            return module.exports.client(event, {
                'content-type': 'application/json',
                'Authorization': "Bearer " + result.data.access_token
            });
        })
        .then(axiosClient => wrapManagementClient(axiosClient));
}

function wrapManagementClient(client)
{
    var wrapper = {
        client: client,
        get: (url) => {
            var options = {
                method: 'GET',
                url: `${module.exports.DOMAIN}${url}`
            };
            // console.log("*************************************")
            // console.log("*************************************")
            // console.log(options);
            // console.log("*************************************")
            // console.log("*************************************")
            return client(options)
                .then(result => result.data);
        },
        post: (url, data) => {
            var options = {
                method: 'POST',
                url: `${module.exports.DOMAIN}${url}`,
                data: data
            };
            return client(options)
                .then(result => result.data);
        },
        patch: (url, data) => {
            var options = {
                method: 'PATCH',
                url: `${module.exports.DOMAIN}${url}`,
                data: data
            };
            return client(options)
                .then(result => result.data);
        },
        delete: (url, data) => {
            var options = {
                method: 'DELETE',
                url: `${Index.DOMAIN}${url}`,
                data: data
            };
            return client(options)
                .then(result => result.data);
        }
    }

    wrapper.getUser = (userId) => {
        return wrapper.get(`/api/v2/users/${userId}`);
    }
    wrapper.updateUser = (userId, data) => {
        return wrapper.patch(`/api/v2/users/${userId}`, data);
    }

    return wrapper;
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
