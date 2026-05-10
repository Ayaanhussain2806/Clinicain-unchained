# Testing Guide

This document provides comprehensive testing guidelines for Clinician-Unchained.

## Testing Pyramid

```
        /\
       /  \      E2E Tests
      /    \
     /______\
    /\      /\
   /  \    /  \    Integration Tests
  /    \  /    \
 /______\/______\
/\      /\      /\
/  \    /  \    /  \  Unit Tests
/    \  /    \  /    \
/______\/______\/______\
```

## Unit Tests

### Setup
```bash
npm install --save-dev jest @types/jest
```

### Example Unit Test
```javascript
// services/apiService.test.js
import { submitPrescription } from './apiService';

describe('API Service', () => {
  test('should submit prescription successfully', async () => {
    const mockData = {
      patientId: '123',
      medications: ['Aspirin'],
    };
    
    const result = await submitPrescription(mockData);
    expect(result).toBeDefined();
  });
});
```

### Run Unit Tests
```bash
npm test
```

## Integration Tests

### Setup
```bash
npm install --save-dev supertest
```

### Example Integration Test
```javascript
// routes/authRoutes.test.js
const request = require('supertest');
const app = require('../index');

describe('Auth Routes', () => {
  test('POST /api/auth/register', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
      });
    
    expect(response.statusCode).toBe(201);
  });
});
```

### Run Integration Tests
```bash
npm run test:integration
```

## E2E Tests

### Setup
```bash
npm install --save-dev cypress
npx cypress open
```

### Example E2E Test
```javascript
// cypress/e2e/auth.cy.js
describe('Authentication Flow', () => {
  it('should register and login successfully', () => {
    cy.visit('http://localhost:5173/auth');
    cy.get('[data-cy=email-input]').type('doctor@test.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=register-button]').click();
    
    cy.url().should('include', '/dashboard');
  });
});
```

### Run E2E Tests
```bash
npm run test:e2e
```

## Test Coverage

Generate coverage report:
```bash
npm run test:coverage
```

Expected coverage targets:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Performance Tests

### Load Testing with Apache JMeter
```bash
jmeter -n -t test_plan.jmx -l results.jtl
```

### API Performance Testing
```bash
npm install --save-dev artillery
artillery quick --count 100 --num 10 http://localhost:5000/api/health
```

## Manual Testing Checklist

### Authentication
- [ ] User can register
- [ ] User can login
- [ ] OTP verification works
- [ ] Session timeout works
- [ ] Logout clears session

### Prescriptions
- [ ] Can create prescription
- [ ] Can view prescriptions
- [ ] Can update prescription
- [ ] Can delete prescription
- [ ] Validation works

### Patients
- [ ] Can add patient
- [ ] Can view patient details
- [ ] Can update patient info
- [ ] Can search patients

### UI/UX
- [ ] Responsive design
- [ ] Loading states
- [ ] Error messages
- [ ] Form validation
- [ ] Accessibility

## Continuous Integration

Tests run automatically on:
- Every push to main
- Every pull request
- Scheduled daily runs

## Debugging Tests

### Run single test file
```bash
npm test -- authRoutes.test.js
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Best Practices

1. **Naming**: Use descriptive test names
2. **Setup/Teardown**: Clean up after each test
3. **Mocking**: Mock external dependencies
4. **Isolation**: Tests should be independent
5. **Speed**: Keep tests fast
6. **Coverage**: Aim for high coverage
7. **Maintainability**: Keep tests simple and clear

## Resources

- Jest Documentation: https://jestjs.io/
- Cypress Documentation: https://cypress.io/
- Testing Library: https://testing-library.com/
- Supertest: https://github.com/visionmedia/supertest
