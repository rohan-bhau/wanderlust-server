const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require('dotenv')
const cors =require('cors');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
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

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);

const verifyToken =async (req, res, next) => {
  const authHeader = req?.headers.authorization
  if (!authHeader) {
    return res.status(401).send({message:"Unauthorized"})
  }
  const token = authHeader.split(" ")[1]
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  try {
    const { payload } = await jwtVerify(token, JWKS)
    console.log(payload)
  next();

  } catch (error) {
    return res.status(403).send({message:"Forbidden"})
  }
}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
      // await client.connect();
      const db = client.db("wanderlust")
    const destinationCollection = db.collection("destinations")
    const bookingCollection = db.collection("bookings")

      app.get('/destination', async (req, res) => {
          const result =await destinationCollection.find().toArray()
          res.send(result)
      })

    app.get(
      "/destination/:id",verifyToken,
      async (req, res) => {
        const id = req.params.id;
        const result = await destinationCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      },
    );
      
      app.post('/destination',verifyToken, async (req, res) => {
          const destinationData = req.body
          console.log(destinationData)
          const result =await destinationCollection.insertOne(destinationData)
          res.send(result)
      })

    app.patch('/destination/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      console.log(updatedData)
      const result = await destinationCollection.updateOne(
        {_id: new ObjectId(id)},
        {$set:updatedData}
      )
      res.send(result)
      })

    app.delete('/destination/:id',verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await destinationCollection.deleteOne({_id:new ObjectId(id)})
      res.send(result)
    })

    app.get("/bookings/:userId", async (req, res) => {
      const userId = req.params.userId;
      const result = await bookingCollection.find({ userId: userId }).toArray();
      res.send(result);
    });

    app.post('/bookings',verifyToken, async (req, res) => {
      const bookingData = req.body
      const result = await bookingCollection.insertOne(bookingData)
      res.send(result)
    })
    app.delete("/bookings/:userId",verifyToken, async (req, res) => {
      const userId = req.params.userId;
      const result = await bookingCollection.deleteOne({ _id: new ObjectId(userId) })
      res.send(result)
    });


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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