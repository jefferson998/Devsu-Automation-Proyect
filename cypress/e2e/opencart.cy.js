describe('Flujo de compra E2E - OpenCart', () => {
  Cypress.on('uncaught:exception', () => false);

  it('Agregar dos productos, ver carrito, guest checkout hasta confirmación', () => {
    cy.visit(Cypress.env('OPENCART_URL') + '/index.php?route=product/product&product_id=43');
    cy.get('#button-cart').click();
    cy.get('.alert-success', { timeout: 8000 }).should('exist');

    cy.visit(Cypress.env('OPENCART_URL') + '/index.php?route=product/product&product_id=40');
    cy.get('#button-cart').click();
    cy.get('.alert-success', { timeout: 8000 }).should('exist');

    cy.visit(Cypress.env('OPENCART_URL') + '/index.php?route=checkout/cart');
    cy.url().should('include', 'route=checkout/cart');
    cy.get('#content').contains('MacBook').should('be.visible');
    cy.get('#content').contains('iPhone').should('be.visible');

    cy.visit(Cypress.env('OPENCART_URL') + '/index.php?route=checkout/checkout');

    cy.get('#collapse-checkout-option', { timeout: 10000 }).should('be.visible');
    cy.get('input[value="guest"]').check();
    cy.get('#button-account').click();

    cy.get('#input-payment-firstname', { timeout: 10000 }).should('be.visible').type(Cypress.env('CHECKOUT_FIRST_NAME'));
    cy.get('#input-payment-lastname').type(Cypress.env('CHECKOUT_LAST_NAME'));
    cy.get('#input-payment-email').type(Cypress.env('CHECKOUT_EMAIL'));
    cy.get('#input-payment-telephone').type(Cypress.env('CHECKOUT_PHONE'));
    cy.get('#input-payment-address-1').type(Cypress.env('CHECKOUT_ADDRESS'));
    cy.get('#input-payment-city').type(Cypress.env('CHECKOUT_CITY'));
    cy.get('#input-payment-postcode').type(Cypress.env('CHECKOUT_POSTCODE'));
    cy.get('#input-payment-country').select(Cypress.env('CHECKOUT_COUNTRY'));
    cy.get('#input-payment-zone', { timeout: 8000 }).should('not.be.disabled').select(Cypress.env('CHECKOUT_ZONE'));
    cy.get('#button-guest').click();

    cy.get('#collapse-shipping-method', { timeout: 10000 }).should('be.visible');
    cy.get('#collapse-shipping-method input[type="radio"]').first().check({ force: true });
    cy.get('#button-shipping-method').click();

    cy.get('#collapse-payment-method', { timeout: 10000 }).should('be.visible');
    cy.get('input[name="agree"]').check({ force: true });
    cy.get('#button-payment-method').click();

    cy.get('#button-confirm', { timeout: 10000 }).should('be.visible').click();

    cy.contains('Your order has been placed!', { timeout: 15000 }).should('be.visible');
  });
});
