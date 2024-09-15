import express from "express";
import winston from "winston";

const { createLogger, format, transports, level } = winston;

// Define the log levels
const LOG_LEVELS = {
  INFO: 'info',
  DEBUG: 'debug',
  ERROR: 'error',
};

// Initialize request counter
global.requestCounter = 0;

// Define a custom log format
const customFormat = format.printf(({ level, message }) => {

  // Get the current date and time
const dateTime = new Date();
const formattedDate = dateTime.getDate().toString().padStart(2, '0');
const formattedMonth = (dateTime.getMonth() + 1).toString().padStart(2, '0');
const formattedYear = dateTime.getFullYear().toString();
const formattedHours = dateTime.getHours().toString().padStart(2, '0');
const formattedMinutes = dateTime.getMinutes().toString().padStart(2, '0');
const formattedSeconds = dateTime.getSeconds().toString().padStart(2, '0');
const formattedMilliseconds = dateTime.getMilliseconds().toString().padStart(3, '0');

const formattedDateTime = `${formattedDate}-${formattedMonth}-${formattedYear} ${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;

  // Format the log line
  return `${formattedDateTime} ${level.toUpperCase()}: ${message} | request #${requestCounter}`;
});

// Create a logger instance
const Requests_Logger = createLogger({
  level: 'info',
  loggerName: 'request-logger',
  format: customFormat,
  transports: [
    new transports.File({ filename: 'logs/requests.log',  options: { flags: 'w' } }),
    new transports.Console(),
  ],
});

const TODO_logger = createLogger({
    level: 'info',
    loggerName: 'todo-logger',
    format: customFormat,
    transports: [
      new transports.File({ filename: 'logs/todos.log' ,  options: { flags: 'w' }}),
    ],
  });


const server = express();
server.use(express.json());

global.TODO = []
global.IdTODO = 1
global.statusOptions = ["ALL","PENDING","LATE","DONE"]


server.get("/logs/level", (req, res) => {
    let start = Date.now();
    requestCounter++
    //Log
    Requests_Logger.log(LOG_LEVELS.INFO, `Incoming request | #${requestCounter} | resource: /logs/level | HTTP Verb GET`);

    const logger_name = req.query["logger-name"]
    if(logger_name != "request-logger" && logger_name != "todo-logger")
        res.send("The logger's name is not acceptable");
    else
    {
        let logger_level
        if(logger_name == "request-logger")
         logger_level = Requests_Logger.level
        else
         logger_level = TODO_logger.level

        res.send(logger_level);   
    }

    //Log
    if(Requests_Logger.level == "debug")
    Requests_Logger.log(LOG_LEVELS.DEBUG, `request #${requestCounter} duration: ${Date.now() - start}ms`);
});


server.put("/logs/level", (req, res) => {
    let start = Date.now();
    requestCounter++
    //Log
    Requests_Logger.log(LOG_LEVELS.INFO, `Incoming request | #${requestCounter} | resource: /logs/level | HTTP Verb PUT`);

    const logger_name = req.query["logger-name"]
    if(logger_name != "request-logger" && logger_name != "todo-logger")
        res.send("The logger's name is not acceptable");
    else
    {
        const logger_level = req.query["logger-level"]
        if(logger_level != "ERROR" && logger_level != "INFO" && logger_level != "DEBUG")
         res.send("The logger's level is not acceptable");
        else
        {
            if(logger_name == "request-logger")
            Requests_Logger.level = logger_level.toLowerCase()
            else
            TODO_logger.level = logger_level.toLowerCase()
            res.send(logger_level);
        }
    }
    if(Requests_Logger.level == "debug")
    Requests_Logger.log(LOG_LEVELS.DEBUG, `request #${requestCounter} duration: ${Date.now() - start}ms`);
});


server.get("/todo/health", (req, res) => {
    let start = Date.now();
    requestCounter++
    //Log
    Requests_Logger.log(LOG_LEVELS.INFO, `Incoming request | #${requestCounter} | resource: /todo/health | HTTP Verb GET`);

    res.status(200).send("OK");

    //Log
    if(Requests_Logger.level == "debug")
    Requests_Logger.log(LOG_LEVELS.DEBUG, `request #${requestCounter} duration: ${Date.now() - start}ms`);
});



server.post("/todo", (req, res) => {
    let start = Date.now();
    requestCounter++
    //Log
    Requests_Logger.log(LOG_LEVELS.INFO, `Incoming request | #${requestCounter} | resource: /todo | HTTP Verb POST`);

    if(TODO.some(elem => elem.title === req.body.title))
    {
        let error_Message = `Error: TODO with the title [${req.body.title}] already exists in the system`
        res.status(409).send({
            result: "",
            errorMessage: error_Message
        });
        //Log
        TODO_logger.log(LOG_LEVELS.ERROR, `${error_Message}`);
    }

    else if(req.body.dueDate < Date.now())
    {
        let error_Message = "Error: Can’t create new TODO that its due date is in the past"
        res.status(409).send({
            result: "",
            errorMessage: error_Message
        });
        //Log
        TODO_logger.log(LOG_LEVELS.ERROR, `${error_Message}`);
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

        //Logs
        TODO_logger.log(LOG_LEVELS.INFO, `Creating new TODO with Title [${newTODO.title}]`);
        if(TODO_logger.level == "debug")
        TODO_logger.log(LOG_LEVELS.DEBUG, `Currently there are ${newTODO.id-1} TODOs in the system. New TODO will be assigned with id ${newTODO.id}`);
    }

    //Log
    if(Requests_Logger.level == "debug")
    Requests_Logger.log(LOG_LEVELS.DEBUG, `request #${requestCounter} duration: ${Date.now() - start}ms`);
});


server.get("/todo/size", (req, res) => {
    let start = Date.now();
    requestCounter++
    //Log
    Requests_Logger.log(LOG_LEVELS.INFO, `Incoming request | #${requestCounter} | resource: /todo/size | HTTP Verb GET`);

    let num_totos_for_log
    if(!statusOptions.includes(req.query.status))
    {
        res.status(400).send({
            result: "",
           errorMessage: "bad request"
       });  
    }

    else if(req.query.status === "ALL")
    {
        num_totos_for_log = TODO.length
        res.status(200).send({
            result: num_totos_for_log,
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
             num_totos_for_log = count 
    }
    //Logs
    TODO_logger.log(LOG_LEVELS.INFO, `Total TODOs count for state ${req.query.status} is ${num_totos_for_log}`);
    if(Requests_Logger.level == "debug")
    Requests_Logger.log(LOG_LEVELS.DEBUG, `request #${requestCounter} duration: ${Date.now() - start}ms`);
});


server.get("/todo/content", (req, res) => {
    let start = Date.now();
    requestCounter++
    //Log
    Requests_Logger.log(LOG_LEVELS.INFO, `Incoming request | #${requestCounter} | resource: /todo/content | HTTP Verb GET`);

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
        //Log
        TODO_logger.log(LOG_LEVELS.INFO, `Extracting todos content. Filter: ${req.query.status} | Sorting by: ${req.query.sortBy}`);
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
        //Log
        TODO_logger.log(LOG_LEVELS.INFO, `Extracting todos content. Filter: ${req.query.status} | Sorting by: ID`);
    }
    
    }

    //Logs
    if(TODO_logger.level == "debug")
    TODO_logger.log(LOG_LEVELS.DEBUG, `There are a total of ${TODO.length} todos in the system. The result holds ${desired_TODO.length} todos`);
    if(Requests_Logger.level == "debug")
    Requests_Logger.log(LOG_LEVELS.DEBUG, `request #${requestCounter} duration: ${Date.now() - start}ms`);
});


server.put("/todo", (req, res) => {
    let start = Date.now();
    requestCounter++
    //Logs
    Requests_Logger.log(LOG_LEVELS.INFO, `Incoming request | #${requestCounter} | resource: /todo | HTTP Verb PUT`);
    TODO_logger.log(LOG_LEVELS.INFO, `Update TODO id [${req.query.id}] state to ${req.query.status}`);

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
        let error_Message = `Error: no such TODO with id ${req.query.id}`
        res.status(404).send({
            result: "",
           errorMessage: error_Message
       });  
       //Log
       TODO_logger.log(LOG_LEVELS.ERROR, `${error_Message}`);
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

    //Log
    if(TODO_logger.level == "debug")
    TODO_logger.log(LOG_LEVELS.DEBUG, `Todo id [${req.query.id}] state change: ${oldState} --> ${req.query.status}`);
    }

    //Log
    if(Requests_Logger.level == "debug")
    Requests_Logger.log(LOG_LEVELS.DEBUG, `request #${requestCounter} duration: ${Date.now() - start}ms`);
});



server.delete("/todo", (req, res) => {
    let start = Date.now();
    requestCounter++
    //Log
    Requests_Logger.log(LOG_LEVELS.INFO, `Incoming request | #${requestCounter} | resource: /todo | HTTP Verb DELETE`);

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
        let error_Message = `Error: no such TODO with id ${req.query.id}`
        res.status(404).send({
            result: "",
           errorMessage: error_Message
       });  
       //Log
       TODO_logger.log(LOG_LEVELS.ERROR, `${error_Message}`);
    }

    else
    {
        TODO.splice(index,1)
        res.status(200).send({
            result: TODO.length,
           errorMessage: ""
        }); 
        //Logs
        TODO_logger.log(LOG_LEVELS.INFO, `Removing todo id ${req.query.id}`);
        if(TODO_logger.level == "debug")
        TODO_logger.log(LOG_LEVELS.DEBUG, `After removing todo id [${req.query.id}] there are ${TODO.length} TODOs in the system`);

    }

    //Log
    if(Requests_Logger.level == "debug")
    Requests_Logger.log(LOG_LEVELS.DEBUG, `request #${requestCounter} duration: ${Date.now() - start}ms`);
});


server.listen(9285 , () => {
    console.log("Server listening on port 9285 ...\n");
});

