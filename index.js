const TelegramBot = require("node-telegram-bot-api");
const functions = require("./functions.js");
require("./env.js");

const token = process.env.token;
const bot = new TelegramBot(token, {
  polling: true,
});

bot.on("polling_error", (error) => {
  console.error(`Erro no polling: ${error}`);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendPhoto(chatId, "https://i.imgur.com/FdShkj0.png", {
    caption: `Bem-vindo, ${msg.from.first_name} 🤑 \n\nEscolha uma das seguinte opções: `,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Comandos",
            callback_data: "Comandos",
          },
          {
            text: "Créditos",
            callback_data: "Creditos",
          },
        ],
      ],
    },
  });
});

bot.on("callback_query", (callbackQuery) => {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  if (data === "Comandos") {
    bot.sendMessage(
      chatId,
      `
    /start — Mostra o menu de interação do bot.
/op1 11912345678 — Colocará os cupons da 99 pop nesse número.
/cam — Todos os cupons ativos da Americanas.
    `
    );
  } else if (data === "Creditos") {
    bot.sendMessage(chatId, "Desenvolvido por: Allyson Gustavo");
  }
});

bot.onText(/\/cam/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const cupons = await functions.cupomAmericanas();
    if (!Array.isArray(cupons) || cupons.length === 0) {
      bot.sendMessage(chatId, "Não há cupons disponíveis no momento.");
      return;
    }
    const respostaFormatada = cupons
      .map((cupom, index) => {
        if (index % 2 === 0) {
          if (index === 0) {
            return cupom;
          } else {
            return "\n" + cupom;
          }
        } else {
          return " — " + cupom;
        }
      })
      .join("");

    bot.sendMessage(
      chatId,
      "Cupons ativos da Americanas\n\n" + respostaFormatada
    );
  } catch (error) {
    console.error("Erro ao obter cupons:", error);
    bot.sendMessage(chatId, "Ocorreu um erro ao obter os cupons.");
  }
});

bot.onText(/\/op1 (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  var numero = match[1];

  if (numero.startsWith("+55")) {
    numero = numero.substring(3);
  }

  if (/^\d{11}$/.test(numero)) {
    let config = require("./config.json");
    if (config.updateIsRunning) {
      bot.sendMessage(
        chatId,
        "Desculpe, o bot está atualizando. Tente novamente mais tarde."
      );
    } else {
      functions
        .cupom99(numero)
        .then((result) => {
          const resultadoFormatado = result.join("\n");
          bot.sendMessage(chatId, resultadoFormatado);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  } else {
    bot.sendMessage(
      chatId,
      "Por favor, envie um número válido. Exemplo: 11912345678 ou +5511912345678"
    );
  }
});