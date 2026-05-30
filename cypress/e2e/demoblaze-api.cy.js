import { feature, story, attachment } from 'allure-js-commons';

const BASE_URL = Cypress.env('DEMOBLAZE_API_URL');
const timestamp = Date.now();
const NEW_USER = `testuser_${timestamp}`;
const PASSWORD = Cypress.env('DEMOBLAZE_PASSWORD');
const EXISTING_USER = Cypress.env('DEMOBLAZE_EXISTING_USER');

function attachRequestResponse(method, url, body, response) {
  cy.wrap(null).then(() => {
    attachment(
      'Request',
      JSON.stringify({ method, url, body }, null, 2),
      { contentType: 'application/json' }
    );
    attachment(
      'Response',
      JSON.stringify({ status: response.status, body: response.body }, null, 2),
      { contentType: 'application/json' }
    );
  });
}

describe('DemoBlaze API - Signup & Login', () => {
  Cypress.on('uncaught:exception', () => false);

  context('POST /signup', () => {
    it('Crear un nuevo usuario en signup', () => {
      cy.wrap(null).then(() => {
        feature('Signup');
        story('Nuevo usuario');
      });

      const body = { username: NEW_USER, password: PASSWORD };

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/signup`,
        body,
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      }).then((response) => {
        attachRequestResponse('POST', `${BASE_URL}/signup`, body, response);
        expect(response.status).to.eq(200);
        expect(response.body).to.not.have.property('errorMessage');
      });
    });

    it('Intentar crear un usuario ya existente', () => {
      cy.wrap(null).then(() => {
        feature('Signup');
        story('Usuario duplicado');
      });

      const body = { username: EXISTING_USER, password: PASSWORD };

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/signup`,
        body,
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      }).then((response) => {
        attachRequestResponse('POST', `${BASE_URL}/signup`, body, response);
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('errorMessage', 'This user already exist.');
      });
    });
  });

  context('POST /login', () => {
    it('Usuario y password correcto en login', () => {
      cy.wrap(null).then(() => {
        feature('Login');
        story('Credenciales correctas');
      });

      const body = { username: NEW_USER, password: PASSWORD };

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/login`,
        body,
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      }).then((response) => {
        attachRequestResponse('POST', `${BASE_URL}/login`, body, response);
        expect(response.status).to.eq(200);
        expect(response.body).to.be.a('string');
        expect(response.body).to.not.include('Wrong');
        expect(response.body).to.not.include('does not exist');
      });
    });

    it('Usuario y password incorrecto en login', () => {
      cy.wrap(null).then(() => {
        feature('Login');
        story('Credenciales incorrectas');
      });

      const body = { username: 'usuario_que_no_existe_xyz99', password: 'wrongpass' };

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/login`,
        body,
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      }).then((response) => {
        attachRequestResponse('POST', `${BASE_URL}/login`, body, response);
        expect(response.status).to.eq(200);
        expect(response.body).to.satisfy(
          (b) => (typeof b === 'string' && b.includes('does not exist')) ||
                 (typeof b === 'object' && b.errorMessage && b.errorMessage.includes('does not exist')),
          'Login incorrecto: debe indicar que el usuario no existe'
        );
      });
    });
  });
});
