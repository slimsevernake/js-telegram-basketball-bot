import {config} from "./config";
import {Scenes, session, Telegraf} from 'telegraf'
import echoScene from "./controllers/echo";
import MyContext from "./types/IMyContext";
import basketballGameScene from "./routes/basketball/basketball";
import basketballEnterScene from "./routes/basketball/enter";
import {callbackQuery as basketballCallbackQuery} from "./controllers/basketball";
import mongoose from "mongoose";
import logger from "./util/logger";

// Create bot instance
const bot = new Telegraf<MyContext>(config.token);

// Connect to database using 'DB_URI' env property with mongoose
mongoose.connect(config.dbURI)
    .then(() => logger.info('Database Connected'))
    .catch(err => logger.error(err));

// Create new stage with all scenes
const stage = new Scenes.Stage<MyContext>([
    echoScene, basketballGameScene, basketballEnterScene,
])

// Middleware
bot.use(session());
bot.use(stage.middleware());

// Handlers
//
// '/start' greeting
bot.start((ctx: MyContext) => ctx.reply('Hello!'));
// '/echo' Echo bot
bot.command('echo', (ctx: MyContext) => ctx.scene.enter('echo'))
// '/basketball' Start basketball game
bot.command('basketball', (ctx) => {
    if (ctx.update.message.chat.type === 'group') {
        ctx.scene.enter('basketball-enter');
    } else {
        ctx.reply('Sorry! This option is available only in groups');
    }
})
bot.on("callback_query", basketballCallbackQuery);

// Launch bot
bot.launch().then(() => logger.info('Bot is ONLINE'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))