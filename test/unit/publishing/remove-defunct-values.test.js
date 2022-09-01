const removeDefunctValues = require('../../../app/publishing/remove-defunct-values')

describe('create message', () => {
  test('does not remove strings', () => {
    const obj = {
      p1: '1'
    }
    const result = removeDefunctValues(obj)
    expect(result).toStrictEqual(obj)
  })

  test('does not remove numbers', () => {
    const obj = {
      p1: 1
    }
    const result = removeDefunctValues(obj)
    expect(result).toStrictEqual(obj)
  })

  test('does not remove true', () => {
    const obj = {
      p1: true
    }
    const result = removeDefunctValues(obj)
    expect(result).toStrictEqual(obj)
  })

  test('does not remove false', () => {
    const obj = {
      p1: false
    }
    const result = removeDefunctValues(obj)
    expect(result).toStrictEqual(obj)
  })

  test('does not remove 0', () => {
    const obj = {
      p1: 0
    }
    const result = removeDefunctValues(obj)
    expect(result).toStrictEqual(obj)
  })

  test('does remove undefined', () => {
    const obj = {
      p1: undefined
    }
    const result = removeDefunctValues(obj)
    expect(result).toStrictEqual({})
  })

  test('does remove null', () => {
    const obj = {
      p1: null
    }
    const result = removeDefunctValues(obj)
    expect(result).toStrictEqual({})
  })

  test('does remove function', () => {
    const obj = {
      p1: () => 1
    }
    const result = removeDefunctValues(obj)
    expect(result).toStrictEqual({})
  })

  test('does remove properties ending with Id', () => {
    const obj = {
      p1Id: 1
    }
    const result = removeDefunctValues(obj)
    expect(result).toStrictEqual({})
  })

  test('does not amend empty', () => {
    const obj = {}
    const result = removeDefunctValues(obj)
    expect(result).toStrictEqual(obj)
  })
})
