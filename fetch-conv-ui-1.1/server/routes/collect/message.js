const { Message } = require('../../db/model')
const request = require('request')

module.exports = (req, res) => {

  let incomingChannelMsg = req.body.data
  if (incomingChannelMsg && incomingChannelMsg.id) {

    let query = {'id': incomingChannelMsg.id},
    update = {
      '$set': Object.assign(
        {},
        {
          'name': incomingChannelMsg.name,
        },
        {
          'updated': Date.now()
        }
      ),
      '$addToSet': {
        'data': {
          '$each': incomingChannelMsg.data
        }
      }
    },
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

    // Find the document
    Message.findOneAndUpdate(query, update, options, (error, result) => {
      if (error) return console.error(error)

      // do something with the document
      res.status(200).send({status: 1})
    })
  }
}
