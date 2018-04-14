const request = require('request')

const express = require('express')
const router = express.Router()

const {
  publicChannel, privateChannel,
  imChannel, mpimChannel
} = require('./channels')

const {
  publicChannelInfo, privateChannelInfo,
} = require('./channel_info')

const {
  message
} = require('./message')

const {
  members
} = require('./members')

const {
  pins
} = require('./pins')

router.get('/validate/check', (req, res, next) => {
  let result = {
    'message': {
      'status': false,
      'text': 'identity Access Unauthorized'
    }
  }
  if (req.session && req.session['_user_scope_']) {
    result = {
      'message': {
        'status': true,
        'text': 'isLogin'
      }
    }
  }
  res.status(200).send(result)
})

router.get('/list/:c_filter/:c_type/:cursor/:limit', (req, res, next) => {
  let result

  switch (req.params.c_type) {
    case 'public':
      result = publicChannel
      break;
    case 'private':
      result = privateChannel
      break;
    case 'im':
      result = imChannel
      break;
    case 'mpim':
      result = mpimChannel
      break;
  }

  res.status(200).send(result)
})

router.get('/info/:channel_type/:c_id', (req, res, next) => {
  let result
  let chRes = {}
  if (req.params.channel_type === 'private') {
    chRes['group'] = privateChannel.channels.find(c => {
      return c.id === req.params.c_id
    })
  } else {
    chRes['channel'] = publicChannel.channels.find(c => {
      return c.id === req.params.c_id
    })
  }

  result = {
    'ok': true,
    ...chRes
  }

  res.status(200).send(result)
})

router.get('/messages/:c_id/:cursor/:limit', (req, res, next) => {
  res.status(200).send(message)
})

router.get('/members/:c_id/:cursor/:limit', (req, res, next) => {
  res.status(200).send(members)
})

router.get('/pins/:c_id', (req, res, next) => {
  res.status(200).send(pins)
})

module.exports = router
