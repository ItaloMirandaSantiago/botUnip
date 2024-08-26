
//
//
//
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.APIKEY }); // Use uma variável de ambiente para a chave

module.exports = async (quest) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Você é um professor e deve responder apenas a resposta certa e MAIS NADA" },
                {
                    role: "user",
                    content: `Questão: ${quest}`,
                },
            ],
        });

        console.log(completion)
        // Retorna apenas o texto da resposta
        return completion.choices[0].message.content.trim(); 
    } catch (error) {
        console.error('Erro ao chamar a API do ChatGPT:', error);
        throw error; // Opcional: propague o erro para tratamento posterior
    }
};
