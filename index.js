
const TelegramBot = require('node-telegram-bot-api')
const { GoogleGenerativeAI } = require("@google/generative-ai")
const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai")

//
// initialize ...
//
const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true})
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },

    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },

    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },

    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
];

let is_delaying = false
function delay(time, action) {
    is_delaying = true
    return new Promise(() => setTimeout(action, time));
} 

async function run(prompt, id, callback) {
    try {
        const answer = await ollama.invoke(`why is the sky blue?`);
        console.log(answer)
        const text = answer

    //     const model = genAI.getGenerativeModel(
    //         { model: "gemini-pro",    
    //             generationConfig : {
    //             maxOutputTokens: 100
    //         }
    //     });      
    //   const result = await model.generateContent(prompt, safetySettings);
    //   const response = await result.response;
    //   const text = response.text()
      // return
      callback(text)
    } catch (e){
        console.log(e.message)
        bot.sendMessage(id, 'Response was blocked due to SAFETY')
    }
}

bot.onText(/\/ask (.+)/, (msg, match) => {
    // delaying..
    if(is_delaying) {
        bot.sendMessage(msg.chat.id, `( busy answering ...)`)
        return
    }
    const prompt = match[1]
    console.log('\nprompt: ' + prompt)
    try {
        run(prompt, msg.chat.id, (res) => {
            if(res.length > 0){
                console.log(`${res.length}  ${res}`)
                delay(1000, () => {
                    try {
                        bot.sendMessage(msg.chat.id, 
                            `[${res.length} characters]\n ${res}`)
                        // enabling 
                        is_delaying = false
                    }
                    catch(e){
                        console.log('error on replying answer')
                        bot.sendMessage(msg.chat.id, `( has answer but telegram request error )`)
                    }
                })
            } else {
                bot.sendMessage(msg.chat.id, `( no anwser )`)
            }
        })
    }
    catch(e){
        console.log(e.message)
        bot.sendMessage(msg.chat.id, 'something is not right..')
    }
})