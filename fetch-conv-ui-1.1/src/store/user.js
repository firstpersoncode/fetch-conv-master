import immutee from 'immutee'
import axios from 'axios'

import {
  miner_endpoint
} from '../constants'

// ------------------------------------
// Constants
// ------------------------------------
export const FETCH_START = 'user/FETCH/USER/START'
export const FETCH_SUCCESS = 'user/FETCH/USER/SUCCESS'
export const FETCH_FAILED = 'user/FETCH/USER/FAILED'

export const SET_USER_INFO = 'user/SET/USER'
export const SET_TEAM_INFO = 'user/SET/TEAM'

export const VALIDATE_START = 'user/VALIDATE/USER/START'
export const VALIDATE_SUCCESS = 'user/VALIDATE/USER/SUCCESS'
export const VALIDATE_FAILED = 'user/VALIDATE/USER/FAILED'

export const REVOKE_SUCCESS = 'user/REVOKE/USER/SUCCESS'

let auth_uri = 'https://slack.com/oauth/authorize'
// ------------------------------------
// Actions
// ------------------------------------

export function validate (code) {
  return (dispatch) => {
    return axios.post(miner_endpoint + '/auth/validate', {
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

export function revoke () {
  return (dispatch) => {
    return axios.get(miner_endpoint + '/auth/revoke')
    .then(res => {
      if (res.data.message.status) {
        dispatch({
          type: REVOKE_SUCCESS
        })

        return res
      } else {
        throw res.data.message.text
      }
    })
    .catch(err => {
      console.error('Error:', err)
    })
  }
}

export function getInfo () {
  return (dispatch) => {
    dispatch({
      type: FETCH_START
    })
    return axios.get(miner_endpoint + '/auth/getinfo')
    .then(res => {
      if (res.data.user) {
        dispatch({
          type: SET_USER_INFO,
          payload: res.data.user
        })
      }

      if (res.data.team) {
        dispatch({
          type: SET_TEAM_INFO,
          payload: res.data.team
        })
      }

      dispatch({
        type: FETCH_SUCCESS
      })
    })
    .catch(err => {
      console.error(err)
      dispatch({
        type: FETCH_FAILED
      })
    })
  }
}

export function statusCheck () {
  return (dispatch) => {
    return axios.get(miner_endpoint + '/auth/validate/check')
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

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  valid: false,
  user: null,
  team: null,
  isLoading: false,
  error: null
}
export default function userReducer (state = initialState, action) {
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

    case SET_USER_INFO:
      return immutable
      .set('user', action.payload)
      .done()

    case SET_TEAM_INFO:
      return immutable
      .set('team', action.payload)
      .done()

    case REVOKE_SUCCESS:
      return immutable
      .set('isLoading', false)
      .set('valid', false)
      .set('user', null)
      .set('team', null)
      .set('error', false)
      .done()

    default:
      return state;
  }
}
