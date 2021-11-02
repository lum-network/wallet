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

**Note: Software methods are not recommended as they are not secured and can be easily lost so use it at your own risks**

- View your recent transactions

- Wallet operations

  - Delegate, undelegate and redelegate to dedicated validators
  - Send Lum
  - Earn rewards

## Installation

### Clone

This project has a git submodule so clone it with:

> $ git clone git@github.com:lum-network/wallet.git --recursive

### Install dependencies

There are two `package.json` in this repository:

> $ yarn && cd src/frontend-elements && yarn && cd ../..

### Running your app

Now you can run your app with:

> $ yarn start

### Building your app

You can build your app with:

> $ yarn build

## Code Style

All React components are functional components with hooks.

There is a Prettier and ES Lint configuration to follow.

## Contributing

All contributions are more than welcome! Feel free to fork the repository and create a Pull Request!

## Bug / Feature Request

If you find a bug, or want a new feature added, please submit it on the [Github Issues](https://github.com/lum-network/wallet/issues)
