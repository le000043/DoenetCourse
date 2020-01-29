import Input from './abstract/Input';

export default class Textinput extends Input {
  static componentType = "textinput";

  static createPropertiesObject({standardComponentTypes}) {
    let properties = super.createPropertiesObject({
      standardComponentTypes: standardComponentTypes
    });
    properties.prefill = {default: ""};
    properties.size = {default: 10};
    return properties;
  }

  static returnChildLogic ({standardComponentTypes, allComponentClasses, components}) {
    let childLogic = super.returnChildLogic({
      standardComponentTypes: standardComponentTypes,
      allComponentClasses: allComponentClasses,
      components: components,
    });

    childLogic.newLeaf({
      name: "atMostOneText",
      componentType: "text",
      comparison: "atMost",
      number: 1,
      setAsBase: true,
    })

    return childLogic;
  }


  updateState(args = {}) {
    super.updateState(args);

    if(args.init) {

      this.makePublicStateVariable({
        variableName: "value",
        componentType: "text",
      });
      this.makePublicStateVariable({
        variableName: "submittedvalue",
        componentType: "text",
      });
      this.makePublicStateVariable({
        variableName: "creditachieved",
        componentType: "number"
      });
      this.makePublicStateVariable({
        variableName: "numbertimessubmitted",
        componentType: "number"
      });
  
      // if not essential, initialize submittedvalue to empty string
      if(this._state.submittedvalue.essential !== true) {
        this.state.submittedvalue = ""
      }
      if(this._state.numbertimessubmitted.essential !== true) {
        this.state.numbertimessubmitted = 0
      }
      if(this._state.creditachieved.essential !== true) {
        this.state.creditachieved = 0;
      }
      // make value, submittedvalue, creditachieved, numbertimessubmitted essential
      // as they are used to store changed quantities
      this._state.value.essential = true;
      this._state.submittedvalue.essential = true;
      this._state.creditachieved.essential = true;
      this._state.numbertimessubmitted.essential = true;

      this.updateText = this.updateText.bind(
        new Proxy(this, this.readOnlyProxyHandler)
      );
      this.setRendererValueAsSubmitted = this.setRendererValueAsSubmitted.bind(
        new Proxy(this, this.readOnlyProxyHandler)
      );

      if(this._state.rendererValueAsSubmitted === undefined) {
        this._state.rendererValueAsSubmitted = {essential: true};
      }
    }

    if(!this.childLogicSatisfied) {
      this.unresolvedState.value = true;
      this.unresolvedState.submittedvalue = true;
      return;
    }

    let trackChanges = this.currentTracker.trackChanges;
    let childrenChanged = trackChanges.childrenChanged(this.componentName);

    if(childrenChanged) {
      let atMostOneText = this.childLogic.returnMatches("atMostOneText");
      if(atMostOneText.length === 1) {
        this.state.textChild = this.activeChildren[atMostOneText[0]];
      }else {
        delete this.state.textChild;
      }
    }

    delete this.unresolvedState.value;
    delete this.unresolvedState.submittedvalue;

    if(this.state.textChild !== undefined) {
      if(this.state.textChild.unresolvedState.value) {
        this.unresolvedState.value = true;
        this.unresolvedState.submittedvalue = true;
      }else {
        // we could update this only if children changed or value of textchild changed
        // but this step is quick
        this.state.value = this.state.textChild.state.value;
      }
    }else {
      if(this.state.value === undefined) {
        if(this.unresolvedState.prefill) {
          this.unresolvedState.value = true;
          this.unresolvedState.submittedvalue = true;
        }else {
          this.state.value = this.state.prefill;
        }
      }
    }

    if (this.ancestors === undefined){
      this.unresolvedState.includeCheckWork = true;
      this.unresolvedDependencies = {[this.state.includeCheckWork]: true};
    }else{
      delete this.unresolvedState.includeCheckWork;
      delete this.unresolvedDependencies;

      if (this.ancestorsWhoGathered === undefined){
        //textinput not inside an answer component
        this.state.includeCheckWork = false;
      }else{
        this.state.answerAncestor = undefined;
        for (let componentName of this.ancestorsWhoGathered){
          if (this.components[componentName].componentType === "answer"){
            this.state.answerAncestor = this.components[componentName];
            break;
          }
        }
        if (this.state.answerAncestor === undefined){
          //textinput not inside an answer component
          this.state.includeCheckWork = false;
        }else{
          this.state.allAwardsJustSubmitted = this.state.answerAncestor.state.allAwardsJustSubmitted;
          if (this.state.answerAncestor.state.delegateCheckWork){
            this.state.includeCheckWork = true;
          }else{
            this.state.includeCheckWork = false;
          }
        }
      }
    }
    this.state.valueHasBeenValidated = false;

    if (this.state.allAwardsJustSubmitted && this.state.numbertimessubmitted > 0 && this.state.value === this.state.submittedvalue) {
      this.state.valueHasBeenValidated = true;
    }

    if(this.state.rendererValueAsSubmitted === undefined) {
      // first time through, use valueHasBeenValidated
      this.state.rendererValueAsSubmitted = this.state.valueHasBeenValidated;
    }

  }


  updateText({text}){
    this.requestUpdate({
      updateType: "updateValue",
      updateInstructions: [{
        componentName: this.componentName,
        variableUpdates: {
          value: {changes: text},
        }
      }]
    })
  }

  setRendererValueAsSubmitted(val) {
    this.requestUpdate({
      updateType: "updateValue",
      updateInstructions: [{
        componentName: this.componentName,
        variableUpdates: {
          rendererValueAsSubmitted: {changes: val},
        }
      }]
    })
  }

  allowDownstreamUpdates(status) {
    // since can't change via parents, 
    // only non-initial change can be due to reference
    return(status.initialChange === true || this.state.modifybyreference === true);
  }

  get variablesUpdatableDownstream() {
    // only allowed to change these state variables
    return [
      "value", "submittedvalue", "creditachieved", "numbertimessubmitted",
      "rendererValueAsSubmitted"
    ];
  }

  calculateDownstreamChanges({stateVariablesToUpdate, stateVariableChangesToSave,
    dependenciesToUpdate}) {

    if("value" in stateVariablesToUpdate && this.state.textChild) {
      let textName = this.state.textChild.componentName;
      dependenciesToUpdate[textName] = {value: {changes: stateVariablesToUpdate.value.changes}};
    }

    let shadowedResult = this.updateShadowSources({
      newStateVariables: stateVariablesToUpdate,
      dependenciesToUpdate: dependenciesToUpdate,
    });
    let shadowedStateVariables = shadowedResult.shadowedStateVariables;
    let isReplacement = shadowedResult.isReplacement;


    // if didn't update a downstream referenceShadow and didn't have textChild
    // then this textinput is at the bottom
    // and we need to give core instructions to update its state variables explicitly
    // if the the update is successful
    if(Object.keys(shadowedStateVariables).length === 0 &&
        // !isReplacement && 
        !this.state.textChild) {
      Object.assign(stateVariableChangesToSave, stateVariablesToUpdate);
    }

    return true;
    
  }

  initializeRenderer({}){
    if(this.renderer !== undefined) {
      this.updateRenderer();
      return;
    }
    
    const actions = {
      updateText: this.updateText,
      setRendererValueAsSubmitted: this.setRendererValueAsSubmitted,
    }
    if (this.state.answerAncestor !== undefined){
      actions.submitAnswer = this.state.answerAncestor.submitAnswer;
    }
    
    this.renderer = new this.availableRenderers.textinput({
      actions: actions,
      text: this.state.value,
      key: this.componentName,
      includeCheckWork: this.state.includeCheckWork,
      creditachieved: this.state.creditachieved,
      valueHasBeenValidated: this.state.valueHasBeenValidated,
      numbertimessubmitted: this.state.numbertimessubmitted,
      size: this.state.size,
      showCorrectness: this.flags.showCorrectness,
    });
  }

  updateRenderer(){
    this.renderer.updateTextinputRenderer({
      text: this.state.value,
      creditachieved: this.state.creditachieved,
      valueHasBeenValidated: this.state.valueHasBeenValidated,
      numbertimessubmitted: this.state.numbertimessubmitted,
    });
    
  }
 
}
