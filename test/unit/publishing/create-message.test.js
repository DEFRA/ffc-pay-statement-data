const createMessage = require('../../../app/publishing/create-message')

describe('create message', () => {
  test('includes body', () => {
    const body = {
      content: 'hello'
    }
    const type = 'message'
    const result = createMessage(body, type)
    expect(result.body).toStrictEqual(body)
  })
})
