
/**
 * This file contains simulated blockchain functionality.
 * In a real implementation, this would interact with a real blockchain via Web3 or similar.
 */

// Simulated transaction interface
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  data: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// Simulated transaction history store
let transactions: Transaction[] = [];

/**
 * Creates a simulated blockchain transaction
 * @param from Sender address
 * @param data Transaction data
 * @returns Transaction hash
 */
export const createTransaction = async (
  from: string,
  data: string
): Promise<string> => {
  // Generate a random transaction hash
  const hash = `0x${Array.from({length: 64}, () => 
    '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')}`;
  
  // Create a new pending transaction
  const tx: Transaction = {
    hash,
    from,
    to: '0xCORE_PULSE_CONTRACT_ADDRESS',
    data,
    timestamp: Date.now(),
    status: 'pending'
  };
  
  // Add to transaction history
  transactions.push(tx);
  
  // Simulate transaction confirmation delay
  setTimeout(() => {
    const txIndex = transactions.findIndex(t => t.hash === hash);
    if (txIndex >= 0) {
      transactions[txIndex].status = 'confirmed';
      console.log(`Transaction ${hash.slice(0, 10)}... confirmed`);
    }
  }, Math.random() * 3000 + 2000); // Random delay between 2-5 seconds
  
  return hash;
};

/**
 * Get transaction status
 * @param hash Transaction hash
 * @returns Transaction status or null if not found
 */
export const getTransactionStatus = (hash: string): 'pending' | 'confirmed' | 'failed' | null => {
  const tx = transactions.find(t => t.hash === hash);
  return tx ? tx.status : null;
};

/**
 * Get all transactions for an address
 * @param address Blockchain address
 * @returns Array of transactions
 */
export const getTransactions = (address: string): Transaction[] => {
  return transactions.filter(tx => tx.from === address || tx.to === address);
};

/**
 * Encode activity data for blockchain storage
 * @param activityType Type of activity
 * @param metadata Additional data about the activity
 * @returns Encoded data string
 */
export const encodeActivityData = (
  activityType: string,
  metadata: Record<string, any>
): string => {
  // In a real implementation, this would encode data according to smart contract ABI
  return JSON.stringify({
    type: activityType,
    data: metadata,
    timestamp: Date.now()
  });
};
