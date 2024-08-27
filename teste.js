console.log('rodando')

const sendAndWaitForResponse = require('./chatGPT');

 async function teste() {
    console.log('foi')
    const response = sendAndWaitForResponse('qual a capital do brasil?') 
    .then(response => {
        console.log('Resposta recebida:', response);
    })
    .catch(error => {
        console.error('Erro:', error);
    }); 
    console.log(response)  
}

teste()
