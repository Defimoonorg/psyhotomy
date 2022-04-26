import 'semantic-ui-css/semantic.min.css'
import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Divider, Form, Input, Loader, Icon, Header, Modal } from 'semantic-ui-react'
import provider from "../provider"
import tokenContract from "../tokenContract"
import saleContract from "../saleContract"
import { useRouter } from "next/router";
import { ethers } from "ethers"

const Index = (props) => {

  const [isMetamask, setIsMetamask] = useState()
  const [amount, setAmount] = useState()
  const [userBalance, setUserBalance] = useState(0)
  const [address, setAddress] = useState("");
  const [raisedTokens, setRaisedTokens] = useState()
  const [raisedBNB, setRaisedBNB] = useState()
  const [tokenName, setTokenName] = useState()
  const [isLoader, setIsLoader] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [payLoader, setPayLoader] = useState(false)
  const [rate, setRate] = useState()
  const [minContrib, setMinContrib] = useState()
  const [maxContrib, setMaxContrib] = useState()
  const [targetAmount, setTargetAmount] = useState()

  const amountRef = useRef();

  const bnbChainId = "0x38";

  const handleConnectWalletClick = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Metamask not detected");
        return;
      }
      let chainId = await ethereum.request({ method: "eth_chainId" });

      if (chainId !== bnbChainId) {
        alert("You are not connected to BNB Smart Chain!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAddress(accounts[0]);

      } catch (error) {
      console.log("Error connecting to metamask", error);
    }


  };

  useEffect(() => {
    if (provider.connection.url === 'metamask') {

      const { provider: ethereum } = provider;
      ethereum.on('accountsChanged', (accounts) => {
        setAddress(accounts[0])
        setUserBalance(0)
        setIsChecked(false)
      })

    }

    console.log(">>>", props.chainId)
  }, [])

  const checkHandler = async () => {
    setIsLoader(true)
    await tokenContract.balanceOf(address)
    .then((bal) => {
      setIsLoader(false)
      bal > 0 ? setUserBalance(bal) : setUserBalance(0)
      setIsChecked(true)
    })
  }

  const handleBuySubmit = async (event) => {
    event.preventDefault()

    let _val = (10**18*amount/rate).toString()

    const signer = await provider.getSigner()
    const contractWithSigner = saleContract.connect(signer)
    const response = await contractWithSigner.buyTokens(address, { value: _val })
    setPayLoader(true)
    await response.wait()
    .then(async ()=> {
      setPayLoader(false)
      setIsPaid(true)
      setRaisedTokens(parseInt(raisedTokens)+parseInt(amount))
      setRaisedBNB(parseFloat(raisedBNB)+amount/rate)
      setIsChecked(false)
    })

  }

  const checkInfoHandler = async () => {

    await tokenContract.name().then((data) => setTokenName(data));
    await saleContract.targetAmount().then((data) => setTargetAmount(parseInt(ethers.utils.formatEther(data))))
    await saleContract.rate().then((data) => setRate(parseInt(ethers.utils.formatUnits(data, 0))))
    await saleContract.minContribution().then((data) => setMinContrib(parseInt(ethers.utils.formatEther(data))+1))
    await saleContract.maxContribution().then((data) =>  setMaxContrib(parseInt(ethers.utils.formatEther(data))))
    await saleContract.raisedBNB().then((data) => setRaisedBNB(ethers.utils.formatEther(data)))
    await saleContract.raisedTokens().then((data) => setRaisedTokens(parseInt(ethers.utils.formatEther(data))))

  }

  return (
  <div style={{ marginTop: 15 }} className="ui centered cards">
    <div className="ui card" style={{ width: "400px" }}>
    <div className="content" ><strong>Sales info</strong></div>
      <div className="content">Target amount: { targetAmount }</div>
      <div className="content">Raised tokens: { raisedTokens } / Raised BNB: { parseFloat(raisedBNB).toFixed(2) }</div>
      <div className="content">Current price: vPSH = { (1/rate).toFixed(6) } BNB</div>
      <div className="content">
        <p>Min amount: { minContrib }</p>
        <p>Max amount: { maxContrib }</p>
      </div>
      <div className="content">Token name: { tokenName }</div>
      <div className="content">
        <Button style={{ width: "370px" }} onClick={ checkInfoHandler }>
          Check info
        </Button>
      </div>
      <div className="content">
        <Form style={{ marginLeft: 35 }} onSubmit={ handleBuySubmit }>
          <div className="ui input">
            <input
              placeholder="Enter amount"
              type="number"
              value={ amount }
              onChange={ (e) => setAmount(e.target.value) }
            />
          </div>
          <Button primary style={{ marginLeft: 15 }} type="submit">
            Buy vPSH
          </Button>
          { payLoader && <Loader style={{ marginLeft: 15 }} size="tiny" active inline /> }
          { !payLoader && isPaid && <Icon style={{ marginLeft: 15 }} color='green' name='check' /> }
        </Form>
      </div>
      <div className="content" style={{ height: "65px" }}>
      { isChecked && !isLoader && <div style={{ textAlign: "center", marginTop: "8px" , fontSize: "16px"}}>{parseInt(ethers.utils.formatEther(userBalance))}</div> }
      { isLoader &&
        <Button style={{ width: "370px" }} loading>
          Loading
        </Button>}
      { !isChecked && !isLoader &&
        <Button
          style={{ width: "370px" }}
          onClick={ checkHandler }>
          Check your balance
        </Button> }
      </div>
      <div className="content">
      <Button
        positive={ !!address }
        primary
        onClick={ handleConnectWalletClick }
        style={{ width: "370px" }}>
        {!address ? "Connect to Wallet" : address}
      </Button>
      </div>
    </div>
  </div>
  )
}

export default Index
