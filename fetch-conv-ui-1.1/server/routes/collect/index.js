const { Channel } = require('../../db/model')
const request = require('request')

module.exports = (req, res) => {

  // if (req.body.channels.length) {
  //   req.body.channels.map((channel, i) => {
  //     let channels = new Channel(channel);
  //     channels.save((err) => {
  //       if (err) {
  //         console.error(err)
  //         // res.status(400).send({status: 0})
  //       }
  //     })
  //   })

    let newChannel = new Channel(req.body.channel);
    newChannel.save((err) => {
      if (err) {
        console.error(err)
        // res.status(400).send({status: 0})
      }
    })
    res.status(200).send({status: 1})
  // }
}
