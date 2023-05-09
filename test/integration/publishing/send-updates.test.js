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
    publishingConfig.dataPublishingMaxBatchSize = 5
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await db.sequelize.truncate({ cascade: true })
  })

  afterAll(async () => {
    await db.sequelize.close()
  })

  describe('When there are less calculation records than publishingConfig.dataPublishingMaxBatchSize and 0 organisation records', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = -1 + publishingConfig.dataPublishingMaxBatchSize
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

  describe('When there are 0 calculation records and less organisation records than publishingConfig.dataPublishingMaxBatchSize', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = 0
      numberOfRecordsOrganisation = -1 + publishingConfig.dataPublishingMaxBatchSize
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

  describe('When there are less calculation records than publishingConfig.dataPublishingMaxBatchSize and less organisation records than publishingConfig.dataPublishingMaxBatchSize both totaling less records than publishingConfig.dataPublishingMaxBatchSize', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = -1 + Math.floor(publishingConfig.dataPublishingMaxBatchSize / 2)
      numberOfRecordsOrganisation = -1 + Math.floor(publishingConfig.dataPublishingMaxBatchSize / 2)
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecordsOrganisation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecords).toBeLessThan(publishingConfig.dataPublishingMaxBatchSize)

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

    test('should process all calculation and organisation records', async () => {
      const unpublishedBeforeCalculation = await db.calculation.findAll({ where: { published: null } })
      const unpublishedBeforeOrganisation = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfterCalculation = await db.calculation.findAll({ where: { published: null } })
      const unpublishedAfterOrganisation = await db.organisation.findAll({ where: { published: null } })

      expect(unpublishedBeforeCalculation).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedBeforeOrganisation).toHaveLength(numberOfRecordsOrganisation)
      expect(unpublishedAfterCalculation).toHaveLength(0)
      expect(unpublishedAfterOrganisation).toHaveLength(0)
    })
  })

  describe('When there are less calculation records than publishingConfig.dataPublishingMaxBatchSize and less organisation records than publishingConfig.dataPublishingMaxBatchSize both totaling publishingConfig.dataPublishingMaxBatchSize', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = -1 + Math.floor(publishingConfig.dataPublishingMaxBatchSize / 2)
      numberOfRecordsOrganisation = 1 + Math.ceil(publishingConfig.dataPublishingMaxBatchSize / 2)
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecordsOrganisation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecords).toEqual(publishingConfig.dataPublishingMaxBatchSize)

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
  })

  describe('When there are less calculation records than publishingConfig.dataPublishingMaxBatchSize and less organisation records than publishingConfig.dataPublishingMaxBatchSize both totaling more than publishingConfig.dataPublishingMaxBatchSize', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = Math.floor(publishingConfig.dataPublishingMaxBatchSize / 2)
      numberOfRecordsOrganisation = 1 + Math.ceil(publishingConfig.dataPublishingMaxBatchSize / 2)
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecordsOrganisation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecords).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSize)

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
  })

  describe('When there are more calculation records than publishingConfig.dataPublishingMaxBatchSize and less organisation records than publishingConfig.dataPublishingMaxBatchSize both totaling more than publishingConfig.dataPublishingMaxBatchSize', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = 2 + publishingConfig.dataPublishingMaxBatchSize
      numberOfRecordsOrganisation = -1 + publishingConfig.dataPublishingMaxBatchSize
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecordsOrganisation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecords).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSize)

      await db.calculation.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      await db.organisation.bulkCreate([...Array(numberOfRecordsOrganisation).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
    })

    test('should call sendMessage publishingConfig.dataPublishingMaxBatchSize + numberOfRecordsOrganisation times', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(publishingConfig.dataPublishingMaxBatchSize + numberOfRecordsOrganisation)
    })

    test('should call sendMessage with publishingConfig.dataPublishingMaxBatchSize calculation messages and numberOfRecordsOrganisation organisation messages', async () => {
      await publish()

      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.calculation')).toHaveLength(publishingConfig.dataPublishingMaxBatchSize)
      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.organisation')).toHaveLength(numberOfRecordsOrganisation)
    })
  })

  describe('When there are less calculation records than publishingConfig.dataPublishingMaxBatchSize and more organisation records than publishingConfig.dataPublishingMaxBatchSize both totaling more than publishingConfig.dataPublishingMaxBatchSize', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = -1 + publishingConfig.dataPublishingMaxBatchSize
      numberOfRecordsOrganisation = 2 + publishingConfig.dataPublishingMaxBatchSize
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeLessThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecordsOrganisation).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecords).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSize)

      await db.calculation.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      await db.organisation.bulkCreate([...Array(numberOfRecordsOrganisation).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
    })

    test('should call sendMessage numberOfRecordsCalculation + publishingConfig.dataPublishingMaxBatchSize times', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecordsCalculation + publishingConfig.dataPublishingMaxBatchSize)
    })

    test('should call sendMessage with numberOfRecordsCalculation calculation messages and publishingConfig.dataPublishingMaxBatchSize messages', async () => {
      await publish()

      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.calculation')).toHaveLength(numberOfRecordsCalculation)
      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.organisation')).toHaveLength(publishingConfig.dataPublishingMaxBatchSize)
    })
  })

  describe('When there are more calculation records than publishingConfig.dataPublishingMaxBatchSize and more organisation records than publishingConfig.dataPublishingMaxBatchSize both totaling more than publishingConfig.dataPublishingMaxBatchSize', () => {
    let numberOfRecordsCalculation
    let numberOfRecordsOrganisation
    let numberOfRecords

    beforeEach(async () => {
      numberOfRecordsCalculation = 1 + publishingConfig.dataPublishingMaxBatchSize
      numberOfRecordsOrganisation = 1 + publishingConfig.dataPublishingMaxBatchSize
      numberOfRecords = numberOfRecordsCalculation + numberOfRecordsOrganisation

      expect(numberOfRecordsCalculation).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecordsOrganisation).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSize)
      expect(numberOfRecords).toBeGreaterThan(publishingConfig.dataPublishingMaxBatchSize)

      await db.calculation.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecordsCalculation).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      await db.organisation.bulkCreate([...Array(numberOfRecordsOrganisation).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
    })

    test('should call sendMessage 2 * publishingConfig.dataPublishingMaxBatchSize times', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(2 * publishingConfig.dataPublishingMaxBatchSize)
    })

    test('should call sendMessage with publishingConfig.dataPublishingMaxBatchSize calculation messages and publishingConfig.dataPublishingMaxBatchSize messages', async () => {
      await publish()

      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.calculation')).toHaveLength(publishingConfig.dataPublishingMaxBatchSize)
      expect(mockSendMessage.mock.calls.filter(call => call[0].type === 'uk.gov.pay.statement.data.organisation')).toHaveLength(publishingConfig.dataPublishingMaxBatchSize)
    })
  })
})
