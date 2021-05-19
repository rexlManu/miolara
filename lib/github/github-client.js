var fetch = require('node-fetch');

const URL = 'https://api.github.com/';

class GithubClient {
 constructor(token) {
  this.token = token;
 }

 request(method, endpoint, data) {
  return new Promise((resolve, reject) => {
   var options = {
    method,
    headers: {
     Accept: 'application/json',
     Authorization: `token ${this.token}`,
    },
   };
   if (method != 'get') options.body = JSON.stringify(data);
   fetch(URL + endpoint, options)
    .then(response => resolve(response.json()))
    .catch(err => reject(err));
  });
 }

 get(endpoint) {
  return this.request('get', endpoint, {});
 }

 post(endpoint, data) {
  return this.request('post', endpoint, data);
 }
}

module.exports = GithubClient;
