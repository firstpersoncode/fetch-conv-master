import { combineReducers } from 'redux'
import locationReducer from './location'
import channelReducer from './channel'
import userReducer from './user'
import channelDBReducer from './microdb/channel'
import channelDetailReducer from '../routes/Channel/modules/channelDetail'
import dashboardReducer from '../routes/DashBoard/modules/dashboard'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    location: locationReducer,
    channel: channelReducer,
    user: userReducer,
    channelDetail: channelDetailReducer,
    channeldb: channelDBReducer,
    dashboard: dashboardReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
