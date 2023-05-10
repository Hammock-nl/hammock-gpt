# HAMMOCK GPT
This project provides an add-on for Microsoft Outlook that allows users to select a piece of text within an email and perform one of three operations: Proofread the text, translate the text to a specified language, or change the sentiment of the text. The operations are powered by the OpenAI API.

## Getting Started
To get a local copy up and running, follow these steps:

### Prerequisites
* Node.js and NPM installed on your local development machine.
* An API Key from OpenAI.

### Installation
1) Clone the repo:
    ```bash
    git clone git@github.com:ehmPlankje/hammock-gpt.git
    ```
   
2) Install NPM packages:
    ```bash
    npm install
    ```
3) Create a `.env` file in the `/webpack` directory by copying the `/webpack/.env.sample` file. Set the `OPENAI_API_KEY` value with your own OpenAI key.

### Running the Project
Start the development server:
```bash
npm run dev-server
```

### Sideload the Add-On in Outlook
In order to load the add-on in Outlook, follow the instructions provided by Microsoft on [how to sideload Outlook add-ins for testing](https://learn.microsoft.com/en-us/office/dev/add-ins/outlook/sideload-outlook-add-ins-for-testing?tabs=web). You'll need to use the `manifest.xml` file located in the `/assets/manifests` directory.

### SSL Certificate
This project uses a self-signed SSL certificate for local development, which is defined in the `/webpack/webpack.dev.js` file. For security reasons, you should replace this with your own SSL certificate. A valid SSL certificate is required by Microsoft Outlook.

You can generate a self-signed certificate following the instructions on [this page](https://devcenter.heroku.com/articles/ssl-certificate-self). After generating your certificate, you must add it to your trusted root authorities. The process varies depending on your OS and browser.

## Usage
Once the add-on is sideloaded in Outlook, you can select any text in an email. After selecting the text, you can choose one of the available operations: Proofread, Translate, or Change Sentiment. The add-on will then call the OpenAI API to perform the requested operation and display the transformed text, which you can then accept to replace the original selected text.

## Contact
Please contact me via my contact details listed within Canvas if you need any assistance or require more information.
