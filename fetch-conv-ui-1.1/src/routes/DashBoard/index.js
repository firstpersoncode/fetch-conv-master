// import { injectReducer } from '../../store/reducers'
import { statusCheck } from '../../store/user'
export default (store) => ({
  path : 'dashboard',
  /*  Async getComponent is only invoked when route matches   */
  onEnter: (nextState, replace, cb) => {
    store.dispatch(statusCheck('identity'))
    .then(res => {
      if (res) {
        return store.dispatch(statusCheck('workspace'))
      } else {
        throw res
      }
    })
    .then(res => {
      if (res) {
        cb()
      } else {
        throw res
      }
    })
    .catch(err => {
      console.error(err)
      replace('/')
      cb()
    })
  },

  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
          dependencies for bundling   */
      const DashBoard = require('./containers/DashBoard').default
      // const reducer = require('./modules/login').default

      /*  Add the reducer to the store on key 'counter'  */
      // injectReducer(store, { key: 'login', reducer })

      /*  Return getComponent   */
      cb(null, DashBoard)

    /* Webpack named bundle   */
    }, 'dashboard')
  }
})
