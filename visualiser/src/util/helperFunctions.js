import BiMap from 'bidirectional-map'

/* Express Helper Functions */
const apiUrl = "http://localhost:8080";

export function addNewRecord() {
    const ttx_hash = "fake hash"
    const time_sent = Date.now().toString()
    const target_addr = Math.random().toString().substring(2, 8)
    const ibis_sender_addr = "ibis_node"
    const receipts = [{
      returner_addr: Math.random().toString().substring(2, 8),
      ibis_receiver_addr: "ibis_node",
      time_returned: Date.now().toString(),
    }]


    fetch(`${apiUrl}/records`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ttx_hash,
        time_sent,
        target_addr,
        ibis_sender_addr,
        receipts
      }),

    }).then(async (response) => {
      const data = await response.json();
      return data.record
    });
  }

export async function fetchRecords() {
  const res = await fetch(`${apiUrl}/records`);
  const data = await res.json();
  console.log("fetched ", data)
  return data.records
}

/* Matrix Helper Functions */
function array(n) { return Array(n).fill(0); }
export function createMatrix(n) { return array(n).map(() => array(n)) }

function addEdge(matrix, i, j) {
  if(matrix[i] === undefined) console.log(`matrix has no i index ${i}`)
	matrix[i][j] = 1
	return matrix
}

function delEdge(matrix, i, j) {
	matrix[i][j] = 0
	return matrix
}



/* TTx Processing */


/*
  Checks the time a TTx was sent into a network vs. when it was received.
  Used as a rough approximation of if the receipt was multi-hop or single hop
*/
function isSingleHopTime(record, receipt) {

}


function isRecentTimestamp(record) {
  let now = Date.now().toString()
  let record_sent_time = record.time_sent
  let diff_ms = now - record_sent_time
  let diff_min = (diff_ms / 60000).toFixed(2)
  console.log(`isRecentTime, time passed: ${now} - ${record_sent_time} = ${diff_min} minutes`)

  //only visualise edges discovered in the last 30s
  if(diff_min > 0.5) return false
  return true;
}


export function processTTxMatrix(biMap, records) {
  let matrix = createMatrix(biMap.size)

  for (let record of records) { 
    // only visualise 'recent' records
    if(!isRecentTimestamp(record)) continue;

    let i = biMap.get(record.target_addr)

    for (let receipt of record.receipts) {
      let j = biMap.get(receipt.returner_addr)
      matrix = addEdge(matrix, i, j)
      console.log(`added edge ${i}->${j} || ${record.target_addr} => ${receipt.returner_addr}`)
    }

  }

  return matrix;
}

export function createNodeMap(records) {
  let biMap = new BiMap()
  for (let record of records) {
    // add target addresses from TTx records
    if(!biMap.has(record.target_addr)) {
      biMap.set(record.target_addr, biMap.size)
      //console.log(`added TARGET ${record.target_addr} to BiMap ${biMap.get(record.target_addr)}`)
    }

    //add recepient address from TTxReceipts
    for(let receipt of record.receipts) {
      if(!biMap.has(receipt.returner_addr)){
        biMap.set(receipt.returner_addr, biMap.size)
        //console.log(`added RECEPIENT ${receipt.returner_addr} to BiMap ${biMap.get(receipt.returner_addr)}`)
      }
    }
  }

  console.log("node index map size:" + biMap.size)
  printBiMap(biMap);
  return biMap;
}

export function printBiMap(biMap) {
  console.log("NODE MAP PRINT")
  for (let entry of biMap.entries()) {
    console.log(`biMap entry: ${entry}`)
  }
}