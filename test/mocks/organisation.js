const mockOrganisation1 = {
  sbi: 123456789,
  addressLine1: 'A Farm',
  addressLine2: 'A Field',
  addressLine3: 'A Place',
  city: 'A City',
  county: 'A County',
  postcode: 'PO1 2CO',
  emailAddress: 'farmer1@farm.com',
  frn: 1234567890,
  name: 'A Farmer',
  updated: new Date(2022, 7, 5, 15, 30, 10, 120)
}

const mockOrganisation2 = {
  sbi: 123456788,
  addressLine1: 'Another Farm',
  addressLine2: 'Another Field',
  addressLine3: 'Another Place',
  city: 'Another City',
  county: 'Another County',
  postcode: 'PO2 1CO',
  emailAddress: 'farmer2@farm.com',
  frn: 1234567898,
  name: 'Another Farmer',
  updated: new Date(2022, 7, 5, 15, 30, 10, 120),
  published: new Date(2022, 7, 5, 15, 30, 10, 120)
}

module.exports = {
  mockOrganisation1,
  mockOrganisation2
}
