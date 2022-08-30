const { ORGANISATION, CALCULATION } = require('../../../app/publishing/types')
const validateUpdate = require('../../../app/publishing/validate-update')
const { mockCalculation1 } = require('../../mocks/calculation')
const { mockFunding1 } = require('../../mocks/funding')
const { mockOrganisation1 } = require('../../mocks/organisation')
let organisation
let calculation
let funding

describe('validate update', () => {
  beforeEach(() => {
    organisation = JSON.parse(JSON.stringify(mockOrganisation1))
    organisation.type = ORGANISATION
    calculation = JSON.parse(JSON.stringify(mockCalculation1))
    funding = JSON.parse(JSON.stringify(mockFunding1))
    calculation.calculationReference = calculation.calculationId
    calculation.type = CALCULATION
    calculation.fundings = [funding]
    delete calculation.calculationId
    delete funding.fundingId
    delete funding.calculationId
  })

  test('returns true if valid organisation', () => {
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeTruthy()
  })

  test('returns true if missing organisation address line 1', () => {
    delete organisation.addressLine1
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeTruthy()
  })

  test('returns true if missing organisation address line 2', () => {
    delete organisation.addressLine2
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeTruthy()
  })

  test('returns true if missing organisation address line 3', () => {
    delete organisation.addressLine3
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeTruthy()
  })

  test('returns true if missing organisation city', () => {
    delete organisation.city
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeTruthy()
  })

  test('returns true if missing organisation county', () => {
    delete organisation.county
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeTruthy()
  })

  test('returns false if missing organisation name', () => {
    delete organisation.name
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing organisation sbi', () => {
    delete organisation.sbi
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing organisation frn', () => {
    delete organisation.frn
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing organisation postcode', () => {
    delete organisation.postcode
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing organisation email address', () => {
    delete organisation.emailAddress
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing organisation type', () => {
    delete organisation.type
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing organisation updated', () => {
    delete organisation.updated
    const result = validateUpdate(organisation, ORGANISATION)
    expect(result).toBeFalsy()
  })

  test('returns true if valid calculation', () => {
    const result = validateUpdate(calculation, CALCULATION)
    expect(result).toBeTruthy()
  })

  test('returns false if missing calculation reference', () => {
    delete calculation.calculationReference
    const result = validateUpdate(calculation, CALCULATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing calculation sbi', () => {
    delete calculation.sbi
    const result = validateUpdate(calculation, CALCULATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing calculation frn', () => {
    delete calculation.frn
    const result = validateUpdate(calculation, CALCULATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing calculation date', () => {
    delete calculation.calculationDate
    const result = validateUpdate(calculation, CALCULATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing calculation type', () => {
    delete calculation.type
    const result = validateUpdate(calculation, CALCULATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing calculation updated', () => {
    delete calculation.updated
    const result = validateUpdate(calculation, CALCULATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing calculation fundings', () => {
    delete calculation.fundings
    const result = validateUpdate(calculation, CALCULATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing calculation funding code', () => {
    delete funding.fundingCode
    const result = validateUpdate(calculation, CALCULATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing calculation funding area', () => {
    delete funding.areaClaimed
    const result = validateUpdate(calculation, CALCULATION)
    expect(result).toBeFalsy()
  })

  test('returns false if missing calculation funding rate', () => {
    delete funding.rate
    const result = validateUpdate(calculation, CALCULATION)
    expect(result).toBeFalsy()
  })
})
