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
    // await client.connect();
    // const shopToyCollection = client.db("toyDB").collection("shopToyCollection");
        // const indexKeys = { toyName: 1 };
    // const indexOptions = { name: "toy" };
    // const result = await toyCollection.createIndex(indexKeys, indexOptions);
    const toyCollection = client.db("toyDB").collection("allToysCollection");
  

    app.get('/allToys', async (req, res) => {
      const cursor = toyCollection.find()
      const allToys = await cursor.toArray();
      res.send(allToys);
    })


    app.get('/shopToys/:text', async (req, res) => {
      const activeTab = req.params.text;
      if (activeTab === 'Marvel' || activeTab === 'DC Comics' || activeTab === 'Transformers') {
        const cursor = toyCollection.find({ category: activeTab })
        const allToys = await cursor.toArray();
        return res.send(allToys);
      }
    })

    app.get('/shopToys/details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query);
      res.send(result);
    })



    app.get('/allToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query);
      res.send(result);
    })


    app.post('/allToys', async (req, res) => {
      const addedToy = req.body;
      const result = await toyCollection.insertOne(addedToy);
      res.send(result);
    })


    app.get('/toySearch/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection.find({
        $or: [
          { toyName: { $regex: searchText, $options: "i" } }
        ],
      }).toArray();
      res.send(result);
    });



    app.get('/myToys/:email', async (req, res) => {
      const email = req.params.email;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      const query = { sellerEmail: email };
      const result = await toyCollection
        .find(query)
        .collation({ locale: 'en_US', numericOrdering: true })
        .sort({ price: sortOrder })
        .toArray();
      res.send(result);
    });



    app.put('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      const option = { upsert: true }
      const updatedDoc = {
        $set: {
          price: updatedToy.price,
          details: updatedToy.details,
          quantity: updatedToy.quantity,
          toyPicture: updatedToy.toyPicture
        }
      };
      const result = await toyCollection.updateOne(filter, updatedDoc, option);
      res.send(result);
    });


    app.delete('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
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



app.get('/', (req, res) => {
  res.send('Server is Running')
})

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
})

