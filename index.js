const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aibqdpa.mongodb.net/?retryWrites=true&w=majority`;
const app = express();
// middleware
app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is Running')
})

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
})

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const toyCollection = client.db("toyDB").collection("allToysCollection");


    app.post('/allToys', async (req, res) => {
      const addedToy = req.body;
      const result = await toyCollection.insertOne(addedToy);
      res.send(result);
    })
    app.get('/allToys', async (req, res) => {
      const cursor = toyCollection.find()
      const allToys = await cursor.toArray();
      res.send(allToys);
    })
    app.get('/allToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query);
      res.send(result);
    })


    const indexKeys = {toyName: 1};
    const indexOptions = {name : "toy"};
    const result = await toyCollection.createIndex(indexKeys, indexOptions)
    app.get('/allToys/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection.find({
        $or: [
          { toy : { $regex : searchText, $options : "i" } }
        ],
      }).toArray();
      console.log(result);
      res.send(result) ;

    })





    app.get('/myToys/:email', async (req, res) => {
      const email = req.params.email;
      const query = { sellerEmail: email };
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

