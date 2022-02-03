import "./styles/cms.scss";
import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  Button,
} from "reactstrap";

import { FormControl, Modal, Form, InputGroup } from "react-bootstrap";

import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { getLibrary, connectorsByName, resetWalletConnector } from './utils/web3React';
import LacedameonContract from './Lacedameon.json';
import { useContract, useContractCallData } from "./utils/hooks";
import { ethers, utils } from "ethers";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory
} from "react-router-dom";
import WalletAddrList from "./WalletAddrList";
import ContractContext from "./context/contract";

function App() {
  const [contract, setContract] = useState(null);
  const value = { contract, setContract };
  return (
    <ContractContext.Provider value={value}>
      <Router>
        <Switch>
          <Route exact path="/">
            <Web3ReactProvider getLibrary={getLibrary}>
              <CmsComponent />
            </Web3ReactProvider>
          </Route>
          <Route exact path="/whitelist">
            <Web3ReactProvider getLibrary={getLibrary}>
              <WalletAddrList contract={contract} type="white" />
            </Web3ReactProvider>
          </Route>
          <Route exact path="/winnerlist">
            <Web3ReactProvider getLibrary={getLibrary}>
              <WalletAddrList contract={contract} type="winner" />
            </Web3ReactProvider>
          </Route>
        </Switch>
      </Router>
    </ContractContext.Provider>
  )
}

function CmsComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [walletConnectionModalShow, setWallectConnectionModalShow] = useState(false);
  const [walletConnectInfoModalShow, setWalletConnectInfoModalShow] = useState(false);
  const [networkChangeModalShow, setNetworkChangeModalShow] = useState(false);
  const [installMetamaskModalShow, setInstallMetamaskModalShow] = useState(false);
  const [errorModalShow, setErrorModalShow] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  // const [visible, setVisible] = useState(false);
  const [confirmWallet, setConfirmWallet] = useState("");
  const [whitelistResult, setWhitelistResult] = useState(null);
  const [walletAddr, setWalletAddr] = useState("");
  const [multipleWhitelist, setMultipleWhitelist] = useState([]);
  const [winnerAmount, setWinnerAmount] = useState(0);
  const [winnerWalletAddr, setWinnerWalletAddr] = useState(null);
  const [winnerlistResult, setWinnerlistResult] = useState(null);
  const { account, library, activate, deactivate, chainId } = useWeb3React();

  const toggle = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // useEffect(() => {
  //   window.addEventListener("scroll", handleScroll);
  // });

  // const handleScroll = () => {
  //   if (window.scrollY > 90) {
  //     setSticky(true);
  //   } else if (window.scrollY < 90) {
  //     setSticky(false);
  //   }
  // };

  const connectWallet = () => {
    setWallectConnectionModalShow(true);
  };

  const disconnectWallet = () => {
    // setVisible(false);
    activate(null);
  };

  useEffect(() => {
    let walletAddress = "";
    if (account !== undefined) {
      walletAddress = account
      setWalletAddr(
        walletAddress.substr(0, 6) + " ... " + walletAddress.substr(-4)
      );
    }
    else walletAddress = ""
  }, [account]);

  const { contract, setContract } = useContext(ContractContext);

  const [maxTokenNumber, setMaxTokenNumber] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);


  useEffect(() => {
    console.log('chainId', chainId);
    console.log('LacedameonContract.networks', LacedameonContract.networks);
    if (chainId && LacedameonContract.networks && LacedameonContract.networks[chainId]) {
      async function loadData() {
        if (!!(library && account)) {
          const signer = library.getSigner(account).connectUnchecked();
          let nftcontract = new ethers.Contract(LacedameonContract.networks[chainId].address, LacedameonContract.abi, signer);
          if (nftcontract) {
            setContract(nftcontract);
            try {
              let _maxTokenNumber = await nftcontract.MAX_ELEMENTS();
              setMaxTokenNumber(Number(_maxTokenNumber));
              let _totalSupply = await nftcontract.totalSupply();
              setTotalSupply(Number(_totalSupply));
            } catch (ex) {
              console.log(`failed call contract method MAX_ELEMENT: `, ex)
            }
          }
        }
      }
      loadData();
    }
  }, [library, account, chainId])

  const [whiteWalletAddr, setWhiteWalletAddr] = useState("");


  const addWhiteWalletAddr = async (_walletAddr) => {
    if (!!(library && account)) {
      if (chainId != 1) {
        setNetworkChangeModalShow(true);
      } else if (contract) {
        try {
          await contract.addAddressToWhitelist(_walletAddr);
          console.log('success');
        } catch (err) {
          console.log(err);
          if (err.constructor !== Object) {
            if (String(err).includes('"code":-32000')) {
              setErrMsg('Error: insufficient funds for intrinsic transaction cost');
              setErrorModalShow(true);
            } else {
              let startingIndex = String(err).indexOf('"message"');
              let endingIndex = String(err).indexOf('"data"');
              let sub1 = String(err).substring(startingIndex, endingIndex);
              let sub2 = sub1.replace('"message":"', '');
              let ret = sub2.replace('",', '');
              setErrMsg(ret);
              setErrorModalShow(true);
            }
          }
        }
      }
    } else {
      setWalletConnectInfoModalShow(true);
    }
  };

  const addMultipleWhitelist = async (_whitelistAddr) => {
    console.log('_whitelistAddr', _whitelistAddr);
    let req = _whitelistAddr.replaceAll('"', '').replaceAll(" ", "").split(',');
    console.log('req', req);
    if (!!(library && account)) {
      if (chainId != 1) {
        setNetworkChangeModalShow(true);
      } else if (contract) {
        try {
          await contract.setWhitelistAddr(req);
          console.log('success');
        } catch (err) {
          console.log(err);
          if (err.constructor !== Object) {
            if (String(err).includes('"code":-32000')) {
              setErrMsg('Error: insufficient funds for intrinsic transaction cost');
              setErrorModalShow(true);
            } else {
              let startingIndex = String(err).indexOf('"message"');
              let endingIndex = String(err).indexOf('"data"');
              let sub1 = String(err).substring(startingIndex, endingIndex);
              let sub2 = sub1.replace('"message":"', '');
              let ret = sub2.replace('",', '');
              setErrMsg(ret);
              setErrorModalShow(true);
            }
          }
        }
      }
    } else {
      setWalletConnectInfoModalShow(true);
    }
  }

  const checkWhitelistWallet = async (_walletAddr) => {
    setWhitelistResult(null);
    if (!!(library && account)) {
      if (chainId != 1) {
        setNetworkChangeModalShow(true);
      } else if (contract) {
        console.log('_walletAddr', _walletAddr);
        let result = await contract.isWhitelisted(_walletAddr);
        setWhitelistResult(result);
      }
    }
  }

  const addWinnerWalletAddr = async (_walletAddr, _amount) => {
    if (!!(library && account)) {
      if (chainId != 1) {
        setNetworkChangeModalShow(true);
      } else if (contract) {
        try {
          await contract.addAddressToWinnerlist(_walletAddr, _amount);
          console.log('success');
        } catch (err) {
          console.log(err);
          if (err.constructor !== Object) {
            if (String(err).includes('"code":-32000')) {
              setErrMsg('Error: insufficient funds for intrinsic transaction cost');
              setErrorModalShow(true);
            } else {
              let startingIndex = String(err).indexOf('"message"');
              let endingIndex = String(err).indexOf('"data"');
              let sub1 = String(err).substring(startingIndex, endingIndex);
              let sub2 = sub1.replace('"message":"', '');
              let ret = sub2.replace('",', '');
              setErrMsg(ret);
              setErrorModalShow(true);
            }
          }
        }
      }
    } else {
      setWalletConnectInfoModalShow(true);
    }
  }

  const checkWinnerlist = async (_walletAddr) => {
    setWinnerlistResult(null);
    if (!!(library && account)) {
      if (chainId != 1) {
        setNetworkChangeModalShow(true);
      } else if (contract) {
        console.log('_walletAddr', _walletAddr);
        let result = await contract.isWinnerlisted(_walletAddr);
        setWinnerlistResult(result);
      }
    }
  }


  return (
    <div className="App">
      {/* Header */}
      <div className={`header${sticky ? " sticky" : ""}`}>
        <Navbar light expand="md">
          <Container>
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isOpen} navbar>
              <Nav navbar className="d-flex justify-content-end">
                <div className="d-flex align-items-center">
                  <div className="social-icons d-flex">

                  </div>
                  <NavItem className="wallet-connect-btn">
                    {!!(library && account) ? (
                      <Button size="sm" onClick={disconnectWallet}>
                        DISCONNECT WALLET
                      </Button>
                    ) : (
                      <Button size="sm" onClick={connectWallet}>
                        CONNECT WALLET
                      </Button>
                    )}
                  </NavItem>
                </div>
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
      </div>
      <div className="contractInfo">
        <Container>
          <h3>Total minted: {totalSupply} / {maxTokenNumber}</h3>
          <h3>Wallet Address: {account}</h3>
          <hr />
        </Container>
      </div>
      {/*Add whilte-list*/}
      <div className="contract-section">
        <Container>
          <h3>Add whiteList</h3>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">wallet addr</InputGroup.Text>
            <FormControl
              placeholder=""
              aria-label="wallet-addr"
              aria-describedby="basic-addon1"
              onChange={event => setWhiteWalletAddr(event.target.value)}
            />
          </InputGroup>
          <Button style={{ marginRight: "30px" }} size="sm" onClick={() => addWhiteWalletAddr(whiteWalletAddr)}>
            Add Single Wallet
          </Button>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" style={{ marginTop: "50px" }}>
            <Form.Label>Add Multiple Wallets</Form.Label>
            <Form.Control as="textarea" rows={3} onChange={event => setMultipleWhitelist(event.target.value)} />
          </Form.Group>
          <Button style={{ marginRight: "30px" }} size="sm" onClick={() => addMultipleWhitelist(multipleWhitelist)}>
            Add Multiple Wallets
          </Button>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" style={{ marginTop: "10px" }}>
            <Form.Label>Check Whitelist Wallet</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon2">wallet addr</InputGroup.Text>
              <FormControl
                placeholder=""
                aria-label="wallet-addr"
                aria-describedby="basic-addon2"
                onChange={event => setConfirmWallet(event.target.value)}
              />
            </InputGroup>
          </Form.Group>
          {
            whitelistResult != null &&
            (
              <>
                {
                  whitelistResult == true &&
                  (
                    <h3 style={{ color: "green" }}>True</h3>
                  )
                }
                {
                  whitelistResult == false &&
                  (
                    <h3 style={{ color: "red" }}>False</h3>
                  )
                }
              </>
            )
          }
          <Button style={{ marginRight: "30px" }} size="sm" onClick={() => checkWhitelistWallet(confirmWallet)}>
            Check Whitelist
          </Button>
          <h3>Add Winner Wallet</h3>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon3">wallet addr</InputGroup.Text>
            <FormControl
              placeholder=""
              aria-label="wallet-addr"
              aria-describedby="basic-addon3"
              onChange={event => setWinnerWalletAddr(event.target.value)}
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon4">number of NFTs</InputGroup.Text>
            <FormControl
              value={winnerAmount}
              placeholder=""
              aria-label="wallet-addr"
              aria-describedby="basic-addon5"
              onChange={event => setWinnerAmount(event.target.value)}
            />
          </InputGroup>
          <Button style={{marginRight: "30px"}} size="sm" onClick={() => addWinnerWalletAddr(winnerWalletAddr, winnerAmount)}>
            Add
          </Button>
          <Button size="sm" onClick={() => checkWinnerlist(winnerWalletAddr)}>
            Check Winnerlist
          </Button>
          {
            winnerlistResult != null &&
            (
              <>
                {
                  winnerlistResult == true &&
                  (
                    <h3 style={{ color: "green" }}>Wallet is Winner</h3>
                  )
                }
                {
                  winnerlistResult == false &&
                  (
                    <h3 style={{ color: "red" }}>Wallet is not Winner</h3>
                  )
                }
              </>
            )
          }
        </Container>
      </div>
      {/* WalletConnection Modal */}
      <Modal
        className="wallet-connection"
        show={walletConnectionModalShow}
        onHide={() => setWallectConnectionModalShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>CONNECT TO A WALLET</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button
            className="metamask-btn"
            variant="primary"
            onClick={() => {
              if (!window.ethereum) {
                setWallectConnectionModalShow(false);
                setInstallMetamaskModalShow(true);
              } else {
                activate(connectorsByName["Injected"]);
                setWallectConnectionModalShow(false);
              }
            }}
          >
            <img src="images/metamask-logo.svg" alt="" />
            METAMASK
          </Button>
          <Button
            className="walletconnection-btn"
            variant="primary"
            onClick={() => {
              resetWalletConnector(connectorsByName["WalletConnect"]);
              activate(connectorsByName["WalletConnect"]);
              setWallectConnectionModalShow(false);
            }}
          >
            <img src="images/walletconnect.svg" alt="" />
            WALLET CONNECT
          </Button>
        </Modal.Body>
      </Modal>
      {/* WalletConnection Info Modal */}
      <Modal
        className="info-modal"
        show={walletConnectInfoModalShow}
        onHide={() => setWalletConnectInfoModalShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center">
            Please connect your wallet by clicking 'CONNECT WALLET' button
          </p>
        </Modal.Body>
      </Modal>
      {/* Mint Error Modal */}
      <Modal
        className="info-modal"
        show={errorModalShow}
        onHide={() => setErrorModalShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Error Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center">
            {errMsg}
          </p>
        </Modal.Body>
      </Modal>
      {/* Install Metamask Modal */}
      <Modal
        className="info-modal"
        show={installMetamaskModalShow}
        onHide={() => setInstallMetamaskModalShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center">
            Please install metamask extension on your browser.
          </p>
        </Modal.Body>
      </Modal>
      {/* wrong network modal Modal */}
      <Modal
        className="network-change"
        show={networkChangeModalShow}
        onHide={() => setNetworkChangeModalShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>WRONG NETWORK</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center">
            Please switch your wallet network to Mainnet to use the app
          </p>
          <p className="text-center">
            If you still encounter problems, you may want to switch to a
            different wallet
          </p>
          <Button
            className="walletconnection-btn text-center"
            variant="primary"
            onClick={() => {
              setNetworkChangeModalShow(false);
              setWallectConnectionModalShow(true);
            }}
          >
            Switch wallet
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
