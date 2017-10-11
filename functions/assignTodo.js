const admin = require('firebase-admin')
const db = admin.database()
const stringSimilarity = require('string-similarity')

module.exports = (data) => {
  const { result: { parameters: { task, person } }, sessionId } = data
  
  if (task && person)
    return db.ref('users').once('value')
    .then(snapshot => {
      const keys = Object.keys(snapshot.val())
      const userNames = keys.map(key => snapshot.val()[key].name)

      const similarityScore = userNames.map(name => stringSimilarity.compareTwoStrings(person, name))
      const bestMatch = similarityScore.reduce((prev, next) => next > prev ? next : prev)

      if (bestMatch > 0.6) {
        const index = similarityScore.indexOf(bestMatch)
        return db.ref(`rooms/${sessionId}/minnie/todo`).push({
          task,
          userId: keys[index],
          userName: userNames[index],
          timestamp: Date.now()
        })
      } else {
        return Promise.resolve({
          userUndefined: true,
          name: person
        })
      }
    })
}