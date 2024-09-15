import axios from 'axios';

async function clientReq() {
    try {
        
        let resGet = await axios.get('http://localhost:9285/todo/health')
        console.log("Got response: " + resGet.status);
        console.log("Response: %j" , resGet.data);
        
        const resPost = await axios.post("http://localhost:9285/todo", {
            title: "A",    
            content: "Tennis",
            dueDate: Date.now() + 700
          })
        console.log("Got response: " + resPost.status);
        console.log("Response: %j" , resPost.data);
        
            
        resGet = await axios.get('http://localhost:9285/todo/size?status=ALL')
        console.log("Got response: " + resGet.status);
        console.log("Response: %j" , resGet.data);  
        

        resGet = await axios.get('http://localhost:9285/todo/content?status=ALL&sortBy=TITLE')
        console.log("Got response: " + resGet.status);
        console.log("Response: %j" , resGet.data);

        
        const resPut = await axios.put(`http://localhost:9285/todo?id=1&status=DONE`)
        console.log("Got response: " + resPut.status);
        console.log("Response: %j" , resPut.data);
          
        /*
        const resDelete = await axios.delete(`http://localhost:9285/todo?id=1`)
        console.log("Got response: " + resDelete.status);
        console.log("Response: %j" , resDelete.data);
       */

    } catch (error) {
        console.log(error)
    }      
}
clientReq()

  