import { feature, story, attachment } from 'allure-js-commons';

const BASE_URL = Cypress.env('PETSTORE_API_URL');
const timestamp = Date.now();
const USERNAME = `testuser_${timestamp}`;

function attach(method, url, body, response) {
  cy.wrap(null).then(() => {
    attachment(
      'Request',
      JSON.stringify({ method, url, body: body ?? null }, null, 2),
      { contentType: 'application/json' }
    );
    attachment(
      'Response',
      JSON.stringify({ status: response.status, body: response.body }, null, 2),
      { contentType: 'application/json' }
    );
  });
}

describe('PetStore API - User CRUD', () => {
  Cypress.on('uncaught:exception', () => false);

  it('Crear un usuario', () => {
    cy.wrap(null).then(() => {
      feature('User');
      story('Crear usuario');
    });

    const body = {
      id: timestamp,
      username: USERNAME,
      firstName: 'Juan',
      lastName: 'Perez',
      email: `${USERNAME}@test.com`,
      password: 'Pass1234!',
      phone: '3001234567',
      userStatus: 1,
    };

    cy.request({
      method: 'POST',
      url: `${BASE_URL}/user`,
      body,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).then((response) => {
      attach('POST', `${BASE_URL}/user`, body, response);
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('code', 200);
    });
  });

  it('Buscar el usuario creado', () => {
    cy.wrap(null).then(() => {
      feature('User');
      story('Buscar usuario');
    });

    cy.request({
      method: 'GET',
      url: `${BASE_URL}/user/${USERNAME}`,
      failOnStatusCode: false,
    }).then((response) => {
      attach('GET', `${BASE_URL}/user/${USERNAME}`, null, response);
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('username', USERNAME);
      expect(response.body).to.have.property('email', `${USERNAME}@test.com`);
    });
  });

  it('Actualizar el nombre y el correo del usuario', () => {
    cy.wrap(null).then(() => {
      feature('User');
      story('Actualizar usuario');
    });

    const body = {
      id: timestamp,
      username: USERNAME,
      firstName: 'JuanActualizado',
      lastName: 'PerezActualizado',
      email: `${USERNAME}_updated@test.com`,
      password: 'Pass1234!',
      phone: '3001234567',
      userStatus: 1,
    };

    cy.request({
      method: 'PUT',
      url: `${BASE_URL}/user/${USERNAME}`,
      body,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).then((response) => {
      attach('PUT', `${BASE_URL}/user/${USERNAME}`, body, response);
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('code', 200);
    });
  });

  it('Buscar el usuario actualizado', () => {
    cy.wrap(null).then(() => {
      feature('User');
      story('Buscar usuario actualizado');
    });

    cy.request({
      method: 'GET',
      url: `${BASE_URL}/user/${USERNAME}`,
      failOnStatusCode: false,
    }).then((response) => {
      attach('GET', `${BASE_URL}/user/${USERNAME}`, null, response);
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('username', USERNAME);
      expect(response.body).to.have.property('firstName', 'JuanActualizado');
      expect(response.body).to.have.property('email', `${USERNAME}_updated@test.com`);
    });
  });

  it('Eliminar el usuario', () => {
    cy.wrap(null).then(() => {
      feature('User');
      story('Eliminar usuario');
    });

    cy.request({
      method: 'DELETE',
      url: `${BASE_URL}/user/${USERNAME}`,
      failOnStatusCode: false,
    }).then((response) => {
      attach('DELETE', `${BASE_URL}/user/${USERNAME}`, null, response);
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('code', 200);
    });
  });
});
