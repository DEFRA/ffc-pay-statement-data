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
const db = require('../../../app/data')
const publish = require('../../../app/publishing')
const { mockOrganisation1, mockOrganisation2 } = require('../../mocks/organisation')

describe('publish organisations', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    jest.useFakeTimers().setSystemTime(new Date(2022, 7, 5, 15, 30, 10, 120))

    await db.sequelize.truncate({ cascade: true })
    await db.organisation.bulkCreate([mockOrganisation1, mockOrganisation2])
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should publish only one message if one unpublished organisation', async () => {
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

  test('should not publish same organisation on second run', async () => {
    await publish()
    await publish()
    expect(mockSendMessage).toHaveBeenCalledTimes(1)
  })
})
