import immutee from 'immutee'
import axios from 'axios'

import {
  miner_endpoint
} from '../constants'

// ------------------------------------
// Constants
// ------------------------------------

export const SET_USER_INFO = 'user/SET/USER'
export const SET_TEAM_INFO = 'user/SET/TEAM'

export const VALIDATE_START = 'user/VALIDATE/START'
export const VALIDATE_SUCCESS_ID = 'user/VALIDATE/SUCCESS/IDENTITY'
export const VALIDATE_FAILED_ID = 'user/VALIDATE/FAILED/IDENTITY'
export const VALIDATE_SUCCESS_WK = 'user/VALIDATE/SUCCESS/WORKSPACE'
export const VALIDATE_FAILED_WK = 'user/VALIDATE/FAILED/WORKSPACE'

export const REVOKE_SUCCESS = 'user/REVOKE/USER/SUCCESS'

// ------------------------------------
// Actions
// ------------------------------------

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
    })
    .catch(err => {
      console.error(err)
    })
  }
}

export function statusCheck (scope) {
  return (dispatch) => {
    return axios.get(miner_endpoint + (scope === 'identity' ? '/auth/validate/check' : '/channels/validate/check'))
    .then(res => {
      if (res.data.message.status) {
        if (scope === 'identity') {
          dispatch({
            type: VALIDATE_SUCCESS_ID
          })
        } else {
          dispatch({
            type: VALIDATE_SUCCESS_WK
          })
        }

        return res.data.message.status
      } else {
        throw res.data.message.text
      }
    })
    .catch(err => {
      console.error('Error:', err)
      if (scope === 'identity') {
        dispatch({
          type: VALIDATE_FAILED_ID
        })
      } else {
        dispatch({
          type: VALIDATE_FAILED_WK
        })
      }
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  valid: {
    identity: false,
    workspace: false
  },
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

    case VALIDATE_SUCCESS_ID:
      return immutable
      .set('isLoading', false)
      .set('valid.identity', true)
      .set('error', false)
      .done()

    case VALIDATE_SUCCESS_WK:
      return immutable
      .set('isLoading', false)
      .set('valid.workspace', true)
      .set('error', false)
      .done()

    case VALIDATE_FAILED_ID:
      return immutable
      .set('isLoading', false)
      .set('valid.identity', false)
      .set('error', true)
      .done()

    case VALIDATE_FAILED_WK:
      return immutable
      .set('isLoading', false)
      .set('valid.workspace', false)
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
      .set('valid.identity', false)
      .set('valid.workspace', false)
      .set('user', null)
      .set('team', null)
      .set('error', false)
      .done()

    default:
      return state;
  }
}
