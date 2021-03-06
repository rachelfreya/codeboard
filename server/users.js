'use strict'

const db = require('APP/db')
const User = db.model('users')
const UserQuestion = db.model('users_questions')
const Question = db.model('questions')
const Category = db.model('categories')
const Difficulty = db.model('difficulties')

const {mustBeLoggedIn, forbidden} = require('./auth.filters')

module.exports = require('express').Router()
  .get('/',
    // The forbidden middleware will fail *all* requests to list users.
    // Remove it if you want to allow anyone to list all users on the site.
    //
    // If you want to only let admins list all the users, then you'll
    // have to add a role column to the users table to support
    // the concept of admin users.
    forbidden('listing users is not allowed'),
    (req, res, next) =>
      User.findAll()
        .then(users => res.json(users))
        .catch(next))
  .post('/',
    (req, res, next) =>
      User.create(req.body)
      .then(user => res.status(201).json(user))
      .catch(next))
  .get('/:id',
    mustBeLoggedIn,
    (req, res, next) =>
      UserQuestion.findAll({
        attributes: ['status', 'user_id', 'question_id'],
        where: {
          user_id: req.params.id
        },
        include: [
          { model: Question,
            include: [Category, Difficulty] }
        ],
        order: [
        [ Question, 'name', 'ASC' ]
        ]
      })
      .then(userQuestions => {
        res.json(userQuestions)
      })
      .catch(next))
    .post('/:uId/question/:qId',
      mustBeLoggedIn,
      (req, res, next) =>
      UserQuestion.findOne({
        where: {
          user_id: req.params.uId,
          question_id: req.params.qId
        }
      })
      .then(entry => (
        entry ? entry.update(req.body) : UserQuestion.create(req.body)
      )
      .then(entry =>
        UserQuestion.findOne({where: {
          user_id: req.params.uId,
          question_id: req.params.qId
        },
          include: [
            { model: Question, include: [Category, Difficulty] }
          ]
        }))
      .then(userQuestions => {
        res.json(userQuestions)
      }))
      .catch(next))
    .put('/:id', mustBeLoggedIn,
      (req, res, next) =>
      User.findById(req.params.id)
      .then(user => (user.update({ name: req.body.name, email: req.body.email })))
      .then(user => res.json(user))
      .catch(next))
