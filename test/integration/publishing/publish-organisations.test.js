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

const { mockOrganisation1, mockOrganisation2 } = require('../../mocks/organisation')

describe('publish organisations', () => {
  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date(2022, 7, 5, 15, 30, 10, 120))

    await db.organisation.bulkCreate([mockOrganisation1, mockOrganisation2])
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await db.sequelize.truncate({ cascade: true })
  })

  afterAll(async () => {
    await db.sequelize.close()
  })

  describe('When organisation is unpublished', () => {
    test('should call sendMessage once', async () => {
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(1)
    })

    test('should publish unpublished organisation sbi', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.sbi).toBe(mockOrganisation1.sbi)
    })

    test('should publish unpublished organisation frn', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.frn).toBe(mockOrganisation1.frn.toString())
    })

    test('should publish unpublished organisation name', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.name).toBe(mockOrganisation1.name)
    })

    test('should publish unpublished organisation email address', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.emailAddress).toBe(mockOrganisation1.emailAddress)
    })

    test('should publish unpublished organisation address line 1', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.addressLine1).toBe(mockOrganisation1.addressLine1)
    })

    test('should publish unpublished organisation address line 2', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.addressLine2).toBe(mockOrganisation1.addressLine2)
    })

    test('should publish unpublished organisation address line 3', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.addressLine3).toBe(mockOrganisation1.addressLine3)
    })

    test('should publish unpublished organisation city', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.city).toBe(mockOrganisation1.city)
    })

    test('should publish unpublished organisation county', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.county).toBe(mockOrganisation1.county)
    })

    test('should publish unpublished organisation postcode', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.postcode).toBe(mockOrganisation1.postcode)
    })

    test('should publish unpublished organisation updated date', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.updated).toBe(mockOrganisation1.updated.toISOString())
    })

    test('should publish unpublished type', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.type).toBe('organisation')
    })

    test('should not publish null published value', async () => {
      await publish()
      expect(mockSendMessage.mock.calls[0][0].body.published).toBeUndefined()
    })

    test('should update published date', async () => {
      await publish()
      const organisation = await db.organisation.findByPk(123456789)
      expect(organisation.published).toStrictEqual(new Date(2022, 7, 5, 15, 30, 10, 120))
    })

    test('should call a console log with number of datasets published for organisations/customers', async () => {
      const logSpy = jest.spyOn(global.console, 'log')
      await publish()
      expect(logSpy.mock.calls).toContainEqual(['%i %s datasets published', 1, 'organisation'])
    })

    test('should not publish same organisation on second run if record has not been updated after previous run', async () => {
      await publish()
      await publish()
      expect(mockSendMessage).toHaveBeenCalledTimes(1)
    })
  })

  describe('When organisation has been updated', () => {
    test('should call sendMessage twice', async () => {
      await publish()
      await db.organisation.update({ updated: new Date(2022, 8, 5, 15, 30, 10, 121) }, { where: { sbi: 123456789 } })

      await publish()

      expect(mockSendMessage).toHaveBeenCalledTimes(2)
    })
  })

  describe('When multiple organisations are unpublished', () => {
    beforeEach(async () => {
      publishingConfig.dataPublishingMaxBatchSize = 5
      await db.sequelize.truncate({ cascade: true })
    })

    test('should process all records when there are less records than publishingConfig.dataPublishingMaxBatchSize', async () => {
      const numberOfRecords = publishingConfig.dataPublishingMaxBatchSize - 1
      await db.organisation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.organisation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecords)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should process all records when there are equal number of records than publishingConfig.dataPublishingMaxBatchSize', async () => {
      const numberOfRecords = publishingConfig.dataPublishingMaxBatchSize
      await db.organisation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.organisation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecords)
      expect(unpublishedAfter).toHaveLength(0)
    })

    test('should process publishingConfig.dataPublishingMaxBatchSize records when there are more records than publishingConfig.dataPublishingMaxBatchSize', async () => {
      const numberOfRecords = publishingConfig.dataPublishingMaxBatchSize + 1
      await db.organisation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()

      const unpublishedAfter = await db.organisation.findAll({ where: { published: null } })
      expect(unpublishedBefore).toHaveLength(numberOfRecords)
      expect(unpublishedAfter).toHaveLength(numberOfRecords - publishingConfig.dataPublishingMaxBatchSize)
    })

    test('should process all records after the second publish when there are more records than publishingConfig.dataPublishingMaxBatchSize', async () => {
      const numberOfRecords = publishingConfig.dataPublishingMaxBatchSize + 1
      await db.organisation.bulkCreate([...Array(numberOfRecords).keys()].map(x => { return { ...mockOrganisation1, sbi: mockOrganisation1.sbi + x } }))
      const unpublishedBefore = await db.organisation.findAll({ where: { published: null } })

      await publish()
      const unpublishedAfterFirstPublish = await db.organisation.findAll({ where: { published: null } })

      await publish()
      const unpublishedAfterSecondPublish = await db.organisation.findAll({ where: { published: null } })

      expect(unpublishedBefore).toHaveLength(numberOfRecords)
      expect(unpublishedAfterFirstPublish).toHaveLength(numberOfRecords - publishingConfig.dataPublishingMaxBatchSize)
      expect(unpublishedAfterSecondPublish).toHaveLength(0)
    })
  })
})
