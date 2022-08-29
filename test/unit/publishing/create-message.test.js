const createMessage = require('../../../app/publishing/create-message')
const body = {
  content: 'hello'
}
const type = 'message'

describe('create message', () => {
  test('includes type in body', () => {
    const result = createMessage(body, type)
    expect(result.body).toStrictEqual({ ...body, type })
  })

  test('includes type', () => {
    const result = createMessage(body, type)
    expect(result.type).toBe('uk.gov.pay.statement.data.message')
  })

  test('includes source', () => {
    const result = createMessage(body, type)
    expect(result.type).toBe('uk.gov.pay.statement.data.message')
  })
})
