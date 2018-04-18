import immutee from 'immutee'
import axios from 'axios'

import {
  miner_endpoint
} from '../constants'

export const VALIDATE_START = 'channel/VALIDATE/CHANNELS/START'
export const VALIDATE_SUCCESS = 'channel/VALIDATE/CHANNELS/SUCCESS'
export const VALIDATE_FAILED = 'channel/VALIDATE/CHANNELS/FAILED'

export const FETCH_START = 'channel/FETCH/CHANNELS/START'
export const FETCH_SUCCESS = 'channel/FETCH/CHANNELS/SUCCESS'
export const FETCH_FAILED = 'channel/FETCH/CHANNELS/FAILED'

export const FETCH_CHANNEL_PUBLIC = 'channel/FETCH/CHANNELS/PUBLIC'
export const FETCH_CHANNEL_PRIVATE = 'channel/FETCH/CHANNELS/PRIVATE'

export const FETCH_INFO_PUBLIC = 'channel/FETCH/INFO/PUBLIC'
export const FETCH_INFO_PRIVATE = 'channel/FETCH/INFO/PRIVATE'

let auth_uri = 'https://slack.com/oauth/authorize'

export function startLoading () {
  return {
    type: FETCH_START
  }
}

export function finishLoading () {
  return {
    type: FETCH_SUCCESS
  }
}

export function failedLoading () {
  return {
    type: FETCH_FAILED
  }
}

export function validate (code) {
  return (dispatch) => {
    dispatch({
      type: VALIDATE_START
    })
    return axios.post(miner_endpoint + '/channels/validate', {
      code
    })
    .then(res => {
      if (res.data.message.status) {
        dispatch({
          type: VALIDATE_SUCCESS
        })
      } else {
        throw res.data.message.text
      }
    })
    .catch(err => {
      console.error('Error:', err)
      dispatch({
        type: VALIDATE_FAILED
      })
    })
  }
}

export function fetchChannelLists(type, c_filter, cursor, limit, firstFetch) {
  let next = cursor && cursor.replace('=', '%3D') || ''
  return (dispatch, getState) => {
    return axios.get(miner_endpoint + '/channels/list' + '/' + c_filter + '/' + type + (next ? '/' + next : (firstFetch ? '/first' : '/end')) + '/' + limit)
    .then(res => {
      return res.data.channels
    })
    .catch(err => {
      console.error(err)
    })
  }
}

export function fetchChannelInfo (type, id) {
  return (dispatch) => {
    return axios.get(miner_endpoint + '/channels/info' + '/' + type + '/' + id)
    .then(res => {
      return res.data.channel
    })
    .catch(err => {
      console.error(err)
    })
  }
}

export function fetchUsersList () {
  return (dispatch) => {
    return axios.get(miner_endpoint + '/channels/users')
    .then(res => {
      return res.data.members
    })
    .catch(err => {
      console.error(err)
    })
  }
}

export function statusCheck () {
  return (dispatch) => {
    dispatch({
      type: VALIDATE_START
    })
    return axios.get(miner_endpoint + '/channels/validate/check')
    .then(res => {
      if (res.data.message.status) {
        let { text } = res.data.message
        dispatch({
          type: VALIDATE_SUCCESS
        })
      } else {
        throw res.data.message.text
      }
    })
    .catch(err => {
      console.error('Error:', err)
      dispatch({
        type: VALIDATE_FAILED
      })
    })
  }
}

const initialState = {
  valid: false,
  isLoading: false,
  error: null
};

export default function channelReducer (state = initialState, action) {
  const immutable = immutee(state);
  switch (action.type) {

    case VALIDATE_START:
      return immutable
      .set('isLoading', true)
      .done()

    case VALIDATE_SUCCESS:
      return immutable
      .set('isLoading', false)
      .set('valid', true)
      .set('error', false)
      .done()

    case VALIDATE_FAILED:
      return immutable
      .set('isLoading', false)
      .set('valid', false)
      .set('error', true)
      .done()

    case FETCH_START:
      return immutable
      .set('isLoading', true)
      .done()

    case FETCH_SUCCESS:
      return immutable
      .set('isLoading', false)
      .set('error', false)
      .done()

    case FETCH_FAILED:
      return immutable
      .set('isLoading', false)
      .set('error', true)
      .done()

    default:
      return state;
  }
}
