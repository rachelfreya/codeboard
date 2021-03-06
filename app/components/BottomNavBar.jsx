/* global SpeechSynthesisUtterance Event mocha draws */
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { set } from '../reducers/drawer'
import LeftDrawer from './LeftDrawer'

import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation'
import Paper from 'material-ui/Paper'
import Dialog from 'material-ui/Dialog'
import Snackbar from 'material-ui/Snackbar'
import IconLocationOn from 'material-ui/svg-icons/communication/location-on'
import Save from 'material-ui/svg-icons/content/save'
import Play from 'material-ui/svg-icons/av/play-arrow'
import Help from 'material-ui/svg-icons/action/help'
import RightArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right'
import Repeat from 'material-ui/svg-icons/action/record-voice-over'
import QuestionList from 'material-ui/svg-icons/action/list'
import Solutions from 'material-ui/svg-icons/action/lock-open'
import Hint from 'material-ui/svg-icons/action/lightbulb-outline'
import FlatButton from 'material-ui/FlatButton'
import {List, ListItem} from 'material-ui/List'

const list = <QuestionList />
const save = <Save />
const play = <Play />
const help = <Help />
const repeat = <Repeat />
const solutions = <Solutions />
const hints = <Hint />
const arrow = <RightArrow />
const helpTopics = [
    {topic: 'Click on the arrows at the top of the page to expand or hide the text editor and whiteboard', icon: arrow},
    {topic: 'Click "Repeat Question" to hear the prompt again. You can have the question repeated only once.', icon: repeat},
    {topic: 'Click "Hints" to hear a hint. There are a limited number of hints per question.', icon: hints},
    {topic: 'Click "Run Code" to test your solution.', icon: play},
    {topic: 'If you are logged in, you can click "Save" to save your work.', icon: save},
    {topic: 'Click "Show Solutions" to see a set of possible solutions and their space/time complexity.', icon: solutions}
]

class BottomNavBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedIndex: 1,
      prompt: '',
      spoken: false,
      currentHintIdx: 0,
      snackbar: false,
      solutionText: 'Show Solutions',
      helpDialog: false,
      questionStatus: 'pending'
    }
  }
  repeatQuestion = (voice, words) => {
    this.select(1)
    if (!this.state.spoken) {
      this.speak(voice, words)
      this.setState({
        spoken: true
      })
    }
  }

  giveHint = (voice, hint) => {
    this.select(2)
    this.speak(voice, hint)
    this.setState({
      currentHintIdx: this.state.currentHintIdx + 1
    })
  }

  speak = (voice, words) => voice.speak(words)
  select = (index) => this.setState({selectedIndex: index})
  reset = () => this.setState({ prompt: '' })

  runTests = () => mocha.run()

  checkTests = () => {
    try {
      const mochaTests = mocha.suite.suites[0].tests
      for (let i = 0; i < mochaTests.length; i++) {
        if (mochaTests[i].state === 'failed') {
          this.setState({
            prompt: mochaTests[i].title
          }, this.reset)
          return
        }
      }
      this.setState({
        prompt: 'Congrats, you passed all of the tests',
        questionStatus: 'complete'
      }, this.reset)
    } catch (err) {
      this.setState({
        prompt: 'Please run the code again.'
      }, this.reset)
    }
  }

  resetTests = () => {
    mocha.suite.suites = []
    let testSpecs = document.getElementById('testSpecs')
    if (testSpecs) testSpecs.remove()
    const tests = this.props.question.tests
    testSpecs = document.createElement('script')
    testSpecs.src = `/questions-specs/${tests}`
    testSpecs.async = true
    testSpecs.id = 'testSpecs'
    document.body.appendChild(testSpecs)
  }

  handlePlay = () => {
    try {
      // Delete previous mocha stats / reports if they exist
      const mochaDiv = document.getElementById('mocha')
      const mochaStats = document.getElementById('mocha-stats')
      const mochaReport = document.getElementById('mocha-report')
      if (mochaStats) mochaDiv.removeChild(mochaStats)
      if (mochaReport) mochaDiv.removeChild(mochaReport)
      // Create or Update the user's code on the DOM
      this.props.userCode()
      // Run the mocha / chai tests
      this.runTests()
      // Check the tests
      setTimeout(this.checkTests, 300)
      // Reset the tests
      setTimeout(this.resetTests, 1000)
    } catch (err) {
      this.setState({ prompt: 'Please write a valid function' }, this.reset)
    }
  }

  handleEditorSave = () => {
    this.props.handleSave(this.state.questionStatus)
    this.setState({ snackbar: true })
  }

  handleClose = () => this.setState({ snackbar: false })
  handleHelp = () => this.setState({ helpDialog: !this.state.helpDialog })

  handleSolutions = () => {
    const solutionText = this.state.solutionText
    if (solutionText === 'Show Solutions') {
      this.setState({ solutionText: 'Hide Solutions' })
      document.getElementById('edit').className = 'col-sm-6 colEdit'
      document.getElementById('wb').className = 'col-hide colWB'
      document.getElementById('sol').className = 'col-sm-6 colSol'
    } else {
      this.setState({ solutionText: 'Show Solutions' })
      document.getElementById('edit').className = 'col-sm-6 colEdit'
      document.getElementById('wb').className = 'col-sm-6 colWB'
      document.getElementById('sol').className = 'col-hide colSol'
    }
  }

  render() {
    const voice = window.speechSynthesis
    const voices = voice.getVoices()
    const currentHintIdx = this.state.currentHintIdx
    const words = new SpeechSynthesisUtterance(this.props.question.text)
    words.voice = voices.filter((voice) => voice.name === 'Samantha')[0]
    const currentHint = !this.props.question.hints ? '' : (this.props.question.hints[currentHintIdx] ? this.props.question.hints[currentHintIdx].text : 'You are out of hints')
    const hint = new SpeechSynthesisUtterance(currentHint)
    hint.voice = voices.filter((voice) => voice.name === 'Samantha')[0]
    const prompt = new SpeechSynthesisUtterance(this.state.prompt)
    prompt.voice = voices.filter((voice) => voice.name === 'Samantha')[0]
    voice.speak(prompt)
    const user = this.props.auth
    const actions = [
      <FlatButton
        label="Exit"
        primary={true}
        onTouchTap={this.handleHelp}
      />
    ]
    if (user) {
      return (
        <div>
          <LeftDrawer />
          <Paper zDepth={1}>
            <BottomNavigation selectedIndex={this.state.selectedIndex} >
              <BottomNavigationItem
                label="New Question"
                icon={list}
                onTouchTap={this.props.set}
              />
              <BottomNavigationItem
                label="Repeat Question"
                icon={repeat}
                onTouchTap={() => this.repeatQuestion(voice, words)}
              />
              <BottomNavigationItem
                label="Hints"
                icon={hints}
                onTouchTap={() => this.giveHint(voice, hint) }
              />
              <BottomNavigationItem
                label="Run Code"
                icon={play}
                onClick={this.handlePlay}
                onTouchTap={() => this.select(3)}
              />
              <BottomNavigationItem
                label="Save"
                icon={save}
                onClick={this.handleEditorSave}
                onTouchTap={() => this.select(4) }
                />
              <BottomNavigationItem
                label={this.state.solutionText}
                icon={solutions}
                onClick={this.handleSolutions}
                onTouchTap={() => this.select(5) }
                />
              <BottomNavigationItem
                label='Help'
                icon={help}
                onClick={this.handleHelp}
                onTouchTap={() => this.select(6) }
                />
            </BottomNavigation>
          </Paper>
          <Snackbar
            className="snackbar"
            open={this.state.snackbar}
            message="Code + Whiteboard Saved"
            autoHideDuration={2000}
            onRequestClose={this.handleClose}
          />
          <Dialog
            title="Help"
            actions={actions}
            onRequestClose={this.handleHelp}
            open={this.state.helpDialog}
            autoScrollBodyContent={true}
          >
            <List>
            {helpTopics.map(topic =>
              <ListItem
                key={topic.topic}
                primaryText={topic.topic}
                leftIcon={topic.icon}
                disabled={true}
                />
            )}
            </List>
          </Dialog>
      </div>
      )
    } else {
      return (
      <div>
        <LeftDrawer />
        <Paper zDepth={1}>
          <BottomNavigation selectedIndex={this.state.selectedIndex} >
            <BottomNavigationItem
              label="New Question"
              icon={list}
              onTouchTap={this.props.set}
            />
            <BottomNavigationItem
              label="Repeat Question"
              icon={repeat}
              onTouchTap={() => this.repeatQuestion(voice, words)}
            />
            <BottomNavigationItem
              label="Hints"
              icon={hints}
              onTouchTap={() => this.giveHint(voice, hint)}
            />
            <BottomNavigationItem
              label="Run Code"
              icon={play}
              onClick={this.handlePlay}
              onTouchTap={() => this.select(3)}
            />
            <BottomNavigationItem
              label={this.state.solutionText}
              icon={solutions}
              onClick={this.handleSolutions}
              onTouchTap={() => this.select(4) }
            />
            <BottomNavigationItem
              label='Help'
              icon={help}
              onClick={this.handleHelp}
              onTouchTap={() => this.select(5) }
            />
          </BottomNavigation>
        </Paper>
        <Dialog
          title="Help"
          actions={actions}
          onRequestClose={this.handleHelp}
          open={this.state.helpDialog}
          autoScrollBodyContent={true}
        >
          <List>
          {helpTopics.map(topic =>
            <ListItem
              key={topic.topic}
              primaryText={topic.topic}
              leftIcon={topic.icon}
              disabled={true} />
          )}
          </List>
        </Dialog>
      </div>
      )
    }
  }
}

const mapStateToProps = ({ question, auth, userQuestions }) =>
  ({ question, auth, userQuestions })
const mapDispatchToProps = ({ set })

export default connect(mapStateToProps, mapDispatchToProps)(BottomNavBar)
