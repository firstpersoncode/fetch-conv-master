const { Channel } = require('../../db/model')
const request = require('request')

module.exports = (req, res) => {

  // let incomingChannel = req.body.data
  // if (incomingChannel && incomingChannel.id) {
  //
  //   let query = {'id': incomingChannel.id},
  //   update = {
  //     '$set': Object.assign(
  //       {},
  //       incomingChannel,
  //       {
  //         'updated': Date.now()
  //       }
  //     )
  //   },
  //   options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const { options, sort, limit } = req.body
    // Find the document
    Channel
    .find(options)
    .sort(sort)
    .limit(Number(limit))
    .exec((error, result) => {
      if (error) return console.error(error)

      // do something with the document
      res.status(200).send(result)
    })
  // }
}
