process.env.AUTH0_TENANT_NAME="tenant-test";

var Index = require('./index');

var AUTH0_ADMIN_KEY="";
var AUTH0_ADMIN_SECRET="";

return Promise.resolve(Index.managementClient({}, AUTH0_ADMIN_KEY, AUTH0_ADMIN_SECRET))
.then(client => {
    // return client.getUser("");
    // return client.updateUser("", {
    //     "app_metadata": {
    //       "test": "abcd"
    //     }
    // });
})
.then(result => {
    console.log(result);
})
.catch(reason => {
    console.log(reason);

})