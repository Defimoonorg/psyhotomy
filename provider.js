import { ethers } from "ethers";

let provider;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  provider = new ethers.providers.Web3Provider(window.ethereum);
} else {
  provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
  // provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
}

export default provider;
