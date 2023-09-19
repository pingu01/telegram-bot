const AssistantV2 = require("ibm-watson/assistant/v2");
const { IamAuthenticator } = require("ibm-watson/auth");
const { Telegraf } = require("telegraf");

require("dotenv").config(); 


// Configuração do Watson Assistant
const assistant = new AssistantV2({
  version: process.env.WATSON_VERSION,
  authenticator: new IamAuthenticator({
    apikey: process.env.API_KEY,
  }),
  serviceUrl: process.env.API_URL,
});

// Configuração do bot do Telegram
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Função para lidar com a resposta do Watson Assistant
const handleWatsonResponse = async (ctx, userInput) => {
  try {
    const res = await assistant.messageStateless({
      assistantId: process.env.ENV_ID,
      input: {
        message_type: "text",
        text: userInput,
      },
    });

    const response = res.result.output.generic[0];

    if (response.response_type === "text") {
      ctx.reply(response.text);
    } else if (response.response_type === "option") {
      let message = `${response.title}\n\n`;
      for (let option of response.options) {
        message += `∘ ${option.label}\n`;
      }
      ctx.reply(message);
    }
  } catch (error) {
    console.error("Erro ao interagir com o Watson Assistant:", error);
    ctx.reply("Desculpe, ocorreu um erro ao processar sua solicitação.");
  }
};

// Escuta por mensagens de texto no Telegram
bot.on("text", (ctx) => {
  const userInput = ctx.update.message.text;
  handleWatsonResponse(ctx, userInput);
});

// Inicia o bot do Telegram
bot.launch(console.log("\x1b[36m%s\x1b[0m", "BOT UP..."));
