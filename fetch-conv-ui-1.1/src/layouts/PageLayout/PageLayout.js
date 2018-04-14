import React from 'react'
import PropTypes from 'prop-types'
import CssBaseline from 'material-ui/CssBaseline'
import './PageLayout.scss'
import Footer from '../../components/Footer'
import Wrapper from '../../components/Wrapper'

export const PageLayout = ({ children }) => (
  <div className='text-center'>
    <CssBaseline />
    <Wrapper>
      <div className='page-layout__viewport'>
        {children}
      </div>
    </Wrapper>
    <Footer />
  </div>
)

PageLayout.propTypes = {
  children: PropTypes.node,
}

export default PageLayout
