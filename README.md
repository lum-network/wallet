# Lum Network - Wallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This is Lum Network's wallet project created to give you access to your personal LUM wallet by a Ledger or any Software method (Mnemonic, keystore or private key) and gives you the ability to interact with it.

This wallet is backed with Lum Network's Javascript SDK. You can find it [here](https://github.com/lum-network/sdk-javascript)

## Features

- Access your wallet:

  - **`Ledger`**, you can access your wallet with your ledger and the according Lum Network ledger app.
  - **`Mnemonic`**, write down your 12/24 length mnemonic to access your wallet.
  - **`Keystore`**, upload your keystore file and secure your access by providing the corresponding passsword.
  - **`Private Key`**, enter your wallet private key to directly access it.

**Note: Software methods are not recommanded as they are not secured and can be easily lost so use it at your own risks**

- View your recent transactions

- Wallet operations

  - Delegate, undelegate and redelegate to dedicated validators
  - Send Lum
  - Earn rewards

## Development

- First, clone the repository `git clone https://github.com/lum-network/wallet.git`
- Install the project packages via `yarn`

- Then, in the project directory, you can run:

  #### `yarn build`

  Builds the app for production to the `build` folder.\
  It correctly bundles React in production mode and optimizes the build for the best performance.

  The build is minified and the filenames include the hashes.\
  This works if you want to run an offline version of your wallet!

  #### `yarn start`
  
  Runs the app in the development mode.\
  Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

  The page will reload if you make edits.\
  You will also see any lint errors in the console.

  #### `yarn test`

  Launches the test runner in the interactive watch mode.\
  See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## Bug / Feature Request

If you find a bug, or want a new feature added, please submit it on the [Github Issues](https://github.com/lum-network/wallet/issues)
