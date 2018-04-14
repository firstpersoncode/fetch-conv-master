const request = require('request')

const express = require('express')
const router = express.Router()

const {
  userInfo
} = require('./info')

router.get('/signin', (req, res) => {
  let redirect = req.query.redirect
  req.session['_user_sid_'] = 'loggedIn'
  req.session['_user_scope_'] = 'scopeGranted'
  // res.status(200).send({
  //   'status': true
  // })
  res.redirect(redirect)
})

router.get('/validate/check', (req, res) => {
  let result = {
    'message': {
      'status': false,
      'text': 'identity Access Unauthorized'
    }
  }
  if (req.session && req.session['_user_sid_']) {
    result = {
      'message': {
        'status': true,
        'text': 'isLogin'
      }
    }
  }
  res.status(200).send(result)
})

router.get('/revoke', (req, res) => {
  req.session.reset()
  res.status(200).send({
    'status': true
  })
})

router.get('/getinfo', (req, res) => {
  let result = {
    'message': {
      'status': false,
      'text': 'Unauthorized Access'
    }
  }

  if (req.session && req.session['_user_sid_']) {
    result = userInfo
  }
  res.status(200).send(result)
})

module.exports = router
