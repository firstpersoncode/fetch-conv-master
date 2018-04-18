import immutee from 'immutee'
import axios from 'axios'

import {
  miner_endpoint_db
} from '../../constants'

export const VALIDATE_START = 'micro/channel/VALIDATE/CHANNELS/START'
export const VALIDATE_SUCCESS = 'micro/channel/VALIDATE/CHANNELS/SUCCESS'
export const VALIDATE_FAILED = 'micro/channel/VALIDATE/CHANNELS/FAILED'

export const FETCH_START = 'micro/channel/FETCH/CHANNELS/START'
export const FETCH_SUCCESS = 'micro/channel/FETCH/CHANNELS/SUCCESS'
export const FETCH_FAILED = 'micro/channel/FETCH/CHANNELS/FAILED'

export const FETCH_CHANNEL_PUBLIC = 'micro/channel/FETCH/CHANNELS/PUBLIC'
export const FETCH_CHANNEL_PRIVATE = 'micro/channel/FETCH/CHANNELS/PRIVATE'

export const FETCH_INFO_PUBLIC = 'micro/channel/FETCH/INFO/PUBLIC'
export const FETCH_INFO_PRIVATE = 'micro/channel/FETCH/INFO/PRIVATE'


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

export function fetchChannel (endpoint, op) {
  let options = {
    is_private: false
  }

  options = {
    ...options,
    ...op
  }
  return (dispatch) => {
    return axios.post(miner_endpoint_db + '/query' + (endpoint ? '/' + endpoint : ''), options)
    .then(res => {
      if (res.status < 201) {
        return res.data
      } else if (res.status > 201 && res.status < 305) {
        return res.data
      } else {
        throw new Error('Error fetch data from db: ' + JSON.stringify(res, null, '\t'))
      }
    })
    .catch(err => {
      console.error(err)
    })
  }
}

export function collect (data, endpoint) {
  return (dispatch) => {
    return axios.post(miner_endpoint_db + '/collect' + (endpoint ? '/' + endpoint : ''), {
      data
    })
    .then(res => {
      if (res.data.status) {
        return res.data.status
      } else {
        throw new Error('Failed add channel to db: ' + JSON.stringify(res, null, '\t'))
      }
    })
    .catch(err => {
      console.error(err)
    })
  }
}

const initialState = {
  channels: {
    public: [],
    private: []
  },
  next: {
    public: '',
    private: ''
  },
  isLoading: false,
  error: null
};

export default function channelDBReducer (state = initialState, action) {
  const immutable = immutee(state);
  switch (action.type) {

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

    case FETCH_INFO_PUBLIC:
      return immutable
      .set('channels.public', action.payload)
      .done();

    case FETCH_INFO_PRIVATE:
      return immutable
      .set('channels.private', action.payload)
      .done();

    default:
      return state;
  }
}
