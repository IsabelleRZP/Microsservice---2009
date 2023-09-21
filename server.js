const express = require('express')
const app = express()
const redis = require("redis");
const host = "127.0.0.1"
const port = 6379; // default Redis port
const clientRedis = redis.createClient(port, host, redis)
app.use(express.json())

let clientes = [
    {
        "nome" : "Isabelle Panico",
    },
    {
        "nome" : "Aluno 1",
    },
];

// vamos simular um problema
const getAllClients = async()=>{
    const time = Math.random() * 10000;
    return new Promise((resolve) =>{
        setTimeout(() =>{
            resolve(clientes)
        }, time)
    })
}

app.post("/", async(req, res)=>{
    // salvar informações
    // console.log("Salvando infos" + req.body);
    clientes.push(req.body)
    
    const chave = "clientes"
    await clientRedis.del(chave);
    res.status(200).send("Salvo com sucesso");
})


app.get("/", async(req, res)=>{
    // configurando cache
    // clientRedis.set("nome", "isabelle");
    const chave = "clientes"

    const clientFromCache = await clientRedis.get(chave);
    if (clientFromCache){
        const objetoCliente = JSON.parse(clientFromCache)
        res.status(200).send(objetoCliente)
        return;
    } 

    // ofensor 
    const clients = await getAllClients();

    try {
        // confisgurar o cache
        await clientRedis.set(chave, JSON.stringify(clients), {EX: 60})
        res.status(200).send(clients);
    } catch (e) {
        res.status(500).send("Ocorreu um erro");
    }
    
})

const startup = async()=>{
    // Conectar o redis
    await clientRedis.connect();
    app.listen(3000, ()=>{
        console.log("Server is running on port 3000")
    })
}

startup();

