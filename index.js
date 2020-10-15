//Packages
const Discord = require('discord.js')
const client = new Discord.Client({presence: {status: 'online', activity: {name: 'Obsolete Dream'}}, disableMentions: 'everyone'})
const http = require('http')
const express = require('express')
const app = express()
const fs = require('fs')
const jimp = require('jimp')
const prefix = 'b!'
var types = ['food', 'snacks', 'desserts', 'drinks', 'alcohol', 'special', 'potions']

//Page
var port = 3000
app.get('/', (req, res) => res.sendStatus(200))
app.listen(port, () => console.log('Listening at port ' + port))
setInterval(() => http.get('http://barbot-v12--reficul109.repl.co/'), 280000)

//DB
const db = require('better-sqlite3')('barbot-db.db')
client.DB = db.prepare('SELECT * FROM dishes WHERE name = ?')
client.newRow = db.prepare('INSERT INTO dishes (type, name, message) VALUES (?, ?, ?)')
client.delRow = db.prepare('DELETE FROM dishes WHERE name = ?')

//Ready
client.once('ready', () => console.log('Work work work'))

//Messages
client.on('message', message => {

  try {

    //Non-Prefix Ignore
    if (message.author.bot || message.system) return;
    if (!message.content.toLowerCase().startsWith(prefix)) return;

    //Vars
    var msgCon = message.content.toLowerCase()
    var args_A = msgCon.split(' ')
    var dishComm = client.DB.get(msgCon.slice(prefix.length))
    var dishArgs = client.DB.get(args_A.slice(1).join(' ').toLowerCase())

    //Dish Server
    if (dishComm) {
      var imgs = fs.readdirSync('./images/').filter(obj => obj.startsWith(dishComm.name.replace(/\s/g, '') + '_'))
      if (!imgs.length) {return message.channel.send('This dish has no images...')}
      var img = imgs[Math.floor(Math.random() * imgs.length)]
      message.reply(dishComm.message, {files: ['./images/' + img]})}

    //Menu
    else if (msgCon.startsWith(prefix + 'menu')) {
      const embed = new Discord.MessageEmbed()
      embed.setAuthor("Delight Bot's Menu:")
      if (args_A[1] && types.includes(args_A[1].toLowerCase())) {
        card = args_A[1].toUpperCase()
        var rawMenu = db.prepare('SELECT * FROM dishes'), menu = []
        for (const dish of rawMenu.iterate()) {
          if (dish.type === args_A[1].toLowerCase()) {
            menu.push(prefix + dish.name)}}} 
      else {(menu = types), (card = 'Pick a menu:')}
      var half_length = Math.ceil(menu.length / 2)
      embed.addField(card, menu.slice(0, half_length), true)
      embed.addField('_ _', menu.slice(half_length, menu.length), true)
      embed.setColor(parseInt(Math.floor(Math.random() * 16777215)))
      message.channel.send(embed)}

    //Random
    else if (msgCon.startsWith(prefix + 'random')) {
      if (args_A[1] && types.includes(args_A[1].toLowerCase())) {
        var rawMenu = db.prepare('SELECT * FROM dishes'), menu = []
        for (const dish of rawMenu.iterate()) {
          if (dish.type === args_A[1].toLowerCase()) {
            menu.push(dish.name)}}} 
      else { return message.channel.send('Invalid type. (Try Plural)')}
      var dishRandom = client.DB.get(menu[Math.floor(Math.random() * menu.length)])
      var imgs = fs.readdirSync('./images/').filter(obj => obj.startsWith(dishRandom.name.replace(/\s/g, '')  + '_'))
      if (!imgs.length) {return message.channel.send(dishRandom.name + ' has no images...')}
      var img = imgs[Math.floor(Math.random() * imgs.length)]
      message.reply(dishRandom.message, {files: ['./images/' + img]})}

    //Invite
    else if (msgCon === (prefix + 'invite')) {
      message.author.send('https://discord.com/oauth2/authorize?client_id=471174518120120320&scope=bot&permissions=388160')
      message.react('👍')}

    //BarBotMod Lock
    var guildCheck = client.guilds.cache.get("728487620933320707")
    if ((message.author.id === "320398018060746752") || (guildCheck && guildCheck.member(message.author) && guildCheck.member(message.author).roles.cache.find(role => role.id === "728488654489780314"))) {

      //Add to Menu
      if (msgCon === (prefix + 'new')) {
        message.channel.send('Reply with:\n``TYPE, NAME, MESSAGE``\n(Types can be **' + types.join(', ') + '**)\n(Message can be **default**)\nEx: ``alcohol, sake, default``\nReply **cancel** to cancel')
        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 600000})
        collector.on('collect', cMessage => {
          if (cMessage.content.toLowerCase() === 'cancel') {return collector.stop()}
          var args_B = cMessage.content.split(', ')
          if (args_B.length !== 3) { return message.reply('There is something wrong with your reply.')}
          if (!types.includes(args_B[0].toLowerCase())) {return message.reply('Invalid type. (Try Plural)')}
          if (client.DB.get(args_B[1].toLowerCase())) {return message.reply('This dish already exists!')}
          if (args_B[2].toLowerCase() === 'default') {args_B[2] = "Here's your order."}
          client.newRow.run(args_B[0].toLowerCase(), args_B[1].toLowerCase(), args_B[2])
          cMessage.react('👍')
          collector.stop()})}

      //Remove from Menu
      else if (msgCon.startsWith(prefix + 'remove ')) {
        if (!dishArgs) {return message.reply('That dish does not exist.')}
        client.delRow.run(dishArgs.name)
        message.react('👍')}

      //MsgAtt
      if (message.attachments.size) {var msgAtt = Array.from(message.attachments.values(), x => x.url)}

      //Upload Files
      if (msgCon.startsWith(prefix + 'upload ') && msgAtt) {
        if (!dishArgs) { return message.reply('That dish does not exist.') }
        var imgs = fs.readdirSync('./images/').filter(obj => obj.startsWith(dishArgs.name.replace(/\s/g, '') + '_'))
        jimp.read(msgAtt[0]).then(async function(img) {
          await img.write('./images/' + dishArgs.name.replace(/\s/g, '') + '_' + ++imgs.length + '.png')
          message.react('👍')})}

      //Username
      else if (msgCon.startsWith(prefix + 'username ')) {
        client.user.setNickname(args_A.slice(1).join(' '))
        message.react('👍')}

      //Avatar
      else if (msgCon === (prefix + 'avatar') && msgAtt) {
        client.user.setAvatar(msgAtt[0])
        message.react('👍')}}

  } catch (error) {
    console.log('Trigger: ' + message.content + ' | ' + error)}
})

//Token
client.login(process.env.TOKEN)