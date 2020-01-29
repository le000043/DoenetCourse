import React from 'react';
import me from 'math-expressions';
import ReactTextInput from './ReactTextInput';
import BaseRenderer from './BaseRenderer';

class MathinputRenderer extends BaseRenderer {
  constructor({actions, mathExpression, key,includeCheckWork,creditachieved,
    valueHasBeenValidated,numbertimessubmitted,size, showCorrectness }){

    super({key: key});

    this.actions = actions;
    this.includeCheckWork = includeCheckWork;
    this.creditachieved = creditachieved;
    this.valueHasBeenValidated = valueHasBeenValidated;
    this.numbertimessubmitted = numbertimessubmitted;
    this.size = size;
    this.showCorrectness = showCorrectness;

    let initialTextValue = mathExpression.toString();
    //Remove __ value so it doesn't show
    if(initialTextValue === '\uFF3F') { initialTextValue = "";}

    this.pushNewTextValue = this.pushNewTextValue.bind(this);

    this.sharedState = {
      textValue: initialTextValue
    }

    this.mathExpression = mathExpression;
  }

  pushNewTextValue(){

    let newMathExpression = this.calculateMathExpressionFromText();
    if(!this.mathExpressionExactEquality(newMathExpression, this.mathExpression)) {
      this.mathExpression = newMathExpression;
      this.actions.updateMathExpression({
        mathExpression: this.mathExpression
      });
    }
  
  }

  mathExpressionExactEquality(mathExpression1, mathExpression2) {
    // TODO: a better deep comparison of mathExpression
    // using an internal function that doesn't rely on tree?
    return JSON.stringify(mathExpression1.tree) === JSON.stringify(mathExpression2.tree);
  }

  updateMathinputRenderer({mathExpression,creditachieved,valueHasBeenValidated,numbertimessubmitted}){

    if (mathExpression !== undefined){
      // TODO: what should happen when have an invalid expression?
      if(!this.mathExpressionExactEquality(mathExpression, this.mathExpression)) {
        this.mathExpression = mathExpression;
        let textValue = this.mathExpression.toString();
        if(textValue === '\uFF3F') {
          textValue = "";
        }
        //tell the render it has a new value
        this.sharedState.textValue = textValue;
      }
    }
    
    this.creditachieved = creditachieved;
    this.valueHasBeenValidated = valueHasBeenValidated;
    this.numbertimessubmitted = numbertimessubmitted;
    
  }

  calculateMathExpressionFromText() {
    let expression;
    try {
      expression = me.fromText(this.sharedState.textValue);
    }catch (e) {
      // TODO: error on bad text
      expression = me.fromAst('\uFF3F');

    }
    return expression;
  }

  jsxCode(){
    
    return <ReactTextInput 
    free={{sharedState:this.sharedState, pushNewTextValue: this.pushNewTextValue}}  
    key={this._key} 
    _key={this._key} 
    includeCheckWork={this.includeCheckWork}
    actions={this.actions}
    creditachieved={this.creditachieved}
    valueHasBeenValidated={this.valueHasBeenValidated}
    numbertimessubmitted={this.numbertimessubmitted}
    showMathPreview={true}
    size={this.size}
    showCorrectness={this.showCorrectness}
    />
  }

}

let AvailableRenderers = {
  mathinput: MathinputRenderer,
}

export default AvailableRenderers;
