// Helper to show status
function showStatus(msg, isError = false) {
  const status = document.getElementById('status');
  status.textContent = msg;
  status.className = isError ? 'error' : 'status';
  setTimeout(() => { status.textContent = ''; }, 3000);
}

// Load chain
async function loadChain() {
  const chainList = document.getElementById('chain');
  chainList.innerHTML = '<li>Loading...</li>';
  try {
    const res = await fetch('/chain');
    const chain = await res.json();
    chainList.innerHTML = '';
    chain.forEach(block => {
      const li = document.createElement('li');
      li.className = 'block';
      li.innerHTML = `
        <div class="block-title">Block #${block.index}</div>
        <div><b>Hash:</b> ${block.hash}</div>
        <div><b>Prev:</b> ${block.prevHash}</div>
        <div><b>Nonce:</b> ${block.nonce}</div>
        <div><b>Tx:</b> <pre style="margin:0;">${JSON.stringify(block.transactions, null, 2)}</pre></div>
      `;
      chainList.appendChild(li);
    });
  } catch (e) {
    chainList.innerHTML = '<li class="error">Failed to load chain.</li>';
  }
}

// Add transaction
const txForm = document.getElementById('txForm');
txForm.onsubmit = async (e) => {
  e.preventDefault();
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const amount = document.getElementById('amount').value;
  if (!from || !to || !amount) {
    showStatus('Fill all fields', true);
    return;
  }
  try {
    const res = await fetch('/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, amount })
    });
    const data = await res.json();
    showStatus(data.message);
    txForm.reset();
  } catch (e) {
    showStatus('Failed to add transaction', true);
  }
};

// Mine block
async function mineBlock() {
  showStatus('Mining...');
  try {
    const res = await fetch('/mine');
    const data = await res.json();
    showStatus(data.message);
    loadChain();
  } catch (e) {
    showStatus('Mining failed', true);
  }
}

// Register peer
const peerForm = document.getElementById('peerForm');
peerForm.onsubmit = async (e) => {
  e.preventDefault();
  const peerUrl = document.getElementById('peerUrl').value;
  if (!peerUrl) {
    showStatus('Enter peer URL', true);
    return;
  }
  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peer: peerUrl })
    });
    const data = await res.json();
    showStatus(data.message);
    peerForm.reset();
    loadPeers();
  } catch (e) {
    showStatus('Failed to register peer', true);
  }
};

// Load peers
async function loadPeers() {
  const peersList = document.getElementById('peers');
  peersList.innerHTML = '<li>Loading...</li>';
  try {
    const res = await fetch('/peers');
    const peers = await res.json();
    peersList.innerHTML = '';
    peers.forEach(peer => {
      const li = document.createElement('li');
      li.textContent = peer;
      peersList.appendChild(li);
    });
  } catch (e) {
    peersList.innerHTML = '<li class="error">Failed to load peers.</li>';
  }
}

// Consensus
async function consensus() {
  showStatus('Resolving consensus...');
  try {
    const res = await fetch('/consensus');
    const data = await res.json();
    showStatus(data.message);
    loadChain();
  } catch (e) {
    showStatus('Consensus failed', true);
  }
}

// Initial load
loadChain();
loadPeers(); 