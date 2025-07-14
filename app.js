// Simple SHA-256 hash function using SubtleCrypto
async function sha256(str) {
    const buf = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Block structure
  class Block {
    constructor(index, nonce, data, prev) {
      this.index = index;
      this.nonce = nonce;
      this.data = data;
      this.prev = prev;
      this.hash = '';
    }
    async computeHash() {
      this.hash = await sha256(this.index + this.nonce + this.data + this.prev);
      return this.hash;
    }
  }
  
  // Blockchain state
  let blocks = [];
  for (let i = 1; i <= 10; i++) {
    blocks.push(new Block(i, Math.floor(Math.random() * 50000), '', ''));
  }
  blocks[0].prev = '0'.repeat(64);
  
  // Initialize UI
  async function updateUI() {
    for (let i = 1; i <= 10; i++) {
      document.getElementById('nonce' + i).value = blocks[i - 1].nonce;
      document.getElementById('data' + i).value = blocks[i - 1].data;
      document.getElementById('prev' + i).value = blocks[i - 1].prev;
      document.getElementById('hash' + i).value = blocks[i - 1].hash;
    }
  }
  
  // Mining function
  async function mineBlock(idx) {
    const block = blocks[idx - 1];
    block.nonce = parseInt(document.getElementById('nonce' + idx).value, 10) || 0;
    block.data = document.getElementById('data' + idx).value;
    block.prev = idx === 1 ? '0'.repeat(64) : blocks[idx - 2].hash;
    // Simple proof-of-work: find a hash starting with '0000'
    let nonce = block.nonce;
    while (true) {
      block.nonce = nonce;
      const hash = await sha256(block.index + block.nonce + block.data + block.prev);
      if (hash.startsWith('0000')) {
        block.hash = hash;
        break;
      }
      nonce++;
    }
    // Update all subsequent blocks' prev and hash
    for (let i = idx; i < 10; i++) {
      blocks[i].prev = blocks[i - 1].hash;
      blocks[i].hash = await sha256(blocks[i].index + blocks[i].nonce + blocks[i].data + blocks[i].prev);
    }
    await updateUI();
  }
  
  // On input change, update block state and hash
  async function onInput(idx) {
    const block = blocks[idx - 1];
    block.nonce = parseInt(document.getElementById('nonce' + idx).value, 10) || 0;
    block.data = document.getElementById('data' + idx).value;
    block.prev = idx === 1 ? '0'.repeat(64) : blocks[idx - 2].hash;
    block.hash = await sha256(block.index + block.nonce + block.data + block.prev);
    // Update all subsequent blocks' prev and hash
    for (let i = idx; i < 10; i++) {
      blocks[i].prev = blocks[i - 1].hash;
      blocks[i].hash = await sha256(blocks[i].index + blocks[i].nonce + blocks[i].data + blocks[i].prev);
    }
    await updateUI();
  }
  
  // Attach input listeners
  document.addEventListener('DOMContentLoaded', () => {
    for (let i = 1; i <= 10; i++) {
      document.getElementById('nonce' + i).addEventListener('input', () => onInput(i));
      document.getElementById('data' + i).addEventListener('input', () => onInput(i));
    }
  });
  
  // Initial hash calculation and UI update
  document.addEventListener('DOMContentLoaded', async () => {
    blocks[0].hash = await blocks[0].computeHash();
    for (let i = 1; i < 10; i++) {
      blocks[i].prev = blocks[i - 1].hash;
      blocks[i].hash = await blocks[i].computeHash();
    }
    await updateUI();
  });
  
  // Expose mineBlock globally for button onclick
  window.mineBlock = mineBlock;