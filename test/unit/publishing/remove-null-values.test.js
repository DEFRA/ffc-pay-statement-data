const removeNullValues = require('../../../app/publishing/remove-null-values')

describe('create message', () => {
  test('does not remove strings', () => {
    const obj = {
      p1: '1'
    }
    const result = removeNullValues(obj)
    expect(result).toStrictEqual(obj)
  })

  test('does not remove numbers', () => {
    const obj = {
      p1: 1
    }
    const result = removeNullValues(obj)
    expect(result).toStrictEqual(obj)
  })

  test('does not remove true', () => {
    const obj = {
      p1: true
    }
    const result = removeNullValues(obj)
    expect(result).toStrictEqual(obj)
  })

  test('does not remove false', () => {
    const obj = {
      p1: false
    }
    const result = removeNullValues(obj)
    expect(result).toStrictEqual(obj)
  })

  test('does not remove 0', () => {
    const obj = {
      p1: 0
    }
    const result = removeNullValues(obj)
    expect(result).toStrictEqual(obj)
  })

  test('does remove undefined', () => {
    const obj = {
      p1: undefined
    }
    const result = removeNullValues(obj)
    expect(result).toStrictEqual({})
  })

  test('does remove null', () => {
    const obj = {
      p1: null
    }
    const result = removeNullValues(obj)
    expect(result).toStrictEqual({})
  })

  test('does not amend empty', () => {
    const obj = {}
    const result = removeNullValues(obj)
    expect(result).toStrictEqual(obj)
  })
})
