import axios from 'axios';

async function clientReq() {
    try {
        const resGet = await axios.get('http://localhost:8989/test_get_method?id=208754622&year=1998')
        console.log("Got response: " + resGet.status);
        console.log("Response: %j" , resGet.data);


        const resPost = await axios.post("http://localhost:8989/test_post_method", {
            id: 208754622,    
            year: 1998,
            requestId: resGet.data
          })
        console.log("Got response: " + resPost.status);
        console.log("Response: %j" , resPost.data);

        
        const subId = (208754622 - 294234) % 34
        const subYear = (1998 + 94) % 13
        const resPut = await axios.put(`http://localhost:8989/test_put_method?id=${resPost.data.message}`, {
                id: subId,    
	            year: subYear
        })
        console.log("Got response: " + resPut.status);
        console.log("Response: %j" , resPut.data);


        const resDelete = await axios.delete(`http://localhost:8989/test_delete_method?id=${resPut.data.message}`)
        console.log("Got response: " + resDelete.status);
        console.log("Response: %j" , resDelete.data);

    } catch (error) {
        console.log(error)
    }      
}
clientReq()


/*
const resGet = axios.get("http://localhost:8989/test_get_method?id=208754622&year=1998")
const resGetData = resGet.then((response) => response.data)
resGet.then((response) => {
    console.log("Got response: " + response.status);
    console.log("Response: %j" , response.data);   
  })
  .catch((err) => console.log(err));


const resPost = axios.post("http://localhost:8989/test_post_method", {
    id: 208754622,    
	year: 1998,
	requestId: resGetData
  })
const resPostData = resPost.then((response) => response.data)
resPost.then((response) => {
        console.log("Got response: " + response.status);
        console.log("Response: %j" , response.data);   
      })
      .catch((err) => console.log(err));

  const subId = (208754622 - 294234) % 34
  const subYear = (1998 + 94) % 13

  const resPut = axios.put(`http://localhost:8989/test_put_method?id=${resPostData.message}`, {
    id: subId,    
	year: subYear
})
const resPutData = resPut.then((response) => response.data)
resPut.then((response) => {
    console.log("Got response: " + response.status);
    console.log("Response: %j" , response.data);   
  })
  .catch((err) => console.log(err));

*/
/*// Importing https module
const http = require('http');
  
// Setting the configuration for
// the request
const options = {
    host: 'localhost',
    port: 8989,
    path: '/test_get_method?id=123456789&year=2022',
    method: 'GET'
  };
    
// Sending the request
http.get(options, function(res) {
    console.log("Got response: " + res.statusCode);
  
    res.on("data", function(chunk) {
      console.log("BODY: " + chunk);
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });*/

  