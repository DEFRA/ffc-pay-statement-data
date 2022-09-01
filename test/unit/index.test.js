jest.mock('../../app/publishing')
const mockPublishing = require('../../app/publishing')

describe('app', () => {
  beforeEach(() => {
    require('../../app')
  })

  test('starts publishing', () => {
    expect(mockPublishing).toHaveBeenCalled()
  })
})
