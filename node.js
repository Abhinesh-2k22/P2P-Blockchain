const express = require('express');
const bodyParser = require('body-parser');
const { Blockchain, Transaction } = require('./blockchain');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;
const peers = new Set();
const blockchain = new Blockchain();

// --- Blockchain Endpoints ---

app.get('/chain', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/transaction', (req, res) => {
  const { from, to, amount } = req.body;
  blockchain.addTransaction(new Transaction(from, to, amount));
  res.json({ message: 'Transaction added.' });
});

app.get('/mine', (req, res) => {
  const block = blockchain.minePendingTransactions();
  // Broadcast new chain to peers
  peers.forEach(peer => {
    axios.post(`${peer}/sync`, { chain: blockchain.chain }).catch(() => {});
  });
  res.json({ message: 'Block mined!', block });
});

// --- Peer Discovery & Sync ---

app.post('/register', (req, res) => {
  const { peer } = req.body;
  peers.add(peer);
  res.json({ message: 'Peer registered.' });
});

app.get('/peers', (req, res) => {
  res.json(Array.from(peers));
});

app.post('/sync', (req, res) => {
  const { chain } = req.body;
  if (blockchain.replaceChain(chain)) {
    res.json({ message: 'Chain replaced.' });
  } else {
    res.json({ message: 'Received chain rejected.' });
  }
});

// --- Consensus ---

app.get('/consensus', async (req, res) => {
  let maxLength = blockchain.chain.length;
  let newChain = null;

  for (let peer of peers) {
    try {
      const response = await axios.get(`${peer}/chain`);
      if (response.data.length > maxLength && blockchain.isChainValid(response.data)) {
        maxLength = response.data.length;
        newChain = response.data;
      }
    } catch (e) {}
  }

  if (newChain) {
    blockchain.replaceChain(newChain);
    res.json({ message: 'Chain replaced by consensus.' });
  } else {
    res.json({ message: 'Current chain is already the longest.' });
  }
});

// --- Serve HTML UI ---
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// --- Start Server ---

app.listen(PORT, () => {
  console.log(`Node running on port ${PORT}`);
  console.log('Use /register to add peers.');
}); 