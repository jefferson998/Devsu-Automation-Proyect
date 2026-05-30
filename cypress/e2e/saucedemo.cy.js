describe('Flujo de compra E2E - SauceDemo', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('SAUCEDEMO_URL') + '/');
  });

  it('Login, agregar dos productos, ver carrito, completar compra', () => {
    cy.get('[data-test="username"]').type(Cypress.env('SAUCEDEMO_USER'));
    cy.get('[data-test="password"]').type(Cypress.env('SAUCEDEMO_PASSWORD'));
    cy.get('[data-test="login-button"]').click();

    cy.url().should('include', '/inventory.html');

    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    cy.get('[data-test="shopping-cart-link"]').click();
    cy.url().should('include', '/cart.html');

    cy.contains('Sauce Labs Backpack').should('be.visible');
    cy.contains('Sauce Labs Bike Light').should('be.visible');

    cy.get('[data-test="checkout"]').click();
    cy.url().should('include', '/checkout-step-one.html');

    cy.get('[data-test="firstName"]').type(Cypress.env('CHECKOUT_FIRST_NAME'));
    cy.get('[data-test="lastName"]').type(Cypress.env('CHECKOUT_LAST_NAME'));
    cy.get('[data-test="postalCode"]').type(Cypress.env('CHECKOUT_POSTCODE'));
    cy.get('[data-test="continue"]').click();

    cy.url().should('include', '/checkout-step-two.html');
    cy.contains('Sauce Labs Backpack').should('be.visible');
    cy.contains('Sauce Labs Bike Light').should('be.visible');

    cy.get('[data-test="finish"]').click();

    cy.url().should('include', '/checkout-complete.html');
    cy.contains('Thank you for your order!').should('be.visible');
  });
});
