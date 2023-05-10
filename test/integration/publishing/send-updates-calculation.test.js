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

const { mockCalculation1, mockCalculation3 } = require('../../mocks/calculation')
const { mockFunding1, mockFunding3 } = require('../../mocks/funding')

describe('send calculation updates', () => {
  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date(2022, 7, 5, 15, 30, 10, 120))
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await db.sequelize.truncate({ cascade: true })
  })

  afterAll(async () => {
    await db.sequelize.close()
  })

  describe('When calculation is unpublished', () => {
    beforeEach(async () => {
      await db.calculation.create(mockCalculation1)
      await db.funding.create(mockFunding1)
    })

    test('should call sendMessage once', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(1)
    })

    test('should publish calculation reference', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.calculationReference).toBe(mockCalculation1.calculationId)
    })

    test('should publish calculation sbi', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.sbi).toBe(mockCalculation1.sbi)
    })

    test('should publish calculation frn', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.frn).toBe(mockCalculation1.frn.toString())
    })

    test('should publish invoice number', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.invoiceNumber).toBe(mockCalculation1.invoiceNumber)
    })

    test('should publish calculation scheme', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.scheme).toBe(mockCalculation1.scheme)
    })

    test('should publish calculation date', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.calculationDate).toBe(mockCalculation1.calculationDate.toISOString())
    })

    test('should publish calculation updated date', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.updated).toBe(mockCalculation1.updated.toISOString())
    })

    test('should publish funding', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.fundings.length).toBe(1)
    })

    test('should publish funding rate', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.fundings[0].rate).toBe(mockFunding1.rate.toFixed(6))
    })

    test('should publish funding code', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.fundings[0].fundingCode).toBe(mockFunding1.fundingCode)
    })

    test('should publish funding area claimed', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.fundings[0].areaClaimed).toBe(mockFunding1.areaClaimed.toFixed(4))
    })

    test('should not publish funding primary key', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.fundings[0].fundingId).toBeUndefined()
    })

    test('should publish type', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.type).toBe('calculation')
    })

    test('should not publish null published value', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.published).toBeUndefined()
    })

    test('should update published date', async () => {
      await publish()
      const calculation = await db.calculation.findByPk(1234567)
      expect(calculation.published).toStrictEqual(new Date(2022, 7, 5, 15, 30, 10, 120))
    })

    test('should call a console log with number of datasets published for calculation', async () => {
      const logSpy = jest.spyOn(global.console, 'log')
      await publish()
      expect(logSpy.mock.calls).toContainEqual(['%i %s datasets published', 1, 'calculation'])
    })

    test('should not publish same calculation on second run if record has not been updated', async () => {
      await publish()
      await publish()

      expect(mockSendMessage).toHaveBeenCalledTimes(1)
    })
  })

  describe('When calculation is unpublished and has multiple fundings', () => {
    beforeEach(async () => {
      await db.calculation.bulkCreate([mockCalculation1, mockCalculation3])
      await db.funding.bulkCreate([mockFunding1, mockFunding3])
    })

    test('should publish all funding options', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.fundings.length).toBe(2)
    })
  })

  describe('When calculation has been updated', () => {
    beforeEach(async () => {
      await db.calculation.create(mockCalculation1)
      await db.funding.create(mockFunding1)
    })

    test('should call sendMessage twice', async () => {
      await publish()
      await db.calculation.update({ updated: new Date(2022, 8, 5, 15, 30, 10, 121) }, { where: { calculationId: 1234567 } })

      await publish()

      expect(mockSendMessage).toHaveBeenCalledTimes(2)
    })
  })

  describe('When multiple calculations are unpublished', () => {
    beforeEach(async () => {
      publishingConfig.dataPublishingMaxBatchSizePerDataSource = 5
      await db.sequelize.truncate({ cascade: true })
    })

    test('should process all records when there are less records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecords = -1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecords)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should publish all records when there are less records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecords = -1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))

      await publish()

      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecords)
    })

    test('should process all records when there are equal number of records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecords = publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecords)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should publish all records when there are equal number of records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecords = publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))

      await publish()

      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecords)
    })

    test('should process publishingConfig.dataPublishingMaxBatchSizePerDataSource records when there are more records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecords = 1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecords)
      expect(unpublishedAfter).toHaveLength(numberOfRecords - publishingConfig.dataPublishingMaxBatchSizePerDataSource)
    })

    test('should publish publishingConfig.dataPublishingMaxBatchSizePerDataSource records when there are equal number of records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecords = 1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))

      await publish()

      expect(mockSendMessage).toHaveBeenCalledTimes(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
    })

    test('should process all records after the second publish when there are more records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecords = 1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()
      const unpublishedAfterFirstPublish = await db.calculation.findAll({ where: { published: null } })

      await publish()
      const unpublishedAfterSecondPublish = await db.calculation.findAll({ where: { published: null } })

      expect(unpublishedBefore).toHaveLength(numberOfRecords)
      expect(unpublishedAfterFirstPublish).toHaveLength(numberOfRecords - publishingConfig.dataPublishingMaxBatchSizePerDataSource)
      expect(unpublishedAfterSecondPublish).toHaveLength(0)
    })

    test('should publish all records after the second publish when there are less records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecords = 1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockCalculation1, calculationId: mockCalculation1.calculationId + x } }))
      await db.funding.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId + x } }))

      await publish()
      await publish()

      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecords)
    })
  })

  describe('When multiple fundings are attached to unpublished calculations', () => {
    beforeEach(async () => {
      publishingConfig.dataPublishingMaxBatchSizePerDataSource = 5
      await db.sequelize.truncate({ cascade: true })
    })

    test('should process calculation record when there are less funding records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecordsCalculation = 1
      const numberOfRecordsFunding = -1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.create(mockCalculation1)
      await db.funding.bulkCreate([...Array(numberOfRecordsFunding).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId } }))
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should publish calculation record when there are less funding records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecordsCalculation = 1
      const numberOfRecordsFunding = -1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.create(mockCalculation1)
      await db.funding.bulkCreate([...Array(numberOfRecordsFunding).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId } }))

      await publish()

      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecordsCalculation)
      expect(mockSendMessage).not.toHaveBeenCalledTimes(numberOfRecordsFunding)
    })

    test('should publish all funding records when there are less funding records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecordsFunding = -1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.create(mockCalculation1)
      await db.funding.bulkCreate([...Array(numberOfRecordsFunding).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId } }))

      await publish()

      expect(mockSendMessage.mock.calls[0][0].body.fundings).toHaveLength(numberOfRecordsFunding)
    })

    test('should process calculation record when there are equal number of funding records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecordsCalculation = 1
      const numberOfRecordsFunding = publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.create(mockCalculation1)
      await db.funding.bulkCreate([...Array(numberOfRecordsFunding).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId } }))
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should publish calculation record when there are equal number of funding records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecordsCalculation = 1
      const numberOfRecordsFunding = publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.create(mockCalculation1)
      await db.funding.bulkCreate([...Array(numberOfRecordsFunding).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId } }))

      await publish()

      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecordsCalculation)
      expect(mockSendMessage).not.toHaveBeenCalledTimes(numberOfRecordsFunding)
    })

    test('should publish all funding records when there are equal number of funding records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecordsFunding = publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.create(mockCalculation1)
      await db.funding.bulkCreate([...Array(numberOfRecordsFunding).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId } }))

      await publish()

      expect(mockSendMessage.mock.calls[0][0].body.fundings).toHaveLength(numberOfRecordsFunding)
    })

    test('should process calculation record when there are more funding records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecordsCalculation = 1
      const numberOfRecordsFunding = 1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.create(mockCalculation1)
      await db.funding.bulkCreate([...Array(numberOfRecordsFunding).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId } }))
      const unpublishedBefore = await db.calculation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.calculation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecordsCalculation)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should publish calculation record when there are more funding records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecordsCalculation = 1
      const numberOfRecordsFunding = 1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.create(mockCalculation1)
      await db.funding.bulkCreate([...Array(numberOfRecordsFunding).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId } }))

      await publish()

      expect(mockSendMessage).toHaveBeenCalledTimes(numberOfRecordsCalculation)
      expect(mockSendMessage).not.toHaveBeenCalledTimes(numberOfRecordsFunding)
    })

    test('should publish all funding records when there are more funding records than publishingConfig.dataPublishingMaxBatchSizePerDataSource', async () => {
      const numberOfRecordsFunding = 1 + publishingConfig.dataPublishingMaxBatchSizePerDataSource
      await db.calculation.create(mockCalculation1)
      await db.funding.bulkCreate([...Array(numberOfRecordsFunding).keys()].map(x => { return { ...mockFunding1, fundingId: mockFunding1.fundingId + x, calculationId: mockCalculation1.calculationId } }))

      await publish()

      expect(mockSendMessage.mock.calls[0][0].body.fundings).toHaveLength(numberOfRecordsFunding)
      expect(mockSendMessage.mock.calls[0][0].body.fundings).not.toHaveLength(publishingConfig.dataPublishingMaxBatchSizePerDataSource)
    })
  })
})
