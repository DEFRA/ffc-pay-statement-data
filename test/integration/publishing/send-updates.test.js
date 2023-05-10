const mockSendMessage = jest.fn()
const mockCloseConnection = jest.fn()
jest.mock('ffc-messaging', () => {
  return {
    MessageSender: jest.fn().mockImplementation(() => {
      return {
        sendMessage: mockSendMessage,
        closeConnection: mockCloseConnection
      }
    })
  }
})

const { publishingConfig } = require('../../../app/config')
const db = require('../../../app/data')

const publish = require('../../../app/publishing')

const { mockCalculation1 } = require('../../mocks/calculation')
const { mockFunding1 } = require('../../mocks/funding')
const { mockOrganisation1 } = require('../../mocks/organisation')

describe('send calculation and organisation updates', () => {
  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date(2022, 7, 5, 15, 30, 10, 120))
    publishingConfig.dataPublishingMaxBatchSizePerDataSource = 5
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await db.sequelize.truncate({ cascade: true })
  })

  afterAll(async () => {
    await db.sequelize.close()
  })

  describe('When there are less calculation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource and 0 organisation records', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = -1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      numberOfRecordsOrganisation = 0
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      await db.calculation.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
    })

    test('should call sendMessage numberOfRecords times', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecords)
    })

    test('should call sendMessage with numberOfRecordsCalculation calculation messages and numberOfRecordsOrganisation organisation messages', async () => {
      await publish()

      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.calculation')).toHaveLength(numberOfRecordsCalculation)
      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.organisation')).toHaveLength(numberOfRecordsOrganisation)
    })

    test('should process all calculation records', async () => {
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should process all organisation records', async () => {
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.organisation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsOrganisation)
      expect(unpublishedAfter).toHaveLength(0)
    })
  })

  describe('When there are 0 calculation records and less organisation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = 0
      numberOfRecordsOrganisation = -1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      await db.organisation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
    })

    test('should call sendMessage numberOfRecords times', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecords)
    })

    test('should call sendMessage with numberOfRecordsCalculation calculation messages and numberOfRecordsOrganisation organisation messages', async () => {
      await publish()

      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.calculation')).toHaveLength(numberOfRecordsCalculation)
      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.organisation')).toHaveLength(numberOfRecordsOrganisation)
    })

    test('should process all calculation records', async () => {
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should process all organisation records', async () => {
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.organisation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsOrganisation)
      expect(unpublishedAfter).toHaveLength(0)
    })
  })

  describe('When there are less calculation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource and less organisation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource both totaling less records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = -1 + Math.floor(publishingConfig.dataPublishingMaxBatchSizePerDataSource / 2)
      numberOfRecordsOrganisation = -1 + Math.floor(publishingConfig.dataPublishingMaxBatchSizePerDataSource / 2)
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecordsOrganisation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecords).toBeLessThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)

      await db.calculation.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      await db.organisation.bulkCreate([...Array(numberOfRecordsOrganisation).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
    })

    test('should call sendMessage numberOfRecords times', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecords)
    })

    test('should call sendMessage with numberOfRecordsCalculation calculation messages and numberOfRecordsOrganisation organisation messages', async () => {
      await publish()

      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.calculation')).toHaveLength(numberOfRecordsCalculation)
      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.organisation')).toHaveLength(numberOfRecordsOrganisation)
    })

    test('should process all calculation records', async () => {
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should process all organisation records', async () => {
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.organisation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsOrganisation)
      expect(unpublishedAfter).toHaveLength(0)
    })
  })

  describe('When there are less calculation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource and less organisation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource both totaling publishingConfig.dataPublishingMaxBatchSizePerDataSource', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = -1 + Math.floor(publishingConfig.dataPublishingMaxBatchSizePerDataSource / 2)
      numberOfRecordsOrganisation = 1 + Math.ceil(publishingConfig.dataPublishingMaxBatchSizePerDataSource / 2)
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecordsOrganisation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecords).toEqual(publishingConfig.dataPublishingMaxBatchSizePerDataSource)

      await db.calculation.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      await db.organisation.bulkCreate([...Array(numberOfRecordsOrganisation).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
    })

    test('should call sendMessage numberOfRecords times', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecords)
    })

    test('should call sendMessage with numberOfRecordsCalculation calculation messages and numberOfRecordsOrganisation organisation messages', async () => {
      await publish()

      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.calculation')).toHaveLength(numberOfRecordsCalculation)
      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.organisation')).toHaveLength(numberOfRecordsOrganisation)
    })

    test('should process all calculation records', async () => {
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should process all organisation records', async () => {
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.organisation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsOrganisation)
      expect(unpublishedAfter).toHaveLength(0)
    })
  })

  describe('When there are less calculation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource and less organisation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource both totaling more than publishingConfig.dataPublishingMaxBatchSizePerDataSource', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = Math.floor(publishingConfig.dataPublishingMaxBatchSizePerDataSource / 2)
      numberOfRecordsOrganisation = 1 + Math.ceil(publishingConfig.dataPublishingMaxBatchSizePerDataSource / 2)
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecordsOrganisation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecords).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)

      await db.calculation.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      await db.organisation.bulkCreate([...Array(numberOfRecordsOrganisation).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
    })

    test('should call sendMessage numberOfRecords times', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecords)
    })

    test('should call sendMessage with numberOfRecordsCalculation calculation messages and numberOfRecordsOrganisation organisation messages', async () => {
      await publish()

      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.calculation')).toHaveLength(numberOfRecordsCalculation)
      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.organisation')).toHaveLength(numberOfRecordsOrganisation)
    })

    test('should process all calculation records', async () => {
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should process all organisation records', async () => {
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.organisation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsOrganisation)
      expect(unpublishedAfter).toHaveLength(0)
    })
  })

  describe('When there are more calculation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource and less organisation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource both totaling more than publishingConfig.dataPublishingMaxBatchSizePerDataSource', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = 2 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      numberOfRecordsOrganisation = -1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecordsOrganisation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecords).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)

      await db.calculation.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      await db.organisation.bulkCreate([...Array(numberOfRecordsOrganisation).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
    })

    test('should call sendMessage publishingConfig.dataPublishingMaxBatchSizePerDataSource + numberOfRecordsOrganisation times', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(publishingConfig.dataPublishingMaxBatchSizePerDataSource + numberOfRecordsOrganisation)
    })

    test('should call sendMessage with publishingConfig.dataPublishingMaxBatchSizePerDataSource calculation messages and numberOfRecordsOrganisation organisation messages', async () => {
      await publish()

      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.calculation')).toHaveLength(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.organisation')).toHaveLength(numberOfRecordsOrganisation)
    })

    test('should process publishingConfig.dataPublishingMaxBatchSizePerDataSource calculation records', async () => {
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedAfter).toHaveLength(numberOfRecordsCalculation - publishingConfig.dataPublishingMaxBatchSizePerDataSource)
    })

    test('should process all organisation records', async () => {
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.organisation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsOrganisation)
      expect(unpublishedAfter).toHaveLength(0)
    })
  })

  describe('When there are less calculation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource and more organisation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource both totaling more than publishingConfig.dataPublishingMaxBatchSizePerDataSource', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = -1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      numberOfRecordsOrganisation = 2 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecordsOrganisation).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecords).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)

      await db.calculation.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      await db.organisation.bulkCreate([...Array(numberOfRecordsOrganisation).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
    })

    test('should call sendMessage numberOfRecordsCalculation + publishingConfig.dataPublishingMaxBatchSizePerDataSource times', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecordsCalculation + publishingConfig.dataPublishingMaxBatchSizePerDataSource)
    })

    test('should call sendMessage with numberOfRecordsCalculation calculation messages and publishingConfig.dataPublishingMaxBatchSizePerDataSource messages', async () => {
      await publish()

      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.calculation')).toHaveLength(numberOfRecordsCalculation)
      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.organisation')).toHaveLength(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
    })

    test('should process all calculation records', async () => {
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should process all organisation records', async () => {
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.organisation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsOrganisation)
      expect(unpublishedAfter).toHaveLength(numberOfRecordsOrganisation - publishingConfig.dataPublishingMaxBatchSizePerDataSource)
    })
  })

  describe('When there are more calculation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource and more organisation records than publishingConfig.dataPublishingMaxBatchSizePerDataSource both totaling more than publishingConfig.dataPublishingMaxBatchSizePerDataSource', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = 1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      numberOfRecordsOrganisation = 1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecordsOrganisation).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(numberOfRecords).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSizePerDataSource)

      await db.calculation.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      await db.organisation.bulkCreate([...Array(numberOfRecordsOrganisation).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
    })

    test('should call sendMessage 2 * publishingConfig.dataPublishingMaxBatchSizePerDataSource times', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(2 * publishingConfig.dataPublishingMaxBatchSizePerDataSource)
    })

    test('should call sendMessage with publishingConfig.dataPublishingMaxBatchSizePerDataSource calculation messages and publishingConfig.dataPublishingMaxBatchSizePerDataSource messages', async () => {
      await publish()

      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.calculation')).toHaveLength(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.organisation')).toHaveLength(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
    })

    test('should process publishingConfig.dataPublishingMaxBatchSizePerDataSource calculation records', async () => {
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedAfter).toHaveLength(numberOfRecordsCalculation - publishingConfig.dataPublishingMaxBatchSizePerDataSource)
    })

    test('should process publishingConfig.dataPublishingMaxBatchSizePerDataSource organisation records', async () => {
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.organisation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsOrganisation)
      expect(unpublishedAfter).toHaveLength(numberOfRecordsOrganisation - publishingConfig.dataPublishingMaxBatchSizePerDataSource)
    })
  })
})
