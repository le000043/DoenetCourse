describe('Map Tag Tests',function() {

  beforeEach(() => {
    cy.visit('/test')
  })

  it('single map of maths',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <aslist>
    <map >
    <template><math>sin(2<subsref/>) + <subsindex/></math></template>
    <substitutions><math>x</math><math>y</math></substitutions>
    </map>
    </aslist>
    `},"*");
    });

    cy.get('#\\/_text1').should('have.text','a');   // to wait for page to load
  
    cy.log('Test values displayed in browser')
    cy.get('#\\/__map1_0_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('sin(2x)+1');
    });
    cy.get('#\\/__map1_1_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('sin(2y)+2');
    });

    cy.log('Test internal values are set to the correct values')
    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/__map1_0_math1'].state.value.tree).eqls(['+', ['apply', 'sin', ['*',2,'x']],1]);
      expect(components['/__map1_1_math1'].state.value.tree).eqls(['+', ['apply', 'sin', ['*',2,'y']],2]);
    })
  });

  it('single map of texts',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <map >
    <template><text>You are a <subsref/>!</text> </template>
    <substitutions><text>squirrel</text><text>bat</text></substitutions>
    </map>
    `},"*");
    });
  
    cy.get('#\\/_text1').should('have.text','a');   // to wait for page to load

    cy.log('Test values displayed in browser')
    cy.get('#\\/__map1_0_text2').should('have.text', "You are a squirrel!");
    cy.get('#\\/__map1_1_text2').should('have.text', "You are a bat!");

    cy.log('Test internal values are set to the correct values')
    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/__map1_0_text2'].state.value).eq("You are a squirrel!");
      expect(components['/__map1_1_text2'].state.value).eq("You are a bat!");
    })
  });

  it('single map of sequence',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <map >
    <template><math simplify><subsref/>^2</math> </template>
    <substitutions><sequence from="1" to="5"/></substitutions>
    </map>
    `},"*");
    });
  
    cy.get('#\\/_text1').should('have.text','a');   // to wait for page to load

    cy.log('Test values displayed in browser')
    cy.get('#\\/__map1_0_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#\\/__map1_1_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('4');
    });
    cy.get('#\\/__map1_2_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#\\/__map1_3_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('16');
    });
    cy.get('#\\/__map1_4_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });

    cy.log('Test internal values are set to the correct values')
    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/__map1_0_math1'].state.value.tree).eq(1);
      expect(components['/__map1_1_math1'].state.value.tree).eq(4);
      expect(components['/__map1_2_math1'].state.value.tree).eq(9);
      expect(components['/__map1_3_math1'].state.value.tree).eq(16);
      expect(components['/__map1_4_math1'].state.value.tree).eq(25);
    })
  });

  it('triple parallel map',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <aslist>
    <map behavior="parallel">
    <template><math>(<subsref/>, <subsref>2</subsref>, <subsref>3</subsref>)</math>
    <math>(<subsindex/>, <subsindex>2</subsindex>, <subsindex>3</subsindex>)</math></template>
    <substitutions><sequence from="1" to="5"/></substitutions>
    <substitutions><sequence from="21" to="23"/></substitutions>
    <substitutions><sequence from="-5" to="-21" step="-3"/></substitutions>
    </map>
    </aslist>
    `},"*");
    });

    cy.get('#\\/_text1').should('have.text','a');   // to wait for page to load

  
    cy.log('Test values displayed in browser')
    cy.get('#\\/__map1_0_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,21,−5)');
    });
    cy.get('#\\/__map1_0_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,1,1)');
    });
    cy.get('#\\/__map1_1_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,22,−8)');
    });
    cy.get('#\\/__map1_1_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,2,2)');
    });
    cy.get('#\\/__map1_2_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,23,−11)');
    });
    cy.get('#\\/__map1_2_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,3,3)');
    });

    cy.log('Test internal values are set to the correct values')
    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/__map1_0_math1'].state.value.tree).eqls(["tuple",1,21,-5]);
      expect(components['/__map1_0_math2'].state.value.tree).eqls(["tuple",1,1,1]);
      expect(components['/__map1_1_math1'].state.value.tree).eqls(["tuple",2,22,-8]);
      expect(components['/__map1_1_math2'].state.value.tree).eqls(["tuple",2,2,2]);
      expect(components['/__map1_2_math1'].state.value.tree).eqls(["tuple",3,23,-11]);
      expect(components['/__map1_2_math2'].state.value.tree).eqls(["tuple",3,3,3]);
    })
  });

  it('triple combination map',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <map behavior="combination">
    <template><math>(<subsref/>, <subsref>2</subsref>, <subsref>3</subsref>)</math>
    <math>(<subsindex/>, <subsindex>2</subsindex>, <subsindex>3</subsindex>)</math></template>
    <substitutions><sequence from="1" to="3"/></substitutions>
    <substitutions><sequence from="21" to="23" step="2"/></substitutions>
    <substitutions><sequence from="-5" to="-8" step="-3"/></substitutions>
    </map>
    `},"*");
    });

    cy.get('#\\/_text1').should('have.text','a');   // to wait for page to load
  
    cy.log('Test values displayed in browser')
    cy.get('#\\/__map1_0_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,21,−5)');
    });
    cy.get('#\\/__map1_0_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,1,1)');
    });
    cy.get('#\\/__map1_1_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,21,−8)');
    });
    cy.get('#\\/__map1_1_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,1,2)');
    });
    cy.get('#\\/__map1_2_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,23,−5)');
    });
    cy.get('#\\/__map1_2_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,2,1)');
    });
    cy.get('#\\/__map1_3_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,23,−8)');
    });
    cy.get('#\\/__map1_3_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,2,2)');
    });
    cy.get('#\\/__map1_4_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,21,−5)');
    });
    cy.get('#\\/__map1_4_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,1,1)');
    });
    cy.get('#\\/__map1_5_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,21,−8)');
    });
    cy.get('#\\/__map1_5_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,1,2)');
    });
    cy.get('#\\/__map1_6_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,23,−5)');
    });
    cy.get('#\\/__map1_6_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,2,1)');
    });
    cy.get('#\\/__map1_7_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,23,−8)');
    });
    cy.get('#\\/__map1_7_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,2,2)');
    });
    cy.get('#\\/__map1_8_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,21,−5)');
    });
    cy.get('#\\/__map1_8_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,1,1)');
    });
    cy.get('#\\/__map1_9_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,21,−8)');
    });
    cy.get('#\\/__map1_9_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,1,2)');
    });
    cy.get('#\\/__map1_10_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,23,−5)');
    });
    cy.get('#\\/__map1_10_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,2,1)');
    });
    cy.get('#\\/__map1_11_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,23,−8)');
    });
    cy.get('#\\/__map1_11_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,2,2)');
    });

    cy.log('Test internal values are set to the correct values')
    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/__map1_0_math1'].state.value.tree).eqls(["tuple",1,21,-5]);
      expect(components['/__map1_0_math2'].state.value.tree).eqls(["tuple",1,1,1]);
      expect(components['/__map1_1_math1'].state.value.tree).eqls(["tuple",1,21,-8]);
      expect(components['/__map1_1_math2'].state.value.tree).eqls(["tuple",1,1,2]);
      expect(components['/__map1_2_math1'].state.value.tree).eqls(["tuple",1,23,-5]);
      expect(components['/__map1_2_math2'].state.value.tree).eqls(["tuple",1,2,1]);
      expect(components['/__map1_3_math1'].state.value.tree).eqls(["tuple",1,23,-8]);
      expect(components['/__map1_3_math2'].state.value.tree).eqls(["tuple",1,2,2]);
      expect(components['/__map1_4_math1'].state.value.tree).eqls(["tuple",2,21,-5]);
      expect(components['/__map1_4_math2'].state.value.tree).eqls(["tuple",2,1,1]);
      expect(components['/__map1_5_math1'].state.value.tree).eqls(["tuple",2,21,-8]);
      expect(components['/__map1_5_math2'].state.value.tree).eqls(["tuple",2,1,2]);
      expect(components['/__map1_6_math1'].state.value.tree).eqls(["tuple",2,23,-5]);
      expect(components['/__map1_6_math2'].state.value.tree).eqls(["tuple",2,2,1]);
      expect(components['/__map1_7_math1'].state.value.tree).eqls(["tuple",2,23,-8]);
      expect(components['/__map1_7_math2'].state.value.tree).eqls(["tuple",2,2,2]);
      expect(components['/__map1_8_math1'].state.value.tree).eqls(["tuple",3,21,-5]);
      expect(components['/__map1_8_math2'].state.value.tree).eqls(["tuple",3,1,1]);
      expect(components['/__map1_9_math1'].state.value.tree).eqls(["tuple",3,21,-8]);
      expect(components['/__map1_9_math2'].state.value.tree).eqls(["tuple",3,1,2]);
      expect(components['/__map1_10_math1'].state.value.tree).eqls(["tuple",3,23,-5]);
      expect(components['/__map1_10_math2'].state.value.tree).eqls(["tuple",3,2,1]);
      expect(components['/__map1_11_math1'].state.value.tree).eqls(["tuple",3,23,-8]);
      expect(components['/__map1_11_math2'].state.value.tree).eqls(["tuple",3,2,2]);
    })
  });

  it('two nested maps',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <aslist><map>
    <template>
        <map>
          <template><math simplify><subsref/>+<subsref parentTemplate="2"/></math>
          <math simplify><subsindex/>+2<subsindex parentTemplate="2"/></math></template>
          <substitutions><sequence from="1" to="2"/></substitutions>
        </map>
    </template>
    <substitutions><number>-10</number><number>5</number></substitutions>
    </map>
    </aslist>
    `},"*");
    });
  
    cy.get('#\\/_text1').should('have.text','a');   // to wait for page to load

    cy.log('Test values displayed in browser')
    cy.get('#\\/___map1_0_map2_0__map1_0_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('−9');
    });
    cy.get('#\\/___map1_0_map2_0__map1_0_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('3');
    });
    cy.get('#\\/___map1_0_map2_1__map1_0_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('−8');
    });
    cy.get('#\\/___map1_0_map2_1__map1_0_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('4');
    });
    cy.get('#\\/___map1_1_map2_0__map1_1_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('6');
    });
    cy.get('#\\/___map1_1_map2_0__map1_1_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('5');
    });
    cy.get('#\\/___map1_1_map2_1__map1_1_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('7');
    });
    cy.get('#\\/___map1_1_map2_1__map1_1_math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('6');
    });

    cy.log('Test internal values are set to the correct values')
    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/___map1_0_map2_0__map1_0_math1'].state.value.tree).eq(-9);
      expect(components['/___map1_0_map2_0__map1_0_math2'].state.value.tree).eq(3);
      expect(components['/___map1_0_map2_1__map1_0_math1'].state.value.tree).eq(-8);
      expect(components['/___map1_0_map2_1__map1_0_math2'].state.value.tree).eq(4);
      expect(components['/___map1_1_map2_0__map1_1_math1'].state.value.tree).eq(6);
      expect(components['/___map1_1_map2_0__map1_1_math2'].state.value.tree).eq(5);
      expect(components['/___map1_1_map2_1__map1_1_math1'].state.value.tree).eq(7);
      expect(components['/___map1_1_map2_1__map1_1_math2'].state.value.tree).eq(6);
    })
  });

  it('three nested maps with graphs and reffed',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <map>
    <template>
      <graph>
        <map>
          <template>
            <map>
              <template>
                <point><coords>(<subsref/>+<subsref parentTemplate="3"/>, <subsref parentTemplate="2"/>)</coords></point>
                <point><coords>(<subsindex/>+2*<subsindex parentTemplate="3"/>, <subsindex parentTemplate="2"/>)</coords></point>
              </template>
              <substitutions><sequence from="1" to="2"/></substitutions>
            </map>
          </template>
          <substitutions><sequence from="-5" to="5" step="10"/></substitutions>
        </map>
      </graph>
    </template>
    <substitutions><sequence from="-10" to="5" step="15"/></substitutions>
    </map>
    <ref>_map1</ref>
    `},"*");
    });

    cy.get('#\\/_text1').should('have.text','a');   // to wait for page to load

  
    cy.log('Test internal values are set to the correct values')
    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);

      expect(components['/__map1_0_graph1'].descendantsFound._graphical.length).eq(8);
      expect(components['/__map1_1_graph1'].descendantsFound._graphical.length).eq(8);
      expect(components.__graph1.descendantsFound._graphical.length).eq(8);
      expect(components.__graph2.descendantsFound._graphical.length).eq(8);
      expect(components['/____map1_0_map2_0__map1_0_map3_0___map1_0_map2_0__map1_0_point1'].state.xs[0].tree).eq(-9);
      expect(components['/____map1_0_map2_0__map1_0_map3_0___map1_0_map2_0__map1_0_point2'].state.xs[0].tree).eq(3);
      expect(components['/____map1_0_map2_0__map1_0_map3_0___map1_0_map2_0__map1_0_point1'].state.xs[1].tree).eq(-5);
      expect(components['/____map1_0_map2_0__map1_0_map3_0___map1_0_map2_0__map1_0_point2'].state.xs[1].tree).eq(1);
      expect(components['/____map1_0_map2_0__map1_0_map3_1___map1_0_map2_0__map1_0_point1'].state.xs[0].tree).eq(-8);
      expect(components['/____map1_0_map2_0__map1_0_map3_1___map1_0_map2_0__map1_0_point2'].state.xs[0].tree).eq(4);
      expect(components['/____map1_0_map2_0__map1_0_map3_1___map1_0_map2_0__map1_0_point1'].state.xs[1].tree).eq(-5);
      expect(components['/____map1_0_map2_0__map1_0_map3_1___map1_0_map2_0__map1_0_point2'].state.xs[1].tree).eq(1);
      expect(components['/____map1_0_map2_1__map1_0_map3_0___map1_0_map2_1__map1_0_point1'].state.xs[0].tree).eq(-9);
      expect(components['/____map1_0_map2_1__map1_0_map3_0___map1_0_map2_1__map1_0_point2'].state.xs[0].tree).eq(3);
      expect(components['/____map1_0_map2_1__map1_0_map3_0___map1_0_map2_1__map1_0_point1'].state.xs[1].tree).eq(5);
      expect(components['/____map1_0_map2_1__map1_0_map3_0___map1_0_map2_1__map1_0_point2'].state.xs[1].tree).eq(2);
      expect(components['/____map1_0_map2_1__map1_0_map3_1___map1_0_map2_1__map1_0_point1'].state.xs[0].tree).eq(-8);
      expect(components['/____map1_0_map2_1__map1_0_map3_1___map1_0_map2_1__map1_0_point2'].state.xs[0].tree).eq(4);
      expect(components['/____map1_0_map2_1__map1_0_map3_1___map1_0_map2_1__map1_0_point1'].state.xs[1].tree).eq(5);
      expect(components['/____map1_0_map2_1__map1_0_map3_1___map1_0_map2_1__map1_0_point2'].state.xs[1].tree).eq(2);
      expect(components['/____map1_1_map2_0__map1_1_map3_0___map1_1_map2_0__map1_1_point1'].state.xs[0].tree).eq(6);
      expect(components['/____map1_1_map2_0__map1_1_map3_0___map1_1_map2_0__map1_1_point2'].state.xs[0].tree).eq(5);
      expect(components['/____map1_1_map2_0__map1_1_map3_0___map1_1_map2_0__map1_1_point1'].state.xs[1].tree).eq(-5);
      expect(components['/____map1_1_map2_0__map1_1_map3_0___map1_1_map2_0__map1_1_point2'].state.xs[1].tree).eq(1);
      expect(components['/____map1_1_map2_0__map1_1_map3_1___map1_1_map2_0__map1_1_point1'].state.xs[0].tree).eq(7);
      expect(components['/____map1_1_map2_0__map1_1_map3_1___map1_1_map2_0__map1_1_point2'].state.xs[0].tree).eq(6);
      expect(components['/____map1_1_map2_0__map1_1_map3_1___map1_1_map2_0__map1_1_point1'].state.xs[1].tree).eq(-5);
      expect(components['/____map1_1_map2_0__map1_1_map3_1___map1_1_map2_0__map1_1_point2'].state.xs[1].tree).eq(1);
      expect(components['/____map1_1_map2_1__map1_1_map3_0___map1_1_map2_1__map1_1_point1'].state.xs[0].tree).eq(6);
      expect(components['/____map1_1_map2_1__map1_1_map3_0___map1_1_map2_1__map1_1_point2'].state.xs[0].tree).eq(5);
      expect(components['/____map1_1_map2_1__map1_1_map3_0___map1_1_map2_1__map1_1_point1'].state.xs[1].tree).eq(5);
      expect(components['/____map1_1_map2_1__map1_1_map3_0___map1_1_map2_1__map1_1_point2'].state.xs[1].tree).eq(2);
      expect(components['/____map1_1_map2_1__map1_1_map3_1___map1_1_map2_1__map1_1_point1'].state.xs[0].tree).eq(7);
      expect(components['/____map1_1_map2_1__map1_1_map3_1___map1_1_map2_1__map1_1_point2'].state.xs[0].tree).eq(6);
      expect(components['/____map1_1_map2_1__map1_1_map3_1___map1_1_map2_1__map1_1_point1'].state.xs[1].tree).eq(5);
      expect(components['/____map1_1_map2_1__map1_1_map3_1___map1_1_map2_1__map1_1_point2'].state.xs[1].tree).eq(2);
      expect(components.__point1.state.xs[0].tree).eq(-9);
      expect(components.__point1.state.xs[1].tree).eq(-5);
      expect(components.__point2.state.xs[0].tree).eq(3);
      expect(components.__point2.state.xs[1].tree).eq(1);
      expect(components.__point3.state.xs[0].tree).eq(-8);
      expect(components.__point3.state.xs[1].tree).eq(-5);
      expect(components.__point4.state.xs[0].tree).eq(4);
      expect(components.__point4.state.xs[1].tree).eq(1);
      expect(components.__point5.state.xs[0].tree).eq(-9);
      expect(components.__point5.state.xs[1].tree).eq(5);
      expect(components.__point6.state.xs[0].tree).eq(3);
      expect(components.__point6.state.xs[1].tree).eq(2);
      expect(components.__point7.state.xs[0].tree).eq(-8);
      expect(components.__point7.state.xs[1].tree).eq(5);
      expect(components.__point8.state.xs[0].tree).eq(4);
      expect(components.__point8.state.xs[1].tree).eq(2);
      expect(components.__point9.state.xs[0].tree).eq(6);
      expect(components.__point9.state.xs[1].tree).eq(-5);
      expect(components.__point10.state.xs[0].tree).eq(5);
      expect(components.__point10.state.xs[1].tree).eq(1);
      expect(components.__point11.state.xs[0].tree).eq(7);
      expect(components.__point11.state.xs[1].tree).eq(-5);
      expect(components.__point12.state.xs[0].tree).eq(6);
      expect(components.__point12.state.xs[1].tree).eq(1);
      expect(components.__point13.state.xs[0].tree).eq(6);
      expect(components.__point13.state.xs[1].tree).eq(5);
      expect(components.__point14.state.xs[0].tree).eq(5);
      expect(components.__point14.state.xs[1].tree).eq(2);
      expect(components.__point15.state.xs[0].tree).eq(7);
      expect(components.__point15.state.xs[1].tree).eq(5);
      expect(components.__point16.state.xs[0].tree).eq(6);
      expect(components.__point16.state.xs[1].tree).eq(2);
    })
  });

  it('three nested maps with graphs and namespaces',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <map assignnamespaces="u,v">
    <template>
      <graph>
        <map assignnamespaces="u,v">
          <template>
            <map assignnamespaces="u,v">
              <template>
                <point name="A"><coords>(<subsref/>+<subsref parentTemplate="3"/>, <subsref parentTemplate="2"/>)</coords></point>
              </template>
              <substitutions><sequence from="1" to="2"/></substitutions>
            </map>
          </template>
          <substitutions><sequence from="-5" to="5" step="10"/></substitutions>
        </map>
      </graph>
    </template>
    <substitutions><sequence from="-10" to="5" step="15"/></substitutions>
    </map>
    <ref prop="coords">/u/u/u/A</ref>
    <ref prop="coords">/u/u/v/A</ref>
    <ref prop="coords">/u/v/u/A</ref>
    <ref prop="coords">/u/v/v/A</ref>
    <ref prop="coords">/v/u/u/A</ref>
    <ref prop="coords">/v/u/v/A</ref>
    <ref prop="coords">/v/v/u/A</ref>
    <ref prop="coords">/v/v/v/A</ref>
    `},"*");
    });

    cy.get('#\\/_text1').should('have.text','a');   // to wait for page to load
  
    cy.log('Test values displayed in browser')
    cy.get('#__coords1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−9,−5)');
    });
    cy.get('#__coords2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−8,−5)');
    });
    cy.get('#__coords3 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−9,5)');
    });
    cy.get('#__coords4 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−8,5)');
    });
    cy.get('#__coords5 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(6,−5)');
    });
    cy.get('#__coords6 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(7,−5)');
    });
    cy.get('#__coords7 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(6,5)');
    });
    cy.get('#__coords8 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(7,5)');
    });

    cy.log('Test internal values are set to the correct values')
    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);

      expect(components['/u/_graph1'].descendantsFound._graphical.length).eq(4);
      expect(components['/v/_graph1'].descendantsFound._graphical.length).eq(4);
      expect(components['/u/u/u/a'].state.xs[0].tree).eq(-9);
      expect(components['/u/u/u/a'].state.xs[1].tree).eq(-5);
      expect(components['/u/u/v/a'].state.xs[0].tree).eq(-8);
      expect(components['/u/u/v/a'].state.xs[1].tree).eq(-5);
      expect(components['/u/v/u/a'].state.xs[0].tree).eq(-9);
      expect(components['/u/v/u/a'].state.xs[1].tree).eq(5);
      expect(components['/u/v/v/a'].state.xs[0].tree).eq(-8);
      expect(components['/u/v/v/a'].state.xs[1].tree).eq(5);
      expect(components['/v/u/u/a'].state.xs[0].tree).eq(6);
      expect(components['/v/u/u/a'].state.xs[1].tree).eq(-5);
      expect(components['/v/u/v/a'].state.xs[0].tree).eq(7);
      expect(components['/v/u/v/a'].state.xs[1].tree).eq(-5);
      expect(components['/v/v/u/a'].state.xs[0].tree).eq(6);
      expect(components['/v/v/u/a'].state.xs[1].tree).eq(5);
      expect(components['/v/v/v/a'].state.xs[0].tree).eq(7);
      expect(components['/v/v/v/a'].state.xs[1].tree).eq(5);
    })
  });

  it('combination map nested inside map with graphs',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <map>
    <template>
    <graph>
      <map behavior="combination">
        <template><point><coords>(<subsref/>+<subsref parentTemplate="2"/>, <subsref>2</subsref>)</coords></point></template>
        <substitutions><sequence from="1" to="2"/></substitutions>
        <substitutions><sequence from="-5" to="5" step="10"/></substitutions>
      </map>
    </graph>
    </template>
    <substitutions><sequence from="-10" to="5" step="15"/></substitutions>
    </map>
    `},"*");
    });

    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load

    cy.log('Test internal values are set to the correct values')
    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);

      expect(components['/__map1_0_graph1'].descendantsFound._graphical.length).eq(4);
      expect(components['/__map1_1_graph1'].descendantsFound._graphical.length).eq(4);
      expect(components['/___map1_0_map2_0__map1_0_point1'].state.xs[0].tree).eq(-9);
      expect(components['/___map1_0_map2_0__map1_0_point1'].state.xs[1].tree).eq(-5);
      expect(components['/___map1_0_map2_1__map1_0_point1'].state.xs[0].tree).eq(-9);
      expect(components['/___map1_0_map2_1__map1_0_point1'].state.xs[1].tree).eq(5);
      expect(components['/___map1_0_map2_2__map1_0_point1'].state.xs[0].tree).eq(-8);
      expect(components['/___map1_0_map2_2__map1_0_point1'].state.xs[1].tree).eq(-5);
      expect(components['/___map1_0_map2_3__map1_0_point1'].state.xs[0].tree).eq(-8);
      expect(components['/___map1_0_map2_3__map1_0_point1'].state.xs[1].tree).eq(5);
      expect(components['/___map1_1_map2_0__map1_1_point1'].state.xs[0].tree).eq(6);
      expect(components['/___map1_1_map2_0__map1_1_point1'].state.xs[1].tree).eq(-5);
      expect(components['/___map1_1_map2_1__map1_1_point1'].state.xs[0].tree).eq(6);
      expect(components['/___map1_1_map2_1__map1_1_point1'].state.xs[1].tree).eq(5);
      expect(components['/___map1_1_map2_2__map1_1_point1'].state.xs[0].tree).eq(7);
      expect(components['/___map1_1_map2_2__map1_1_point1'].state.xs[1].tree).eq(-5);
      expect(components['/___map1_1_map2_3__map1_1_point1'].state.xs[0].tree).eq(7);
      expect(components['/___map1_1_map2_3__map1_1_point1'].state.xs[1].tree).eq(5);
    })
  });

  it('map with refs',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <map>
    <template>
      <math simplify>
        <subsref name="b"/> + <subsindex name="i"/> + <ref>a</ref> 
        + <math name="q">z</math> + <ref>q</ref> + <ref>b</ref> +<ref>i</ref>
      </math>
      <math>x</math>
    </template>
    <substitutions><sequence from="1" to="2"/></substitutions>
    </map>
    <math name="a">x</math>
    <ref>_map1</ref>
    `},"*");
    });
  
    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load

    cy.log('Test values displayed in browser')
    cy.get('#\\/__map1_0_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+4');
    });
    cy.get('#\\/__map1_0_math3').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#\\/__map1_1_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+8');
    });
    cy.get('#\\/__map1_1_math3 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#\\/a .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#__math3 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+4');
    });
    cy.get('#__math4 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#__math5 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+8');
    });
    cy.get('#__math6 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
  });

  it('map with refs, extended dynamically',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <map>
    <template>
      <math simplify>
        <subsref name="b"/> + <subsindex name="i"/> + <ref>a</ref> 
        + <math name="q">z</math> + <ref>q</ref> + <ref>b</ref> +<ref>i</ref>
      </math>
      <math>x</math>
    </template>
    <substitutions><sequence from="1"><count><number name="count">1</number></count></sequence></substitutions>
    </map>
    <math name="a">x</math>
    <ref>_map1</ref>

    <updatevalue label="double">
      <mathtarget><ref>count</ref></mathtarget>
      <newmathvalue>2<ref>count</ref></newmathvalue>
    </updatevalue>
    `},"*");
    });

    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load
  
    cy.log('Test values displayed in browser')
    cy.get('#\\/__map1_0_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+4');
    });
    cy.get('#\\/__map1_0_math3 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#\\/a .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#__math2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+4');
    });
    cy.get('#__math3 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });

    cy.log('Double the count then test again')
    cy.get('#\\/_updatevalue1_button').click(); //Update Button

    cy.get('#\\/__map1_0_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+4');
    });
    cy.get('#\\/__map1_0_math3').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#\\/__map1_1_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+8');
    });
    cy.get('#\\/__map1_1_math3').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#\\/a').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#__math2').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+4');
    });
    cy.get('#__math3').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#__math7').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+8');
    });
    cy.get('#__math8').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });

    cy.log('Double the count again then test one more time')
    cy.get('#\\/_updatevalue1_button').click(); //Update Button

    cy.get('#\\/__map1_0_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+4');
    });
    cy.get('#\\/__map1_0_math3').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#\\/__map1_1_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+8');
    });
    cy.get('#\\/__map1_1_math3').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#\\/__map1_2_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+12');
    });
    cy.get('#\\/__map1_2_math3').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#\\/__map1_3_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+16');
    });
    cy.get('#\\/__map1_3_math3').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#\\/a').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#__math2').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+4');
    });
    cy.get('#__math3').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#__math7').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+8');
    });
    cy.get('#__math8').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#__math13').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+12');
    });
    cy.get('#__math14').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });
    cy.get('#__math15').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x+2z+16');
    });
    cy.get('#__math16').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('x');
    });

  });

  it('map with reffed template',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <map>
    <template>
      <math simplify="full">sin(<subsindex/><subsref/>)</math>
    </template>
    <substitutions><math>x</math><math>y</math></substitutions>
    </map>
  
    <map>
    <ref>_template1</ref>
    <substitutions><math>q</math><math>p</math></substitutions>
    </map>

    <ref>_map2</ref>
    `},"*");
    });
  
    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load

    cy.log('Test values displayed in browser')
    cy.get('#\\/__map1_0_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('sin(x)');
    });
    cy.get('#\\/__map1_1_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('sin(2y)');
    });
    cy.get('#\\/__map2_0_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('sin(q)');
    });
    cy.get('#\\/__map2_1_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('sin(2p)');
    });
    cy.get('#__math5').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('sin(q)');
    });
    cy.get('#__math6').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('sin(2p)');
    });
  });

  it('graph with new namespace and assignnamespaces',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <ref>/hi/c/_coords1</ref>
    <ref>/hi/s/_coords1</ref>
    <ref>/hi/q/_coords1</ref>
    
    <grapH Name="hi" newNamespace >
    <map assignnamespaces="q, c,s">
      <template>
        <point><coords>(<subsref/>, <subsref>2</subsref>)</coords></point>
      </template>
      <substitutions><sequence from="1" to="2"/></substitutions>
      <substitutions><sequence from="-3" to="-2"/></substitutions>
    </map>
    </graph>
    `},"*");
    });
  
    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load

    cy.log('Test values displayed in browser')
    cy.get('#__coords1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,−2)');
    });
    cy.get('#__coords2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,−3)');
    });
    cy.get('#__coords3 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,−3)');
    });

    cy.log('Test internal values are set to the correct values')
    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);

      expect(components['/hi'].descendantsFound._graphical.length).eq(4);
      expect(components['/hi/q/_point1'].state.xs[0].tree).eq(1);
      expect(components['/hi/q/_point1'].state.xs[1].tree).eq(-3);
      expect(components['/hi/c/_point1'].state.xs[0].tree).eq(1);
      expect(components['/hi/c/_point1'].state.xs[1].tree).eq(-2);
      expect(components['/hi/s/_point1'].state.xs[0].tree).eq(2);
      expect(components['/hi/s/_point1'].state.xs[1].tree).eq(-3);
      expect(components['/hi/__map1_3/_point1'].state.xs[0].tree).eq(2);
      expect(components['/hi/__map1_3/_point1'].state.xs[1].tree).eq(-2);
    })
  });

  it('map reffing subsref of other map',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <map assignnamespaces="u,v,w">
      <template><math>(<subsref/>, <ref>../e/_subsref1</ref>)</math></template>
      <substitutions><sequence from="1" to="3"/></substitutions>
    </map>
    <map assignnamespaces="c,d,e">
      <template><math>sin(<subsref/>)</math></template>
      <substitutions><sequence from="4" to="6"/></substitutions>
    </map>
    `},"*");
    });
  
    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load

    cy.log('Test values displayed in browser')
    cy.get('#\\/u\\/_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,6)');
    });
    cy.get('#\\/v\\/_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,6)');
    });
    cy.get('#\\/w\\/_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,6)');
    });
    cy.get('#\\/c\\/_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('sin(4)');
    });
    cy.get('#\\/d\\/_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('sin(5)');
    });
    cy.get('#\\/e\\/_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('sin(6)');
    });
  });

  it('map reffing other map via childnumber',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <math>1</math>
    <graph>
    <map>
     <template>
      <point><coords>
        (
        <ref prop="x">
          <childnumber><subsref/></childnumber>
          _graph2
        </ref>,
        <subsref/>
        )
      </coords></point>
     </template>
     <substitutions><sequence from="1" to="2"/></substitutions>
    </map>
    </graph>
    
    <graph>
    <map>
     <template>
      <point><coords>(<subsref/>,<subsref/>)</coords></point>
     </template>
     <substitutions><sequence from="8" to="9"/></substitutions>
    </map>
    </graph>
    `},"*");
    });

    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load

    // to wait for page to load
    cy.get('#\\/_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1')
    })

    cy.log('Test internal values are set to the correct values')
    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/_graph1'].descendantsFound._graphical.length).eq(2);
      expect(components['/_graph2'].descendantsFound._graphical.length).eq(2);
      expect(components['/__map1_0_point1'].state.xs[0].tree).eq(8);
      expect(components['/__map1_0_point1'].state.xs[1].tree).eq(1);
      expect(components['/__map1_1_point1'].state.xs[0].tree).eq(9);
      expect(components['/__map1_1_point1'].state.xs[1].tree).eq(2);
      expect(components['/__map2_0_point2'].state.xs[0].tree).eq(8);
      expect(components['/__map2_0_point2'].state.xs[1].tree).eq(8);
      expect(components['/__map2_1_point2'].state.xs[0].tree).eq(9);
      expect(components['/__map2_1_point2'].state.xs[1].tree).eq(9);
    })

  });

  it('map length depending on other map',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <map>
    <template>
     <map>
       <template>
         <math>(<subsref/>, <subsref parentTemplate="2"/>)</math>
       </template>
       <substitutions><sequence from="1"><to><subsref/></to></sequence></substitutions>
     </map>
    </template>
    <substitutions><sequence from="1" to="3"/></substitutions>
    </map>
    `},"*");
    });
  
    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load

    cy.log('Test values displayed in browser')
    cy.get('#\\/___map1_0_map2_0__map1_0_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,1)');
    });
    cy.get('#\\/___map1_1_map2_0__map1_1_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,2)');
    });
    cy.get('#\\/___map1_1_map2_1__map1_1_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,2)');
    });
    cy.get('#\\/___map1_2_map2_0__map1_2_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,3)');
    });
    cy.get('#\\/___map1_2_map2_1__map1_2_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,3)');
    });
    cy.get('#\\/___map1_2_map2_2__map1_2_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,3)');
    });

  });

  it('map begins zero length, reffed multiple times',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>

    <p>
    <map>
    <template><math simplify><subsref/>^2</math><text>,</text></template>
    <substitutions>
    <sequence>
      <from><ref prop="value">sequenceFrom</ref></from>
      <to><ref prop="value">sequenceTo</ref></to>
      <count><ref prop="value">sequenceCount</ref></count>
    </sequence>
    </substitutions>
    </map>
    </p>

    <mathinput name="sequenceFrom" prefill="1"/>
    <mathinput name="sequenceTo" prefill="2"/>
    <mathinput name="sequenceCount" prefill="0"/>
    
    <ref name="refmap2">_map1</ref>
    <ref name="refmap3">refmap2</ref>

    <ref name="refmapthroughp">_p1</ref>
    <ref name="refmapthroughp2">refmapthroughp</ref>
    <ref name="refmapthroughp3">refmapthroughp2</ref>
    `},"*");
    });
  
    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load

    cy.log('At beginning, nothing shown')
    cy.get('#\\/_p1').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });
    cy.get('#__p1').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });
    cy.get('#__p2').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });
    cy.get('#__p3').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });

    cy.get('#__math4').should('not.exist');
    cy.get('#__math6').should('not.exist');
    
    cy.log('make sequence length 1');
    cy.get('#\\/sequencecount_input').clear().type('1{enter}');

    cy.get('#\\/_p1').children('#\\/__map1_0_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#__math4').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#__math6').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#__p1').children('#__math5').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#__p2').children('#__math7').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#__p3').children('#__math8').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });

    cy.log('make sequence length 0 again');
    cy.get('#\\/sequencecount_input').clear().type('0{enter}');

    cy.get('#\\/_p1').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });
    cy.get('#__p1').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });
    cy.get('#__p2').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });
    cy.get('#__p3').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });

    cy.get('#__math4').should('not.exist');
    cy.get('#__math6').should('not.exist');
    

    cy.log('make sequence length 2');
    cy.get('#\\/sequencecount_input').clear().type('2{enter}');

    cy.get('#\\/_p1').children('#\\/__map1_0_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#\\/_p1').children('#\\/__map1_1_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('4');
    });
    cy.get('#__math9').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#__math10').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('4');
    });
    cy.get('#__math13').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#__math14').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('4');
    });
    cy.get('#__p1').children('#__math11').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#__p1').children('#__math12').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('4');
    });
    cy.get('#__p2').children('#__math15').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#__p2').children('#__math16').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('4');
    });
    cy.get('#__p3').children('#__math17').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#__p3').children('#__math18').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('4');
    });

  
    cy.log('change limits');
    cy.get('#\\/sequencefrom_input').clear().type('3{enter}');
    cy.get('#\\/sequenceto_input').clear().type('5{enter}');

    cy.get('#\\/_p1').children('#\\/__map1_0_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#\\/_p1').children('#\\/__map1_1_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });
    cy.get('#__math9').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#__math10').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });
    cy.get('#__math13').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#__math14').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });
    cy.get('#__p1').children('#__math11').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#__p1').children('#__math12').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });
    cy.get('#__p2').children('#__math15').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#__p2').children('#__math16').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });
    cy.get('#__p3').children('#__math17').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#__p3').children('#__math18').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });
  
    cy.log('make sequence length 0 again');
    cy.get('#\\/sequencecount_input').clear().type('0{enter}');

    cy.get('#\\/_p1').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });
    cy.get('#__p1').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });
    cy.get('#__p2').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });
    cy.get('#__p3').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });
    
    cy.get('#__math9').should('not.exist');
    cy.get('#__math10').should('not.exist');
    cy.get('#__math13').should('not.exist');
    cy.get('#__math14').should('not.exist');

    cy.log('make sequence length 3');
    cy.get('#\\/sequencecount_input').clear().type('3{enter}');
 
    cy.get('#\\/_p1').children('#\\/__map1_0_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#\\/_p1').children('#\\/__map1_1_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('16');
    });
    cy.get('#\\/_p1').children('#\\/__map1_2_math1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });
    cy.get('#__math19').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#__math20').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('16');
    });
    cy.get('#__math21').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });
    cy.get('#__math25').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#__math26').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('16');
    });
    cy.get('#__math27').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });
    cy.get('#__p1').children('#__math22').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#__p1').children('#__math23').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('16');
    });
    cy.get('#__p1').children('#__math24').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });
    cy.get('#__p2').children('#__math28').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#__p2').children('#__math29').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('16');
    });
    cy.get('#__p2').children('#__math30').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });
    cy.get('#__p3').children('#__math31').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('9');
    });
    cy.get('#__p3').children('#__math32').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('16');
    });
    cy.get('#__p3').children('#__math33').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('25');
    });

  });

  it('map with circular dependence in template',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <graph>
      <map assignnamespaces="a,b,c">
        <template>
          <point>
            <x><ref>../q</ref><subsref fixed/>^2</x>
            <y><ref prop="x">_point2</ref></y>
          </point>
          <point>
            <x><ref>../r</ref><subsref fixed/></x>
            <y><ref prop="x">_point1</ref></y>
          </point>
        </template>
      <substitutions>
        <sequence>2,4</sequence>
      </substitutions>
      </map>
    </graph>
    <math name="q">1</math>
    <math name="r">1</math>
    <ref prop="coords">a/_point1</ref>
    <ref prop="coords">a/_point2</ref>
    <ref prop="coords">b/_point1</ref>
    <ref prop="coords">b/_point2</ref>
    <ref prop="coords">c/_point1</ref>
    <ref prop="coords">c/_point2</ref>
    `},"*");
    });
  
    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load

    cy.log('Test values displayed in browser')
    cy.get('#__coords1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(4,2)');
    });
    cy.get('#__coords2 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,4)');
    });
    cy.get('#__coords3 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(9,3)');
    });
    cy.get('#__coords4 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,9)');
    });
    cy.get('#__coords5 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(16,4)');
    });
    cy.get('#__coords6 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(4,16)');
    });
    cy.get('#\\/q .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });
    cy.get('#\\/r .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1');
    });

    cy.window().then((win) => {
      let r=1;
      let q=1;
      let s = [2,3,4];
      let xs1 = s.map(v => v*v*q);
      let xs2 = s.map(v => v*r);
      let ns = ["a","b","c"];
      let components = Object.assign({},win.state.components);
      expect(components['/_graph1'].descendantsFound._graphical.length).eq(6);
      for(let ind=0; ind<3; ind++) {
        let namespace = ns[ind];
        expect(components[`/${namespace}/_point1`].state.xs[0].tree).eq(xs1[ind]);
        expect(components[`/${namespace}/_point1`].state.xs[1].tree).eq(xs2[ind]);
        expect(components[`/${namespace}/_point2`].state.xs[0].tree).eq(xs2[ind]);
        expect(components[`/${namespace}/_point2`].state.xs[1].tree).eq(xs1[ind]);
      }
    });

    cy.log("move point a1");
    cy.window().then((win) => {
      let r=1.3;
      let q=-2.1;
      let s = [2,3,4];
      let xs1 = s.map(v => v*v*q);
      let xs2 = s.map(v => v*r);
      let ns = ["a","b","c"];
      let components = Object.assign({},win.state.components);
      
      components['/a/_point1'].movePoint({x: xs1[0], y: xs2[0]})
      for(let ind=0; ind<3; ind++) {
        let namespace = ns[ind];
        expect(components[`/${namespace}/_point1`].state.xs[0].tree).closeTo(xs1[ind],1E-14);
        expect(components[`/${namespace}/_point1`].state.xs[1].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[0].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[1].tree).closeTo(xs1[ind],1E-14);
      }
    });

    cy.log("move point a2");
    cy.window().then((win) => {
      let r=0.7;
      let q=1.8;
      let s = [2,3,4];
      let xs1 = s.map(v => v*v*q);
      let xs2 = s.map(v => v*r);
      let ns = ["a","b","c"];
      let components = Object.assign({},win.state.components);
      
      components['/a/_point2'].movePoint({x: xs2[0], y: xs1[0]})
      for(let ind=0; ind<3; ind++) {
        let namespace = ns[ind];
        expect(components[`/${namespace}/_point1`].state.xs[0].tree).closeTo(xs1[ind],1E-14);
        expect(components[`/${namespace}/_point1`].state.xs[1].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[0].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[1].tree).closeTo(xs1[ind],1E-14);
      }
    });

    cy.log("move point b1");
    cy.window().then((win) => {
      let r=-0.2;
      let q=0.3;
      let s = [2,3,4];
      let xs1 = s.map(v => v*v*q);
      let xs2 = s.map(v => v*r);
      let ns = ["a","b","c"];
      let components = Object.assign({},win.state.components);
      
      components['/b/_point1'].movePoint({x: xs1[1], y: xs2[1]})
      for(let ind=0; ind<3; ind++) {
        let namespace = ns[ind];
        expect(components[`/${namespace}/_point1`].state.xs[0].tree).closeTo(xs1[ind],1E-14);
        expect(components[`/${namespace}/_point1`].state.xs[1].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[0].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[1].tree).closeTo(xs1[ind],1E-14);
      }
    });

    cy.log("move point b2");
    cy.window().then((win) => {
      let r=0.6;
      let q=0.35;
      let s = [2,3,4];
      let xs1 = s.map(v => v*v*q);
      let xs2 = s.map(v => v*r);
      let ns = ["a","b","c"];
      let components = Object.assign({},win.state.components);
      
      components['/b/_point2'].movePoint({x: xs2[1], y: xs1[1]})
      for(let ind=0; ind<3; ind++) {
        let namespace = ns[ind];
        expect(components[`/${namespace}/_point1`].state.xs[0].tree).closeTo(xs1[ind],1E-14);
        expect(components[`/${namespace}/_point1`].state.xs[1].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[0].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[1].tree).closeTo(xs1[ind],1E-14);
      }
    });

    cy.log("move point c1");
    cy.window().then((win) => {
      let r=-0.21;
      let q=-0.46;
      let s = [2,3,4];
      let xs1 = s.map(v => v*v*q);
      let xs2 = s.map(v => v*r);
      let ns = ["a","b","c"];
      let components = Object.assign({},win.state.components);
      
      components['/c/_point1'].movePoint({x: xs1[2], y: xs2[2]})
      for(let ind=0; ind<3; ind++) {
        let namespace = ns[ind];
        expect(components[`/${namespace}/_point1`].state.xs[0].tree).closeTo(xs1[ind],1E-14);
        expect(components[`/${namespace}/_point1`].state.xs[1].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[0].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[1].tree).closeTo(xs1[ind],1E-14);
      }
    });

    cy.log("move point c2");
    cy.window().then((win) => {
      let r=0.37;
      let q=-0.73;
      let s = [2,3,4];
      let xs1 = s.map(v => v*v*q);
      let xs2 = s.map(v => v*r);
      let ns = ["a","b","c"];
      let components = Object.assign({},win.state.components);
      
      components['/c/_point2'].movePoint({x: xs2[2], y: xs1[2]})
      for(let ind=0; ind<3; ind++) {
        let namespace = ns[ind];
        expect(components[`/${namespace}/_point1`].state.xs[0].tree).closeTo(xs1[ind],1E-14);
        expect(components[`/${namespace}/_point1`].state.xs[1].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[0].tree).closeTo(xs2[ind],1E-14);
        expect(components[`/${namespace}/_point2`].state.xs[1].tree).closeTo(xs1[ind],1E-14);
      }
    });

  });

  it('two maps with mutual references, begin zero length, reffed multiple times',() => {
    cy.window().then((win) => { win.postMessage({doenetCode: `
    <text>a</text>
    <graph>
      <map assignnamespaces="a,b,c">
        <template>
          <point>
            <x>-<subsref/></x>
            <y><subsref/><ref prop="x">../q/_point1</ref></y>
          </point>
        </template>
      <substitutions>
        <sequence>
          <from><ref prop="value">sequenceFrom</ref></from>
          <to><ref prop="value">sequenceTo</ref></to>
          <count><ref prop="value">sequenceCount</ref></count>
        </sequence>
      </substitutions>
      </map>
      <map assignnamespaces="q,r,s">
        <template>
          <point>
            <x><subsref/></x>
            <y><subsref/><ref prop="x">../a/_point1</ref></y>
          </point>
        </template>
      <substitutions>
        <sequence>
          <from><ref prop="value">sequenceFrom</ref></from>
          <to><ref prop="value">sequenceTo</ref></to>
          <count><ref prop="value">sequenceCount</ref></count>
        </sequence>
      </substitutions>
      </map>
    </graph>
    
    <mathinput name="sequenceFrom" prefill="1"/>
    <mathinput name="sequenceTo" prefill="2"/>
    <mathinput name="sequenceCount" prefill="0"/>
    
    <graph>
    <ref name="refmap1">_map1</ref>
    <ref name="refmap2">_map2</ref>
    </graph>
    <graph>
    <ref name="refmap1b">refmap1</ref>
    <ref name="refmap2b">refmap2</ref>
    </graph>
    
    <ref name="graph4">_graph1</ref>
    <p><collect components="point">_graph1</collect></p>
    <math>1</math>
    `},"*");
    });

    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load

    // to wait for page to load
    cy.get('#\\/_math1 .mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('1')
    })

    cy.log('At beginning, nothing shown')
    cy.get('#\\/_p1').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });

    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/_graph1'].descendantsFound._graphical.length).eq(0);
      expect(components['/_graph2'].descendantsFound._graphical.length).eq(0);
      expect(components['/_graph3'].descendantsFound._graphical.length).eq(0);
      expect(components['/graph4'].replacements[0].descendantsFound._graphical.length).eq(0);
    })
    
    cy.log('make sequence length 1');
    cy.get('#\\/sequencecount_input').clear().type('1{enter}');

    cy.get('#\\/_p1').children('#__coords1').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−1,1)');
    });
    cy.get('#\\/_p1').children('#__coords2').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,−1)');
    });

    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/_graph1'].descendantsFound._graphical.length).eq(2);
      expect(components['/_graph2'].descendantsFound._graphical.length).eq(2);
      expect(components['/_graph3'].descendantsFound._graphical.length).eq(2);
      expect(components['/graph4'].replacements[0].descendantsFound._graphical.length).eq(2);
      expect(components['/a/_point1'].state.coords.tree).eqls(["tuple",-1,1]);
      expect(components['/q/_point1'].state.coords.tree).eqls(["tuple",1,-1]);
      expect(components['/refmap1'].replacements[0].state.coords.tree).eqls(["tuple",-1,1]);
      expect(components['/refmap2'].replacements[0].state.coords.tree).eqls(["tuple",1,-1]);
      expect(components['/refmap1b'].replacements[0].state.coords.tree).eqls(["tuple",-1,1]);
      expect(components['/refmap2b'].replacements[0].state.coords.tree).eqls(["tuple",1,-1]);
      expect(components['/refmap1'].replacements[0].state.coords.tree).eqls(["tuple",-1,1]);
      expect(components['/refmap2'].replacements[0].state.coords.tree).eqls(["tuple",1,-1]);
      expect(components['/graph4'].replacements[0].activeChildren[0].state.coords.tree).eqls(["tuple",-1,1]);
      expect(components['/graph4'].replacements[0].activeChildren[1].state.coords.tree).eqls(["tuple",1,-1]);
    })

    cy.log('make sequence length 0 again');
    cy.get('#\\/sequencecount_input').clear().type('0{enter}');

    cy.get('#\\/_p1').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });

    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/_graph1'].descendantsFound._graphical.length).eq(0);
      expect(components['/_graph2'].descendantsFound._graphical.length).eq(0);
      expect(components['/_graph3'].descendantsFound._graphical.length).eq(0);
      expect(components['/graph4'].replacements[0].descendantsFound._graphical.length).eq(0);
    })
    
    
    cy.log('make sequence length 2');
    cy.get('#\\/sequencecount_input').clear().type('2{enter}');

    cy.get('#\\/_p1').children('#__coords3').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−1,1)');
    });
    cy.get('#\\/_p1').children('#__coords4').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−2,2)');
    });
    cy.get('#\\/_p1').children('#__coords5').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(1,−1)');
    });
    cy.get('#\\/_p1').children('#__coords6').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(2,−2)');
    });

    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/_graph1'].descendantsFound._graphical.length).eq(4);
      expect(components['/_graph2'].descendantsFound._graphical.length).eq(4);
      expect(components['/_graph3'].descendantsFound._graphical.length).eq(4);
      expect(components['/graph4'].replacements[0].descendantsFound._graphical.length).eq(4);
      expect(components['/a/_point1'].state.coords.tree).eqls(["tuple",-1,1]);
      expect(components['/q/_point1'].state.coords.tree).eqls(["tuple",1,-1]);
      expect(components['/refmap1'].replacements[0].state.coords.tree).eqls(["tuple",-1,1]);
      expect(components['/refmap2'].replacements[0].state.coords.tree).eqls(["tuple",1,-1]);
      expect(components['/refmap1b'].replacements[0].state.coords.tree).eqls(["tuple",-1,1]);
      expect(components['/refmap2b'].replacements[0].state.coords.tree).eqls(["tuple",1,-1]);
      expect(components['/refmap1'].replacements[0].state.coords.tree).eqls(["tuple",-1,1]);
      expect(components['/refmap2'].replacements[0].state.coords.tree).eqls(["tuple",1,-1]);
      expect(components['/graph4'].replacements[0].activeChildren[0].state.coords.tree).eqls(["tuple",-1,1]);
      expect(components['/graph4'].replacements[0].activeChildren[2].state.coords.tree).eqls(["tuple",1,-1]);
      expect(components['/b/_point1'].state.coords.tree).eqls(["tuple",-2,2]);
      expect(components['/r/_point1'].state.coords.tree).eqls(["tuple",2,-2]);
      expect(components['/refmap1'].replacements[1].state.coords.tree).eqls(["tuple",-2,2]);
      expect(components['/refmap2'].replacements[1].state.coords.tree).eqls(["tuple",2,-2]);
      expect(components['/refmap1b'].replacements[1].state.coords.tree).eqls(["tuple",-2,2]);
      expect(components['/refmap2b'].replacements[1].state.coords.tree).eqls(["tuple",2,-2]);
      expect(components['/refmap1'].replacements[1].state.coords.tree).eqls(["tuple",-2,2]);
      expect(components['/refmap2'].replacements[1].state.coords.tree).eqls(["tuple",2,-2]);
      expect(components['/graph4'].replacements[0].activeChildren[1].state.coords.tree).eqls(["tuple",-2,2]);
      expect(components['/graph4'].replacements[0].activeChildren[3].state.coords.tree).eqls(["tuple",2,-2]);
   })

  
    cy.log('change limits');
    cy.get('#\\/sequencefrom_input').clear().type('3{enter}');
    cy.get('#\\/sequenceto_input').clear().type('5{enter}');

    cy.get('#\\/_p1').children('#__coords3').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−3,9)');
    });
    cy.get('#\\/_p1').children('#__coords4').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−5,15)');
    });
    cy.get('#\\/_p1').children('#__coords5').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,−9)');
    });
    cy.get('#\\/_p1').children('#__coords6').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(5,−15)');
    });

    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/_graph1'].descendantsFound._graphical.length).eq(4);
      expect(components['/_graph2'].descendantsFound._graphical.length).eq(4);
      expect(components['/_graph3'].descendantsFound._graphical.length).eq(4);
      expect(components['/graph4'].replacements[0].descendantsFound._graphical.length).eq(4);
      expect(components['/a/_point1'].state.coords.tree).eqls(["tuple",-3,9]);
      expect(components['/q/_point1'].state.coords.tree).eqls(["tuple",3,-9]);
      expect(components['/refmap1'].replacements[0].state.coords.tree).eqls(["tuple",-3,9]);
      expect(components['/refmap2'].replacements[0].state.coords.tree).eqls(["tuple",3,-9]);
      expect(components['/refmap1b'].replacements[0].state.coords.tree).eqls(["tuple",-3,9]);
      expect(components['/refmap2b'].replacements[0].state.coords.tree).eqls(["tuple",3,-9]);
      expect(components['/refmap1'].replacements[0].state.coords.tree).eqls(["tuple",-3,9]);
      expect(components['/refmap2'].replacements[0].state.coords.tree).eqls(["tuple",3,-9]);
      expect(components['/graph4'].replacements[0].activeChildren[0].state.coords.tree).eqls(["tuple",-3,9]);
      expect(components['/graph4'].replacements[0].activeChildren[2].state.coords.tree).eqls(["tuple",3,-9]);
      expect(components['/b/_point1'].state.coords.tree).eqls(["tuple",-5,15]);
      expect(components['/r/_point1'].state.coords.tree).eqls(["tuple",5,-15]);
      expect(components['/refmap1'].replacements[1].state.coords.tree).eqls(["tuple",-5,15]);
      expect(components['/refmap2'].replacements[1].state.coords.tree).eqls(["tuple",5,-15]);
      expect(components['/refmap1b'].replacements[1].state.coords.tree).eqls(["tuple",-5,15]);
      expect(components['/refmap2b'].replacements[1].state.coords.tree).eqls(["tuple",5,-15]);
      expect(components['/refmap1'].replacements[1].state.coords.tree).eqls(["tuple",-5,15]);
      expect(components['/refmap2'].replacements[1].state.coords.tree).eqls(["tuple",5,-15]);
      expect(components['/graph4'].replacements[0].activeChildren[1].state.coords.tree).eqls(["tuple",-5,15]);
      expect(components['/graph4'].replacements[0].activeChildren[3].state.coords.tree).eqls(["tuple",5,-15]);
   })

  
    cy.log('make sequence length 0 again');
    cy.get('#\\/sequencecount_input').clear().type('0{enter}');

    cy.get('#\\/_p1').invoke('text').then((text) => {
      expect(text.trim()).equal('');
    });

    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/_graph1'].descendantsFound._graphical.length).eq(0);
      expect(components['/_graph2'].descendantsFound._graphical.length).eq(0);
      expect(components['/_graph3'].descendantsFound._graphical.length).eq(0);
      expect(components['/graph4'].replacements[0].descendantsFound._graphical.length).eq(0);
    })
    
    cy.log('make sequence length 3');
    cy.get('#\\/sequencecount_input').clear().type('3{enter}');
 

    cy.get('#\\/_p1').children('#__coords7').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−3,9)');
    });
    cy.get('#\\/_p1').children('#__coords8').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−4,12)');
    });
    cy.get('#\\/_p1').children('#__coords9').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(−5,15)');
    });
    cy.get('#\\/_p1').children('#__coords10').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(3,−9)');
    });
    cy.get('#\\/_p1').children('#__coords11').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(4,−12)');
    });
    cy.get('#\\/_p1').children('#__coords12').find('.mjx-mrow').eq(0).invoke('text').then((text) => {
      expect(text.trim()).equal('(5,−15)');
    });


    cy.window().then((win) => {
      let components = Object.assign({},win.state.components);
      expect(components['/_graph1'].descendantsFound._graphical.length).eq(6);
      expect(components['/_graph2'].descendantsFound._graphical.length).eq(6);
      expect(components['/_graph3'].descendantsFound._graphical.length).eq(6);
      expect(components['/graph4'].replacements[0].descendantsFound._graphical.length).eq(6);
      expect(components['/a/_point1'].state.coords.tree).eqls(["tuple",-3,9]);
      expect(components['/q/_point1'].state.coords.tree).eqls(["tuple",3,-9]);
      expect(components['/refmap1'].replacements[0].state.coords.tree).eqls(["tuple",-3,9]);
      expect(components['/refmap2'].replacements[0].state.coords.tree).eqls(["tuple",3,-9]);
      expect(components['/refmap1b'].replacements[0].state.coords.tree).eqls(["tuple",-3,9]);
      expect(components['/refmap2b'].replacements[0].state.coords.tree).eqls(["tuple",3,-9]);
      expect(components['/refmap1'].replacements[0].state.coords.tree).eqls(["tuple",-3,9]);
      expect(components['/refmap2'].replacements[0].state.coords.tree).eqls(["tuple",3,-9]);
      expect(components['/graph4'].replacements[0].activeChildren[0].state.coords.tree).eqls(["tuple",-3,9]);
      expect(components['/graph4'].replacements[0].activeChildren[3].state.coords.tree).eqls(["tuple",3,-9]);
      expect(components['/b/_point1'].state.coords.tree).eqls(["tuple",-4,12]);
      expect(components['/r/_point1'].state.coords.tree).eqls(["tuple",4,-12]);
      expect(components['/refmap1'].replacements[1].state.coords.tree).eqls(["tuple",-4,12]);
      expect(components['/refmap2'].replacements[1].state.coords.tree).eqls(["tuple",4,-12]);
      expect(components['/refmap1b'].replacements[1].state.coords.tree).eqls(["tuple",-4,12]);
      expect(components['/refmap2b'].replacements[1].state.coords.tree).eqls(["tuple",4,-12]);
      expect(components['/refmap1'].replacements[1].state.coords.tree).eqls(["tuple",-4,12]);
      expect(components['/refmap2'].replacements[1].state.coords.tree).eqls(["tuple",4,-12]);
      expect(components['/graph4'].replacements[0].activeChildren[1].state.coords.tree).eqls(["tuple",-4,12]);
      expect(components['/graph4'].replacements[0].activeChildren[4].state.coords.tree).eqls(["tuple",4,-12]);
      expect(components['/c/_point1'].state.coords.tree).eqls(["tuple",-5,15]);
      expect(components['/s/_point1'].state.coords.tree).eqls(["tuple",5,-15]);
      expect(components['/refmap1'].replacements[2].state.coords.tree).eqls(["tuple",-5,15]);
      expect(components['/refmap2'].replacements[2].state.coords.tree).eqls(["tuple",5,-15]);
      expect(components['/refmap1b'].replacements[2].state.coords.tree).eqls(["tuple",-5,15]);
      expect(components['/refmap2b'].replacements[2].state.coords.tree).eqls(["tuple",5,-15]);
      expect(components['/refmap1'].replacements[2].state.coords.tree).eqls(["tuple",-5,15]);
      expect(components['/refmap2'].replacements[2].state.coords.tree).eqls(["tuple",5,-15]);
      expect(components['/graph4'].replacements[0].activeChildren[2].state.coords.tree).eqls(["tuple",-5,15]);
      expect(components['/graph4'].replacements[0].activeChildren[5].state.coords.tree).eqls(["tuple",5,-15]);
   })


  });

  it('map points to adapt to math', () => {
    cy.window().then((win) => {
      win.postMessage({
        doenetCode: `
    <text>a</text>
    <p>Number of points: <mathinput name="number"/></p>
    <p>Step size: <mathinput name="step" /></p>
    
    <math>
      <map>
        <template><point>(<subsref/>, sin(<subsref/>))</point></template>
        <substitutions>
          <sequence from="2">
            <count><ref prop="value">number</ref></count>
            <step><ref prop="value">step</ref></step>
          </sequence>
        </substitutions>
      </map>
    </math>
    `}, "*");
    });

    cy.get('#\\/_text1').should('have.text', 'a');  //wait for window to load

    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/_math1'].activeChildren.length).eq(0);
    })

    cy.get("#\\/number_input").clear().type("10{enter}");
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/_math1'].activeChildren.length).eq(0);
    })

    cy.get("#\\/step_input").clear().type("1{enter}");
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/_math1'].activeChildren.length).eq(10);
      for (let i = 0; i < 10; i++) {
        let j=i+2;
        expect(components['/_math1'].activeChildren[i].state.value.tree).eqls(["tuple", j, ["apply", "sin", j]]);
      }
    })

    cy.get("#\\/number_input").clear().type("20{enter}");

    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/_math1'].activeChildren.length).eq(20);
      for (let i = 0; i < 20; i++) {
        let j=i+2;
        expect(components['/_math1'].activeChildren[i].state.value.tree).eqls(["tuple", j, ["apply", "sin", j]]);
      }
    })

    cy.get("#\\/step_input").clear().type("0.5{enter}");
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/_math1'].activeChildren.length).eq(20);
      for (let i = 0; i < 20; i++) {
        let j=2+i*0.5;
        expect(components['/_math1'].activeChildren[i].state.value.tree).eqls(["tuple", j, ["apply", "sin", j]]);
      }
    })

    cy.get("#\\/number_input").clear().type("10{enter}");
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/_math1'].activeChildren.length).eq(10);
      for (let i = 0; i < 10; i++) {
        let j=2+i*0.5;
        expect(components['/_math1'].activeChildren[i].state.value.tree).eqls(["tuple", j, ["apply", "sin", j]]);
      }
    })

    cy.get("#\\/step_input").clear().type("{enter}");
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/_math1'].activeChildren.length).eq(0);
    })

    cy.get("#\\/number_input").clear().type("5{enter}");
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/_math1'].activeChildren.length).eq(0);
    })

    cy.get("#\\/step_input").clear().type("-3{enter}");
    cy.window().then((win) => {
      let components = Object.assign({}, win.state.components);
      expect(components['/_math1'].activeChildren.length).eq(5);
      for (let i = 0; i < 5; i++) {
        let j=2-i*3;
        expect(components['/_math1'].activeChildren[i].state.value.tree).eqls(["tuple", j, ["apply", "sin", j]]);
      }
    })

  });



});