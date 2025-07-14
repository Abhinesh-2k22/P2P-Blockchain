const crypto = require('crypto');

class Transaction {
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
  }
}

class Block {
  constructor(index, timestamp, transactions, prevHash = '', nonce = 0) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.prevHash = prevHash;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto.createHash('sha256')
      .update(this.index + this.prevHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce)
      .digest('hex');
  }

  mineBlock(difficulty) {
    while (!this.hash.startsWith(Array(difficulty + 1).join('0'))) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    // Use a fixed timestamp for all nodes to ensure identical genesis block
    return new Block(0, 1710000000000, [], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions() {
    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.pendingTransactions = [];
    return block;
  }

  addTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  isChainValid(chain = this.chain) {
    // Check genesis block equality
    const genesis = this.createGenesisBlock();
    const otherGenesis = chain[0];
    if (
      genesis.index !== otherGenesis.index ||
      genesis.timestamp !== otherGenesis.timestamp ||
      genesis.prevHash !== otherGenesis.prevHash ||
      JSON.stringify(genesis.transactions) !== JSON.stringify(otherGenesis.transactions) ||
      genesis.hash !== otherGenesis.hash
    ) {
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      const curr = chain[i];
      const prev = chain[i - 1];
      const validHash = crypto.createHash('sha256')
        .update(curr.index + curr.prevHash + curr.timestamp + JSON.stringify(curr.transactions) + curr.nonce)
        .digest('hex');
      if (curr.hash !== validHash || curr.prevHash !== prev.hash) {
        return false;
      }
    }
    return true;
  }

  replaceChain(newChain) {
    if (newChain.length > this.chain.length && this.isChainValid(newChain)) {
      // Deep clone to avoid reference issues
      this.chain = JSON.parse(JSON.stringify(newChain));
      return true;
    }
    return false;
  }
}

module.exports = { Blockchain, Block, Transaction }; 