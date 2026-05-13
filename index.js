const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require('dotenv')
const cors =require('cors')
dotenv.config()
const uri = process.env.MONGODB_URI;
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 8000;
app.get('/', (req, res) => {
    res.send("Server is running fine!")
})

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      const db = client.db("wanderlust")
      const destinationCollection= db.collection("destinations")

      app.get('/destination', async (req, res) => {
          const result =await destinationCollection.find().toArray()
          res.send(result)
      })

    app.get('/destination/:id', async (req, res) => {
      const id = req.params.id;
      const result = await destinationCollection.findOne({ _id: new ObjectId(id) })
      res.send(result)
    })
      
      app.post('/destination', async (req, res) => {
          const destinationData = req.body
          console.log(destinationData)
          const result =await destinationCollection.insertOne(destinationData)
          res.send(result)
      })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})