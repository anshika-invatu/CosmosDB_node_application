//@ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient

const express = require('express'); //
const app = express(); //
const port = process.env.PORT || 3000; //

const config = require('./config')

const url = require('url')

const endpoint = config.endpoint
const key = config.key

//const databaseId = config.database.id
//const containerId = config.container.id
//const partitionKey = { kind: 'Hash', paths: ['/partitionKey'] }

const options = {
      endpoint: endpoint,
      key: key,
      userAgentSuffix: 'CosmosDBJavascriptQuickstart'
    };

// cosmosDB connection    
const client = new CosmosClient(options)

// Middleware
app.use(express.json()); 

// Routes
app.get('/api/items', async (req, res) => {
  const container = client.database('ToDoList').container('Items');
  const { resources } = await container.items.readAll().fetchAll();
  res.json(resources);
});

app.get('/api/items/:id/:partitionKey', async (req, res) => {
  const container = client.database('ToDoList').container('Items');
  const itemId = req.params.id;
  const partitionKey = req.params.partitionKey;

  try {
    const { resource } = await container.item(itemId,partitionKey).read();
    if (resource) {
      res.json(resource);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error retrieving item by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/items', async (req, res) => {
  const container = client.database('ToDoList').container('Items');
  const newItem = req.body;
  const { resource } = await container.items.create(newItem);
  res.json(resource);
});

app.put('/api/items/:id', async (req, res) => {
  const container = client.database('ToDoList').container('Items');
  const itemId = req.params.id;
  const updatedItem = req.body;
  const { resource } = await container.item(itemId).replace(updatedItem);
  res.json({status:200,Message:"successfull Updated",result:resource});
});

app.delete('/api/items/:id/:partitionKey', async (req, res) => {
  const container = client.database('ToDoList').container('Items');
  const itemId = req.params.id;
  const partitionKey = req.params.partitionKey;

  try {
    console.log('Deleting item with ID:', itemId);
    await container.item(itemId, partitionKey).delete();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);

    if (error.code === 404) {
      res.status(404).json({ message: 'Item not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// server Start
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




