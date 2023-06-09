import React, { useEffect, useState } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import openSeaLogo from "./assets/opean-sea.png";
import { ethers } from "ethers";
import contractAbi from "./utils/contractABI.json";

// Constants
const TWITTER_HANDLE = "SherlockVarm";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPEAN_SEA_LINK = `https://testnets.opensea.io/collection/varm-name-service`;
const tld = ".varm";
const CONTRACT_ADDRESS = "0xc3bfCe34affB6aBbD2C8BBbC0CC90cf0Bf118574";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  // Add some state data propertie
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState("");

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  // Create a function to render if wallet is not connected yet
  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <img
        src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWFkMTU4NzU5ZjFkYjJkMjU5NTg5MjZiZjNkNTg1ZGQ4MTlkMWJlMSZjdD1n/d3mlE7uhX8KFgEmY/giphy.gif"
        width="480"
        height="270"
        alt="Sherlock gif"
      />

      <button
        onClick={connectWallet}
        className="cta-button connect-wallet-button"
      >
        Connect Wallet
      </button>
      <p className="small-subtitle">Get your .varm domain name easy-peasy!!</p>
    </div>
  );

  const renderInputForm = () => {
    return (
      <div className="form-container">
        <div className="first-row">
          <input
            type="text"
            value={domain}
            placeholder="domain"
            onChange={(e) => setDomain(e.target.value)}
          />
          <p className="tld"> {tld} </p>
        </div>

        <input
          type="text"
          value={record}
          placeholder="whats ur super power"
          onChange={(e) => setRecord(e.target.value)}
        />

        <div className="button-container">
          <button
            onClick={mintDomain}
            className="cta-button mint-button"
            disabled={null}
          >
            Mint
          </button>
          {/* <button
            className="cta-button mint-button"
            disabled={null}
            onClick={null}
          >
            Set data
          </button> */}
        </div>
      </div>
    );
  };

  const mintDomain = async () => {
    // Don't run if the domain is empty
    if (!domain || !record) {
      return;
    }
    // Alert the user if the domain is too short
    if (domain.length < 3 || record.length < 5) {
      alert("Domain must be at least 3 characters long");
      return;
    }
    // Calculate price based on length of domain (change this to match your contract)
    // 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
    const price =
      domain.length === 3 ? "0.5" : domain.length === 4 ? "0.3" : "0.1";
    console.log("Minting domain", domain, "with price", price);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractAbi.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let tx = await contract.register(domain, {
          value: ethers.utils.parseEther(price),
        });
        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Check if the transaction was successfully completed
        if (receipt.status === 1) {
          console.log(
            "Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash
          );

          // Set the record for the domain
          tx = await contract.setRecord(domain, record);
          await tx.wait();

          console.log(
            "Record set! https://mumbai.polygonscan.com/tx/" + tx.hash
          );

          setRecord("");
          setDomain("");
        } else {
          alert("Transaction failed! Please try again");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // This runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <header>
            <div className="left">
              <img
                src="https://oliviergimenez.github.io/nimble-workshop/img/programming.gif"
                width="140px"
                height="90px"
              />
              <p className="title">VARM Name Service</p>
              <p className="subtitle">Your immortal API on the blockchain!</p>
            </div>
          </header>
        </div>

        {!currentAccount && renderNotConnectedContainer()}
        {currentAccount && renderInputForm()}

        <div>
          <div className="footer-container">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built with @${TWITTER_HANDLE}`}</a>
          </div>
          <div className="footer-container">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={openSeaLogo}
            />
            <a
              className="footer-text"
              href={OPEAN_SEA_LINK}
              target="_blank"
              rel="noreferrer"
            >{`checkout on OpeanSea @VARM Name Service`}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
