const AssistantV2 = require("ibm-watson/assistant/v2");
const { IamAuthenticator } = require("ibm-watson/auth");
const { Telegraf } = require("telegraf");

require("dotenv").config(); 

const assistant = new AssistantV2({
  version: process.env.WATSON_VERSION, 
  authenticator: new IamAuthenticator({
    apikey: process.env.API_KEY, 
  }),
  serviceUrl: process.env.API_URL,  
});

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);  // Token para autenticação no Telegram

// Middleware para conectar o Watson Assistant e o Telegram
const watsonResponse = (ctx) => {
  let userInput = ctx.update.message.text;  // Obtém a mensagem do usuário

  // Chama a função para enviar a mensagem ao Watson Assistant e receber uma resposta
  assistant
    .messageStateless({
      assistantId: process.env.ENV_ID,  // ID do assistente do Watson
      input: {
        message_type: "text",
        text: userInput,
      },
    })
    .then((res) => {
      showMessage(ctx, res);  // Chama a função para mostrar a resposta do Watson
    });
};

// Função para gerenciar a resposta recebida do Watson Assistant
const showMessage = (ctx, res) => {
  const response = res.result.output.generic[0];  // Obtém a resposta do Watson
  console.log(response);  // Exibe a resposta no console

  if (response.response_type === "text") {
    const message = response.text;  // Se a resposta for texto
    ctx.reply(message);  // Responde ao usuário no Telegram com o texto
  } else if (response.response_type === "option") {
    let message = `${response.title}\n\n`;

    for (let i = 0; i < response.options.length; i += 1) {
      message += `∘ ${response.options[i].label}\n`;
    }
    ctx.reply(message);
  }
};

// Escuta por mensagens de texto no Telegram
bot.on("text", (ctx) => {
  watsonResponse(ctx);  // Chama a função para lidar com a resposta do Watson
});

// Inicia o bot do Telegram
bot.launch(console.log("\x1b[36m%s\x1b[0m", "BOT UP..."));
