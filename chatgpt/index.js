const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: "pk-ltjQWZOTeDqQuzELwGfUSwdkBnKYvzFtxCcazRCwlhuHjcrx",
  baseURL: "https://api.pawan.krd/cosmosrp/v1",
});

const createChat = async () => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  });
  console.log(chatCompletion.choices[0].message.content);
  console.log(chatCompletion);
};

createChat();
