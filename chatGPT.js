const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const targetContact = 'LuzIA'

const client = new Client({
    authStrategy: new LocalAuth()
});

let waitingForResponse = false;
let responsePromise;
let responseResolve;

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('bot pronto');

    // Exemplo de uso
   const response = sendAndWaitForResponse('Qual é a capital da França?')
        .then(response => {
            console.log('Resposta recebida:', response);
        })
        .catch(error => {
            console.error('Erro:', error);
        });
        console.log(response)
});

client.on('message', async (message) => {
    if (waitingForResponse && message.fromMe === false) {
        const chat = await client.getChatById(message.from);
        if (chat.name === targetContact) {
            responseResolve(message.body); // Resolve a Promise com a resposta
            waitingForResponse = false; // Reset the state
        }
    }
});

module.exports = async function sendAndWaitForResponse(question) {
    return new Promise(async (resolve, reject) => {
        try {
            // Define o estado de espera
            waitingForResponse = true;
            responsePromise = new Promise(res => responseResolve = res);

            // Envia a mensagem inicial para o contato
            const chats = await client.getChats();
            console.log(chats)
            const targetChat = chats.find(c => c.name === targetContact);
            console.log(targetChat)
            if (targetChat) {
                await client.sendMessage(targetChat.id._serialized, question);
                console.log(`Mensagem enviada para ${targetContact}`);

                // Aguarda a resposta
                const response = await responsePromise;
                resolve(response);
            } else {
                console.log(`Contato ${targetContact} não encontrado.`);
                reject(new Error(`Contato ${targetContact} não encontrado.`));
            }
        } catch (error) {
            reject(error);
        }
    });
}

client.initialize();

