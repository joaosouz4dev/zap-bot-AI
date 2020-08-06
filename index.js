// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require('venom-bot');
const dialogflow = require('@google-cloud/dialogflow');
const fs = require('fs');

const sessionClient = new dialogflow.SessionsClient({keyFilename: "./teste-qrscuw-872f2225e85c.json"});

async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
  ) {
    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );
  
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };
  
    if (contexts && contexts.length > 0) {
      request.queryParams = {
        contexts: contexts,
      };
    }
  
    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}

const parameters = {
    headless: true, // Headless chrome
    devtools: false, // Open devtools by default
    useChrome: true, // If false will use Chromium instance
    debug: false, // Opens a debug session
    logQR: true, // Logs QR automatically in terminal
    browserArgs: [''], // Parameters to be added into the chrome browser instance
    refreshQR: 15000, // Will refresh QR every 15 seconds, 0 will load QR once. Default is 30 seconds
    autoClose: 60000, // Will auto close automatically if not synced, 'false' won't auto close. Default is 60 seconds (#Important!!! Will automatically set 'refreshQR' to 1000#)
    disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
}

venom.create('sessionName', (base64Qr, asciiQR) => {
    console.log(asciiQR);
    exportQR(base64Qr, 'marketing-qr.png');
}, (statusFind) => {
    console.log(statusFind);
}, parameters).then((client) => {
      start(client);
}).catch((erro) => console.log(erro));

function start(client) {
    client.onMessage(async message => {
        if(message.from.toString() == '554396611437@c.us'){
            let textoResposta = await executeQueries("teste-qrscuw", message.from.toString(), message.body, 'pt-BR')
            await client.sendText(message.from, textoResposta);
        }

    })
}
function exportQR(qrCode, path) {
    qrCode = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(qrCode, 'base64');
  
    // Creates 'marketing-qr.png' file
    fs.writeFileSync(path, imageBuffer);
}

async function executeQueries(projectId, sessionId, queries, languageCode) {
    let context;
    let intentResponse;
    for (const query of queries) {
        try {
            console.log(`Sending Query: ${query}`);
            intentResponse = await detectIntent(
                projectId,
                sessionId,
                query,
                context,
                languageCode
            );
            console.log('Detected intent');
            return `${intentResponse.queryResult.fulfillmentText}`
        } catch (error) {
            console.log(error);
        }
    }
}