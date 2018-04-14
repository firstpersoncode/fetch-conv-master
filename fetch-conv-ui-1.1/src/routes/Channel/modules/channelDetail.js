import immutee from 'immutee'
import axios from 'axios'
import {
  miner_endpoint
} from '../../../constants'
// ------------------------------------
// Constants
// ------------------------------------
export const CHANNEL_START = 'detail/CHANNEL/START'
export const CHANNEL_SUCCESS = 'detail/CHANNEL/SUCCESS'
export const CHANNEL_FAILED = 'detail/CHANNEL/FAILED'

export const CHANNEL_OPENED = 'detail/CHANNEL/OPEN'
export const CHANNEL_MEMBERS = 'detail/CHANNEL/MEMBERS'
export const CHANNEL_PINS = 'detail/CHANNEL/PINS'

export const APPEND_MESSAGE = 'detail/CHANNEL/APPEND/MESSAGE'
export const APPEND_MEMBERS = 'detail/CHANNEL/APPEND/MEMBERS'

// ------------------------------------
// Actions
// ------------------------------------

export function openChat (channel, id, cursor, limit, appending) {
  let next = cursor && (cursor.includes('=') ? cursor.replace('=', '%3D') : cursor) || ''
  return (dispatch, getState) => {
    dispatch({
      type: CHANNEL_START
    })
    return axios.get(miner_endpoint + '/channels/messages' + '/' + id + '/' + (next ? next : !appending ? 'first' : 'end') + '/' + limit)
    .then(res => {
      if (res.data.ok) {
        if (appending) {
          dispatch({
            type: APPEND_MESSAGE,
            messages: res.data.messages,
            next: res.data.response_metadata && res.data.response_metadata.next_cursor || ''
          })
        } else {
          dispatch({
            type: CHANNEL_OPENED,
            payload: channel,
            messages: res.data.messages,
            next: res.data.response_metadata && res.data.response_metadata.next_cursor || ''
          })
        }

        dispatch({
          type: CHANNEL_SUCCESS
        })
      } else {
        throw new Error('Failed set channel', res)
      }
    })
    .catch(err => {
      console.error(err)
      dispatch({
        type: CHANNEL_FAILED
      })
    })
  }
}


export function openMember (id, cursor, limit, appending) {
  let next = cursor && (cursor.includes('=') ? cursor.replace('=', '%3D') : cursor) || ''
  return (dispatch, getState) => {
    dispatch({
      type: CHANNEL_START
    })
    return axios.get(miner_endpoint + '/channels/members' + '/' + id + '/' + (next ? next : !appending ? 'first' : 'end') + '/' + limit)
    .then(res => {
      if (res.data.ok) {
        if (appending) {
          dispatch({
            type: APPEND_MEMBERS,
            members: res.data.members,
            next: res.data.response_metadata && res.data.response_metadata.next_cursor || ''
          })
        } else {
          dispatch({
            type: CHANNEL_MEMBERS,
            members: res.data.members,
            next: res.data.response_metadata && res.data.response_metadata.next_cursor || ''
          })
        }

        dispatch({
          type: CHANNEL_SUCCESS
        })
      } else {
        throw new Error('Failed set channel', res)
      }
    })
    .catch(err => {
      console.error(err)
      dispatch({
        type: CHANNEL_FAILED
      })
    })
  }
}

export function openPins (id) {
  return (dispatch, getState) => {
    dispatch({
      type: CHANNEL_START
    })
    return axios.get(miner_endpoint + '/channels/pins' + '/' + id)
    .then(res => {
      if (res.data.ok) {
        dispatch({
          type: CHANNEL_PINS,
          pins: res.data.items
        })

        dispatch({
          type: CHANNEL_SUCCESS
        })
      } else {
        throw new Error('Failed set channel', res)
      }
    })
    .catch(err => {
      console.error(err)
      dispatch({
        type: CHANNEL_FAILED
      })
    })
  }
}


// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  channelOpened: null,
  messages: [],
  members: [],
  pins: [],
  nextMessage: '',
  nextMember: '',
  isLoading: false,
  error: null
}

export default function chatReducer (state = initialState, action) {
  const immutable = immutee(state);
  switch (action.type) {

    case CHANNEL_START:
      return immutable
      .set('isLoading', true)
      .done()

    case CHANNEL_SUCCESS:
      return immutable
      .set('isLoading', false)
      .set('error', false)
      .done()

    case CHANNEL_FAILED:
      return immutable
      .set('isLoading', false)
      .set('error', true)
      .done()

    case CHANNEL_OPENED:
      return immutable
      .set('channelOpened', action.payload)
      .set('messages', action.messages)
      .set('nextMessage', action.next)
      .done()

    case CHANNEL_MEMBERS:
      return immutable
      .set('members', action.members)
      .set('nextMember', action.next)
      .done()

    case APPEND_MESSAGE:
      return immutable
      .merge('messages', action.messages)
      .set('nextMessage', action.next)
      .done()

    case APPEND_MEMBERS:
      return immutable
      .merge('members', action.members)
      .set('nextMember', action.next)
      .done()

    case CHANNEL_PINS:
      return immutable
      .set('pins', action.pins)
      .done()

    default:
      return state;
  }
}
