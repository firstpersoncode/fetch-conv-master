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

export function setChannelOpened (channel) {
  return (dispatch) => {
    dispatch({
      type: 'SET_CHANNEL',
      payload: channel
    })
  }
}

export function openChat (channel, id, cursor, limit, appending) {
  let next = cursor && (cursor.includes('=') ? cursor.replace('=', '%3D') : cursor) || ''
  return (dispatch, getState) => {
    dispatch({
      type: CHANNEL_START
    })
    return axios.get(miner_endpoint + '/channels/messages' + '/' + id + '/' + (next ? next : !appending ? 'first' : 'end') + '/' + limit)
    .then(res => {
      // if (res.data.ok) {
      //   if (appending) {
      //     dispatch({
      //       type: APPEND_MESSAGE,
      //       messages: res.data.messages,
      //       next: res.data.response_metadata && res.data.response_metadata.next_cursor || ''
      //     })
      //   } else {
      //     dispatch({
      //       type: CHANNEL_OPENED,
      //       name: channel.name,
      //       id,
      //       messages: res.data.messages,
      //       next: res.data.response_metadata && res.data.response_metadata.next_cursor || ''
      //     })
      //   }
      //
      //   dispatch({
      //     type: CHANNEL_SUCCESS
      //   })
      //
      //   return {
      //     id,
      //     name: channel.name,
      //     data: res.data.messages,
      //   }
      // } else {
      //   throw new Error('Failed set channel', res)
      // }
    })
    .catch(err => {
      console.error(err)
      dispatch({
        type: CHANNEL_FAILED
      })
    })
  }
}

export function openMember (channel, id, cursor, limit, appending) {
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
            name: channel.name,
            id,
            members: res.data.members,
            next: res.data.response_metadata && res.data.response_metadata.next_cursor || ''
          })
        }

        dispatch({
          type: CHANNEL_SUCCESS
        })

        return {
          name: channel.name,
          id,
          members: res.data.members
        }
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

export function openPins (channel, id) {
  return (dispatch, getState) => {
    dispatch({
      type: CHANNEL_START
    })
    return axios.get(miner_endpoint + '/channels/pins' + '/' + id)
    .then(res => {
      if (res.data.ok) {
        dispatch({
          type: CHANNEL_PINS,
          name: channel.name,
          id,
          pins: res.data.items
        })

        dispatch({
          type: CHANNEL_SUCCESS
        })

        return {
          name: channel.name,
          id,
          pins: res.data.pins
        }
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
  messages: {
    id: null,
    name: null,
    data: []
  },
  members: {
    id: null,
    name: null,
    data: []
  },
  pins: {
    id: null,
    name: null,
    data: []
  },
  nextMessage: '',
  nextMember: '',
  isLoading: false,
  error: null
}

export default function chatReducer (state = initialState, action) {
  const immutable = immutee(state);
  switch (action.type) {

    case 'SET_CHANNEL':
      return immutable
      .set('channelOpened', action.payload)
      .done()

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

    // case CHANNEL_OPENED:
    //   return immutable
    //   .set('messages.name', action.name)
    //   .set('messages.id', action.id)
    //   .set('messages.data', action.messages)
    //   .set('nextMessage', action.next)
    //   .done()

    case CHANNEL_MEMBERS:
      return immutable
      .set('members.name', action.name)
      .set('members.id', action.id)
      .set('members.data', action.members)
      .set('nextMember', action.next)
      .done()

    // case APPEND_MESSAGE:
    //   return immutable
    //   .merge('messages.data', action.messages)
    //   .set('nextMessage', action.next)
    //   .done()

    case APPEND_MEMBERS:
      return immutable
      .merge('members.data', action.members)
      .set('nextMember', action.next)
      .done()

    case CHANNEL_PINS:
      return immutable
      .set('pins.name', action.name)
      .set('pins.id', action.id)
      .set('pins.data', action.pins)
      .done()

    default:
      return state;
  }
}
