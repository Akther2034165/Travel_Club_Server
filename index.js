const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nv4mo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();

    const database = client.db("travel-club");
    const tourspotsCollection = database.collection("tourspots");
    const ordersCollection = database.collection("orders");
    //post spots
    app.post("/tourspots", (req, res) => {
      tourspotsCollection.insertOne(req.body).then((result) => {
        res.json(result.insertedId);
      });
    });
    //get all tourist spots
    app.get("/tourspots", async (req, res) => {
      const cursor = tourspotsCollection.find({});
      const tourspots = await cursor.toArray();
      res.json(tourspots);
    });
    //get single spots
    app.get("/tourspots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const tourspot = await tourspotsCollection.findOne(query);
      res.json(tourspot);
    });

    //order
    app.post("/addtocart", (req, res) => {
      ordersCollection.insertOne(req.body).then((result) => {
        res.send(result);
      });
    });
    // get my order
    app.get("/myOrder/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await ordersCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });
    //all order
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.json(result);
    });
    //delete order
    app.delete("/orders/:id", async (req, res) => {
      console.log(req.params.id);
      const result = await ordersCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });

    //update status pending
    app.put("/orders/:id", async (req, res) => {
      const updatedInfo = req.body;
      const result = await ordersCollection.updateOne(
        {
          _id: ObjectId(req.params.id),
        },
        {
          $set: {
            status: updatedInfo.status,
          },
        }
      );
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("server is running");
});
app.listen(port, () => {
  console.log("server is running on port", port);
});
