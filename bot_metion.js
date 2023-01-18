// authenticates you with the API standard library
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

let event = context.params.event;
let mentions = event.mentions;
let botMention = mentions.find(mention => mention.bot);
let content = event.content;
let author = event.author;
let message = content.replace(/<@(\d+)>/gi, ($0, $1) => {
  let mention = mentions.find(mention => mention.id === $1);
  if (mention) {
    return `<@${mention.username}>`;
  } else {
    return `<@:unknown>`;
  }
});

let prompt = [
  `You are a chat bot inside of a Discord server. Your name is ${botMention.username}.`,
  `You respond to queries users ask you, which could be anything. Your goal is to be pleasant and welcoming.`,
  `Inside users messages to you, they'll refer to you by saying <@${botMention.username}> somewhere in the message.`,
  `User input may be multi-line, and you can respond with multiple lines as well. Here are some examples:`,
  ``,
  `${author.username} said: Hi <@${botMention.username}>!`,
  `Your response: Hello ${author.username}, I hope you are having a wonderful day.`,
  `${author.username} said: <@${botMention.username}> what is the capital of france`,
  `Your response: The capital of France is Paris.`,
  `${author.username} said: i don't like you <@${botMention.username}>...`,
  ``,
  `also i'm bored.`,
  `Your response: I like you ${author.username}! I hope I can grow on you.`,
  ``,
  `... hi bored, I'm dad!`,
  `${author.username} said: yo <@${botMention.username}> why is the sky blue?`,
  `Your response: As white light passes through our atmosphere, tiny air molecules cause it to 'scatter'. The scattering caused by these tiny air molecules (known as Rayleigh scattering) increases as the wavelength of light decreases. Violet and blue light have the shortest wavelengths and red light has the longest.`,
  `${author.username} said: ${message}`,
  `Your response: `
].join('\n');

let completion = await lib.openai.playground['@0.0.2'].completions.create({
  model: `text-davinci-003`,
  prompt: [
    prompt
  ],
  max_tokens: 512,
  temperature: 0.5,
  top_p: 1,
  n: 1,
  echo: false,
  presence_penalty: 0,
  frequency_penalty: 0,
  best_of: 1
});

let messageResponse = await lib.discord.channels['@0.3.1'].messages.create({
  channel_id: `${context.params.event.channel_id}`,
  content: [
    completion.choices[0].text
  ].join('\n'),
  tts: false
});

return messageResponse;