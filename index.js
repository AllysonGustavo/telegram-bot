const TelegramBot = require('node-telegram-bot-api');
const functions = require('./functions.js');
require('./env.js');

const token = process.env.token;
const bot = new TelegramBot(token, {
  polling: true
});

functions.atualizacao(); // Agendamento da atualização diária

bot.on('polling_error', (error) => {
  console.error(`Erro no polling: ${error}`);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendPhoto(chatId, 'https://i.imgur.com/FdShkj0.png', {
    caption: `Bem-vindo, ${msg.from.first_name} 🤑 \n\nEscolha uma das seguinte opções: `,
    reply_markup: {
      inline_keyboard: [
        [{
            text: 'Comandos',
            callback_data: 'Comandos'
          },
          {
            text: 'Créditos',
            callback_data: 'Creditos'
          }
        ]
      ]
    }
  });
});

bot.on('callback_query', (callbackQuery) => {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  if (data === 'Comandos') {
    bot.sendMessage(chatId, '/op1 11912345678 - O bot colocará os cupons do 99 pop nesse número.');
  } else if (data === 'Creditos') {
    bot.sendMessage(chatId, 'Desenvolvido por: Allyson Gustavo');
  }
});

bot.onText(/\/op1 (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const numero = parseInt(match[1], 10);

  if (/^\d{11}$/.test(numero)) {
    if (functions.getScriptRunningStatus()) {
      bot.sendMessage(chatId, 'Desculpe, o bot está atualizando. Tente novamente mais tarde.');
    } else {
      functions.createLockFile(); // Bloqueia a execução do /op1
      functions.cupom(numero)
        .then((result) => {
          const resultadoFormatado = result.join('\n');
          bot.sendMessage(chatId, resultadoFormatado);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          functions.removeLockFile(); // Libera a execução do /op1 após a conclusão do cupom
        });
    }
  } else {
    bot.sendMessage(chatId, 'Por favor, envie um número válido. Exemplo: 11912345678');
  }
});