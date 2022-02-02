import React from "react";
import { 
  Container,
  Button,
  Row,
  Col,
  Table
} from 'reactstrap';
import './styles/walletlist.scss';

class WalletAddrList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      contract: props.contract,
      type: props.type,
      addressList: []
    };
    this.loadWalletAddressList = this.loadWalletAddressList.bind(this);
    this.removeAddress = this.removeAddress.bind(this);
  }

  async loadWalletAddressList() {
    if (this.state.contract) {
      let walletlist;
      if (this.state.type === "white") {
        walletlist = await this.state.contract.getWhitelist();
      } else {
        walletlist = await this.state.contract.getWinnerlist();
      }
      this.setState({
        addressList: walletlist
      });
    }
  }

  async removeAddress(address, e) {
    e.preventDefault();
    let index;
    if (this.state.contract) {
      if (this.state.type === "white") {
        await this.state.contract.removeFromWhitelist(address).then(() => {
          index = this.state.addressList.indexOf(address);
          if (index > -1) {
            this.state.addressList.splice(index, 1);
          }
        }).catch(() => {
          console.log('error');
        })
      } else {
        await this.state.contract.removeFromWinnerlist(address).then(() => {
          index = this.state.addressList.indexOf(address);
          if (index > -1) {
            this.state.addressList.splice(index, 1);
          }
        }).catch(() => {
          console.log('error');
        })
      }
    }
  }

  render() {
    return (
      <div className="wallet-list">
        <Container>
          <h1>Wallet List</h1>
          { this.state.addressList.length === 0 ? (
              <div>
                <Button style={{marginBottom: "20px"}} size="sm" onClick={this.loadWalletAddressList}>Load</Button>
                <Table size="sm">
                  <thead>
                    <tr>
                      <th>id</th>
                      <th>wallet address</th>
                      <th>action</th>
                    </tr>
                  </thead>
                </Table>
              </div>
            ):(
              <Table size="sm">
                <thead>
                  <tr>
                    <th>id</th>
                    <th>wallet address</th>
                    <th>action</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.addressList.map((address, index) => (
                      <tr key={index}>
                        <td>{index}</td>
                        <td>{address}</td>
                        <td>
                          {/* eslint-disable-next-line */}
                          <a href="#" onClick={(e) => this.removeAddress(address, e)}>
                            remove
                          </a>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </Table>
            )
          }
        </Container>
      </div>          
    );
  }
};

export default WalletAddrList;