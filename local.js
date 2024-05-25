//
// LangChain/Ollama
//
const { Ollama } = require('@langchain/community/llms/ollama')
const ollama = new Ollama({
    baseUrl: "http://localhost:11434",
    model: "mistral",
});

// async function test () {
//     const answer = await ollama.invoke(`why is the sky blue?`)
//     console.log(answer)
// }
// test()

//
// TELEGRAM
//
const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
})

//
// DELAY
//
// let is_delaying = false
// function delay(time, action) {
//     is_delaying = true
//     return new Promise(() => setTimeout(action, time));
// } 

async function run(prompt, id, callback) {
    try {
        const text = await ollama.invoke(prompt);
        callback(text)
    } 
    catch (e){
        console.log(`[run]: ${e.message}`)
        bot.sendMessage(id, 'Response was blocked due to SAFETY')
    }
}

bot.on("polling_error", (msg) => console.log(msg))
bot.onText(/\/ask (.+)/, (msg, match) => {
    const id = msg.chat.id
    // // delaying..
    // if(is_delaying) {
    //     bot.sendMessage(id, `( busy answering ...)`)
    //     return
    // }
    const prompt = match[1]
    console.log('\nprompt: ' + prompt)
    try {
        run(prompt, id, (res) => {
            if(res.length > 0){
                console.log(`${res.length}  ${res}`)
                // delay(1000, () => {
                    try {
                        bot.sendMessage(id, 
                            `[${res.length} characters]\n ${res}`)
                        // // enabling 
                        // is_delaying = false
                    }
                    catch(e){
                        console.log('error on replying answer')
                        bot.sendMessage(id, `( has answer but telegram request error )`)
                    }
                // })
            } else {
                bot.sendMessage(id, `( no anwser )`)
            }
        })
    }
    catch(e){
        console.log(`[ask/error] ${e.message}`)
        bot.sendMessage(id, 'something is not right..')
    }
})