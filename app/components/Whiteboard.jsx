import React, { Component } from 'react'
import ReactDOM from 'react-dom'

const _ = require('lodash')
const fp = require('lodash/fp')
const object = require('lodash/fp/object')

const MYSCRIPT_APP_KEY = require('../../tokens.json').MYSCRIPT_APP_KEY
const MYSCRIPT_HMAC_KEY = require('../../tokens.json').MYSCRIPT_HMAC_KEY

export default class Whiteboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inputText: ''
    }
  }

  componentDidMount() {
    const textInput = document.getElementById('textInput')
    console.log('TEXT INPUT: ', textInput)
    textInput.addEventListener('myscript-text-web-result', function(e) {
      const inputTextPath = _.get(e, 'detail.result.textSegmentResult.candidates[0].label', 'not found, default')
      console.log('IS THIS OUR RESULT???', inputTextPath)
      // console.log('WHAT IS RESULT PATH', e.detail.result)
    })
  }

  render() {
    console.log('IS THIS PROCESS? ', process.env)
    return (
      <div id="myScript">
        <myscript-text-web id="textInput"
          applicationkey={MYSCRIPT_APP_KEY}
          hmackey={MYSCRIPT_HMAC_KEY}
          language="en_US"
          recognitioncandidates="1"></myscript-text-web>
      </div>
    )
  }
}
