import React from 'react'

const TestFc = () => {
  return (
    <div>
      <span>222</span>
      <span>
        <React.Fragment>
          <span>111</span>
          <span>222</span>
        </React.Fragment>
      </span>
    </div>
  )
}
