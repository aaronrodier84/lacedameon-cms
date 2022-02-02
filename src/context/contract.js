import React from "react";

// set the defaults
const ContractContext = React.createContext({
  contract: null,
  setContract: () => {}
});

export default ContractContext;