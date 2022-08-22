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
const { mockCalculation1, mockCalculation2 } = require('../../mocks/calculation')
const { mockFunding1, mockFunding2, mockFunding3 } = require('../../mocks/funding')

describe('publish calculations', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    jest.useFakeTimers().setSystemTime(new Date(2022, 7, 5, 15, 30, 10, 120))

    await db.sequelize.truncate({ cascade: true })
    await db.calculation.bulkCreate([mockCalculation1, mockCalculation2])
    await db.funding.bulkCreate([mockFunding1, mockFunding2, mockFunding3])
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should publish only one message if one unpublished calculation', async () => {
    await publish()
    expect(mockSendMessage).toHaveBeenCalledTimes(1)
  })

  test('should publish unpublished calculation sbi', async () => {
    await publish()
    expect(mockSendMessage.mock.calls[0][0].body.sbi).toBe(mockCalculation1.sbi)
  })

  test('should publish unpublished calculation frn', async () => {
    await publish()
    expect(mockSendMessage.mock.calls[0][0].body.frn).toBe(mockCalculation1.frn.toString())
  })

  test('should publish unpublished invoice number', async () => {
    await publish()
    expect(mockSendMessage.mock.calls[0][0].body.invoiceNumber).toBe(mockCalculation1.invoiceNumber)
  })

  test('should publish unpublished calculation scheme', async () => {
    await publish()
    expect(mockSendMessage.mock.calls[0][0].body.scheme).toBe(mockCalculation1.scheme)
  })

  test('should publish unpublished calculation date', async () => {
    await publish()
    expect(mockSendMessage.mock.calls[0][0].body.calculationDate).toBe(mockCalculation1.calculationDate.toISOString())
  })

  test('should publish unpublished calculation updated date', async () => {
    await publish()
    expect(mockSendMessage.mock.calls[0][0].body.updated).toBe(mockCalculation1.updated.toISOString())
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

  test('should not publish same calculation on second run', async () => {
    await publish()
    await publish()
    expect(mockSendMessage).toHaveBeenCalledTimes(1)
  })
})
