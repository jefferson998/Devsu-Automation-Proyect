describe('Flujo de compra E2E - DemoBlaze', () => {
  beforeEach(() => {
    cy.visit('https://www.demoblaze.com/');
    cy.contains('PRODUCT STORE', { timeout: 10000 }).should('be.visible');
  });

  it('Agregar dos productos, ver carrito, completar compra', () => {
    cy.contains('Samsung galaxy s6').click();
    cy.get('.name').should('contain', 'Samsung galaxy s6');
    cy.contains('Add to cart').click();
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Product added');
    });

    cy.get('.active > .nav-link').click({ force: true });
    cy.contains('Nokia lumia 1520').click();
    cy.get('.name').should('contain', 'Nokia lumia 1520');
    cy.contains('Add to cart').click();
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Product added');
    });
    cy.go('back');

    cy.get('#cartur').click();
    cy.url().should('include', 'cart.html');

    cy.contains('Samsung galaxy s6').should('be.visible');
    cy.contains('Nokia lumia 1520').should('be.visible');

    cy.contains('Place Order').click();
    cy.get('#orderModal').should('be.visible');


    cy.get('#name').type('Usuario Prueba');
    cy.get('#country').type('Colombia');
    cy.get('#city').type('Medellín');
    cy.get('#card').type('4111111111111111');
    cy.get('#month').type('12');
    cy.get('#year').type('2028');

    cy.contains('Purchase').click();

    cy.get('.sweet-alert', { timeout: 10000 }).should('be.visible');
    cy.contains('Thank you for your purchase!').should('be.visible');
    cy.get('.sweet-alert .lead.text-muted').invoke('text').then((text) => {
      const parts = text.split(/\s+/);

      const data = {
        'Id': parts[1],
        'Amount': parts[3] + ' ' + parts[4],
        'Card Number': parts[7],
        'Name': parts[9] + ' ' + (parts[10] || ''), 
        'Date': parts[12] || parts[11]
      };

      cy.log('=== DATOS DEL MODAL DE COMPRA ===');
      cy.log('| Campo       | Valor                    |');
      cy.log('|-------------|--------------------------|');
      cy.log(`| Id          | ${data['Id']}             |`);
      cy.log(`| Amount      | ${data['Amount']}         |`);
      cy.log(`| Card Number | ${data['Card Number']}    |`);
      cy.log(`| Name        | ${data['Name']}           |`);
      cy.log(`| Date        | ${data['Date']}           |`);
      cy.log('===================================');
    });

    cy.get('.sweet-alert .confirm').click();

    cy.visit('https://www.demoblaze.com/index.html');

    cy.url().should('eq', 'https://www.demoblaze.com/index.html');

  });
});