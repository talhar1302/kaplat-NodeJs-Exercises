import express from "express";

const server = express();
server.use(express.json());

global.TODO = []
global.IdTODO = 1
global.statusOptions = ["ALL","PENDING","LATE","DONE"]


server.get("/todo/health", (req, res) => {
    res.status(200).send("OK");
});



server.post("/todo", (req, res) => {
    if(TODO.some(elem => elem.title === req.body.title))
    {
        res.status(409).send({
            result: "",
            errorMessage: `Error: TODO with the title [${req.body.title}] already exists in the system`
        });
    }

    else if(req.body.dueDate < Date.now())
    {
        res.status(409).send({
            result: "",
            errorMessage: "Error: Can’t create new TODO that its due date is in the past"
        });
    }   
    else
    {
    const newTODO = {
        id: IdTODO++,
        title: req.body.title,
        content: req.body.content,
        dueDate: req.body.dueDate,
        status: "PENDING"
        };
        TODO.push(newTODO)
        res.status(200).send({
            result: newTODO.id,
            errorMessage: ""
        });
    }
});


server.get("/todo/size", (req, res) => {
    if(!statusOptions.includes(req.query.status))
    {
        res.status(400).send({
            result: "",
           errorMessage: "bad request"
       });  
    }

    else if(req.query.status === "ALL")
    {
        res.status(200).send({
            result: TODO.length,
            errorMessage: ""
        });
    }

    else
    {
        let count=0
        TODO.forEach(function(item, index){
                if(item.status === req.query.status)
                {
                    count++
                }
            });         
            res.status(200).send({
                 result: count,
                errorMessage: ""
             });
            
    }
});


server.get("/todo/content", (req, res) => {
    const sortByOptions = ["ID","DUE_DATE","TITLE"]
    let desired_TODO = []
    if(!statusOptions.includes(req.query.status) || (req.query.sortBy && !sortByOptions.includes(req.query.sortBy)))
    {
        res.status(400).send({
            result: "",
           errorMessage: "bad request"
       });  
    }

    else
    {
        if(req.query.status !== "ALL")
        {
        TODO.forEach(function(item, index){    
                if(item.status === req.query.status)
                {
                    desired_TODO.push(item)
                }
            });    
        if(desired_TODO.length === 0 || desired_TODO.length === 1)
            {
             res.status(200).send({
             result: desired_TODO,
            errorMessage: ""
                });
                return;
            }
        }
        else{
            desired_TODO = JSON.parse(JSON.stringify(TODO))
        }

        if(req.query.sortBy)
        {
        switch(req.query.sortBy)
        {
            case "ID":
                desired_TODO = desired_TODO.sort((a, b) => {
                    if (a.id < b.id) {
                      return -1;
                    }
                  });
            break

            case "DUE_DATE":
                desired_TODO = desired_TODO.sort((a, b) => {
                    if (a.dueDate < b.dueDate) {
                      return -1;
                    }
                  });
            break

            default:
                desired_TODO = desired_TODO.sort((a, b) => {
                    if (a.title < b.title) {
                      return -1;
                    }
                  });
        }

        res.status(200).send({
            result: desired_TODO,
           errorMessage: ""
        });
    }

    else
    {
        desired_TODO = desired_TODO.sort((a, b) => {
            if (a.id < b.id) {
              return -1;
            }
          });

          res.status(200).send({
            result: desired_TODO,
           errorMessage: ""
        }); 
    }
    }
});


server.put("/todo", (req, res) => {
    const newStatusOptions = JSON.parse(JSON.stringify(statusOptions))
    newStatusOptions.shift()

    var index = -1
    for(var i=0; i<TODO.length; i++ )
    {
        if(TODO[i].id === parseInt(req.query.id))
        {
            index = i
            break
        }
    }
    if(index === -1)
    {
        res.status(404).send({
            result: "",
           errorMessage: `Error: no such TODO with id ${req.query.id}`
       });  
    }

    else if(!newStatusOptions.includes(req.query.status))
    {
        res.status(400).send({
            result: "",
            errorMessage: "bad request"
       });
    }

    else
    {
        const oldState = TODO[index].status
        TODO[index].status = req.query.status
        res.status(200).send({
            result: oldState,
           errorMessage: ""
        }); 
    }
});



server.delete("/todo", (req, res) => {
    var index = -1
    for(var i=0; i<TODO.length; i++ )
    {
        if(TODO[i].id === parseInt(req.query.id))
        {
            index = i
            break
        }
    }  
    if(index === -1)
    {
        res.status(404).send({
            result: "",
           errorMessage: `Error: no such TODO with id ${req.query.id}`
       });  
    }

    else
    {
        TODO.splice(index,1)
        res.status(200).send({
            result: TODO.length,
           errorMessage: ""
        }); 
    }
});


server.listen(8496 , () => {
    console.log("Server listening on port 8496 ...\n");
});

