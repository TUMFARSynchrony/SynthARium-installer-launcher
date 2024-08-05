# SynthARium Installer Launcher

Our [experimental hub](https://github.com/TUMFARSynchrony/experimental-hub/) is video conferencing platform that can be used by researchers to host their own custom online synchrony experiments. The experimental hub consists of 3 main pages: Session Overview, Experiment Page, and Post Processing room as outlined below.

## Installer

This project aims to easify the installation process of the experimental hub project. With this installer, users may easily install and launch their applications on their local computers or servers.

For installation and contribution, please see the descriptions below. 

## Install

Clone the repo and install dependencies:

```bash
git clone --depth 1 --branch main https://github.com/TUMFARSynchrony/SynthARium-installer-launcher.git your-project-name
cd your-project-name
npm install
```

**Having issues installing? See our [debugging guide](https://github.com/TUMFARSynchrony/SynthARium-installer-launcher/issues/)**

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```
