// IMPORTANDO O bot E O DIALOGFLOW
const bot = require('@wppconnect-team/wppconnect');
const dialogflow = require('@google-cloud/dialogflow');

// INICIANDO O DIALOGFLOW E CONFIGURANDO COM O USO DA KEY GERADA EM JSON, DEVE SE ENCONTRAR NA RAIZ DO PROJETO
const sessionClient = new dialogflow.SessionsClient({keyFilename: "</YOURPATHJSON>"});

// FUNCOES USADAS DA DOCUMENTACAO NORMAL QUE ESTAO NO README.md EM LINKS ÚTEIS
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
// FIM DA CONFIGURACAO E FUNCOES DO DIALOGFLOW

// INICIANDO O bot BOT
// PARAMETROS USADO PELO bot

// INICIANDO CREATE DO bot
bot.create({sessionName: 'sessionName'}).then((client) => start(client));
// FUNCAO START DO CLIENTE DO bot
function start(client) {
    // FUNCAO QUE CAPTURA AS MENSAGEM CHEGADAS DO WPP USANDO O bot
    client.onMessage(async message => {
        // EXECUTANDO QUERY DIALOGFLOW
        let textoResposta = await executeQueries("guia-obmn", message.from, [message.body], 'pt-BR')
        // ENVIANDO QUERY RETORNADA
        await client.sendText(message.from, textoResposta);
    })
}
// FIM DO bot BOT