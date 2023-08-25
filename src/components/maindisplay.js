import React from 'react';

function MainDisplay({ walletStatus, errorText }) {
  return (
    <div>
      <p>Wallet Status: <b>{walletStatus}</b></p>

      <div className="Error">
        {errorText}
      </div>
    </div>
  );
}

export default MainDisplay;
