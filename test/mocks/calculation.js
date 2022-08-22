const mockCalculation1 = {
  calculationId: 1234567,
  sbi: 123456789,
  frn: 1234567890,
  calculationDate: new Date(2022, 7, 5, 15, 30, 10, 120),
  invoiceNumber: 'SFI1234567',
  scheme: 'SFI',
  updated: new Date(2022, 7, 5, 15, 30, 10, 120)
}

const mockCalculation2 = {
  calculationId: 1234568,
  sbi: 123456788,
  frn: 1234567898,
  calculationDate: new Date(2022, 7, 5, 15, 30, 10, 120),
  invoiceNumber: 'SFI1234568',
  scheme: 'SFI',
  updated: new Date(2022, 7, 5, 15, 30, 10, 120)
}

module.exports = {
  mockCalculation1,
  mockCalculation2
}
