import BlockComponent from './BlockComponent';
import {getVariantsForDescendants} from '../../utils/variants';

export default class SectioningComponent extends BlockComponent {
  static componentType = "_sectioningcomponent";

  static createPropertiesObject({standardComponentTypes}) {
    let properties = super.createPropertiesObject({
      standardComponentTypes: standardComponentTypes
    });
    properties.title = {default: "", componentType: "text"};
    properties.aggregatescores = {default: false};
    properties.weight = {default: 1};
    // properties.possiblepoints = {default: undefined};
    // properties.aggregatebypoints = {default: false};

    return properties;
  }

  static returnChildLogic ({standardComponentTypes, allComponentClasses, components}) {
    let childLogic = super.returnChildLogic({
      standardComponentTypes: standardComponentTypes,
      allComponentClasses: allComponentClasses,
      components: components,
    });

    childLogic.newLeaf({
      name: 'anything',
      componentType: '_base',
      comparison: 'atLeast',
      number: 0,
      setAsBase: true,
    });

    return childLogic;
  }

  updateState(args={}) {
    if(args.init) {
      this.makePublicStateVariable({
        variableName: "creditachieved",
        componentType: "number",
        additionalProperties: {
          displaydigits: 3,
        }
      });
      this.makePublicStateVariable({
        variableName: "percentcreditachieved",
        componentType: "number",
        additionalProperties: {
          displaydigits: 3,
        }
      });
      // this.makePublicStateVariable({
      //   variableName: "pointsachieved",
      //   componentType: "number"
      // });

      if(!this._state.creditachieved.essential) {
        this.state.creditachieved = 0;
        this._state.creditachieved.essential = true;
      }
      this.state.percentcreditachieved = this.state.creditachieved*100;

      if(this.doenetAttributes.isVariantComponent) {
        this.state.selectedVariant = this.sharedParameters.selectedVariant;
        this._state.selectedVariant.essential = true;
      }

      if(this._state.viewedSolution === undefined) {
        this.state.viewedSolution = false;
      }
      this._state.viewedSolution.essential = true;

    }

    super.updateState(args);


    this.state.level = 1;
    this.state.containerTag = "section";

    if(this.state.aggregatescores) {
      this.calculatecreditachieved();
    }
  }

  calculatecreditachieved() {
    // if(this.state.aggregatebypoints) {
    //   let pointsachieved = 0;
    //   let totalPoints = 0;
    //   for(let component of this.descendantsFound.scoredComponent) {
    //     let possiblePoints = component.state.possiblepoints;
    //     if(possiblePoints === undefined) {
    //       possiblePoints = component.state.weight;
    //     }
    //     totalPoints += possiblePoints;
    //     pointsachieved += possiblePoints * component.state.creditachieved;
    //   }
    //   this.state.creditachieved = pointsachieved/totalPoints;
    //   this.state.possiblepoints = totalPoints;
    
    // }else {
      let creditSum = 0;
      let totalWeight = 0;

      for(let component of this.descendantsFound.scoredComponents) {
        let weight = component.state.weight;
        creditSum += component.state.creditachieved * weight;
        totalWeight += weight;
      }
      this.state.creditachieved = creditSum / totalWeight;
      this.state.percentcreditachieved = this.state.creditachieved*100;
    // }

    // if(this.state.possiblePoints !== undefined) {
    //   this.state.pointsachieved = this.state.creditachieved * this.state.possiblePoints;
    // }
  }

  initializeRenderer(){
    if(this.renderer === undefined) {
      this.renderer = new this.availableRenderers.section({
        key: this.componentName,
        title: this.state.title,
        level: this.state.level,
        containerTag: this.state.containerTag,
        viewedSolution: this.state.viewedSolution,
      });
    }
  }

  updateRenderer(){
    this.renderer.updateSection({
      title: this.state.title,
      viewedSolution: this.state.viewedSolution,
    });
  }

  updateChildrenWhoRender(){
    this.childrenWhoRender = this.activeChildren.map(x => x.componentName);
  }

  get descendantSearchClasses () {
    return [{
      classNames: ["_sectioningcomponent", "answer"],
      recurseToMatchedChildren: false,
      key: "scoredComponents",
      childCondition: child => child.componentType === "answer" || child.state.aggregatescores,
      skip: !this.state.aggregatescores,
    }];
  }

  static previewSerializedComponent({serializedComponent, sharedParameters, components}) {
    if(serializedComponent.children === undefined) {
      return [];
    }
    
    let variantControlInd;
    let variantControlChild
    for(let [ind,child] of serializedComponent.children.entries()) {
      if(child.componentType === "variantcontrol" || (
        child.createdComponent && components[child.componentName].componentType === "variantcontrol"
      )) {
        variantControlInd = ind;
        variantControlChild = child;
        break;
      }
    }

    if(variantControlInd === undefined) {
      return [];
    }

    // have a variant control child, so this section has its own variants

    // if have desired variant value or index
    // add that information to variantControl child
    let desiredVariant = serializedComponent.variants.desiredVariant;
    if(desiredVariant !== undefined) {
      if(desiredVariant.index !== undefined) {
        variantControlChild.variants.desiredVariantNumber = desiredVariant.index;
      }else if(desiredVariant.value !== undefined) {
        variantControlChild.variants.desiredVariant = desiredVariant.value;
      }
    }

    let creationInstructions = [];
    creationInstructions.push({createChildren: [variantControlInd]});
    if(serializedComponent.variants.uniquevariants) {
      sharedParameters.numberOfVariants = serializedComponent.variants.numberOfVariants;
    }
    
    creationInstructions.push({callMethod: "setUpVariant"})

    return creationInstructions;

  }

  static setUpVariant({serializedComponent, sharedParameters, definingChildrenSoFar,
    allComponentClasses}) {
    let variantcontrolChild;
    for(let child of definingChildrenSoFar) {
      if(child !== undefined && child.componentType === "variantcontrol") {
        variantcontrolChild = child;
        break;
      }
    }
    sharedParameters.variant = variantcontrolChild.state.selectedVariant;
    sharedParameters.variantNumber = variantcontrolChild.state.selectedVariantNumber;
    sharedParameters.selectRng = variantcontrolChild.getRng();
    sharedParameters.allPossibleVariants = variantcontrolChild.state.variants;

    // console.log("****Variant for sectioning component****")
    // console.log("Selected seed: " + variantcontrolChild.state.selectedSeed);
    console.log("Variant for " + this.componentType + ": " + sharedParameters.variant);

    // if subvariants were specified, add those the corresponding descendants
    let desiredVariant = serializedComponent.variants.desiredVariant;

    if(desiredVariant === undefined) {
      desiredVariant = {};
    }

    // if subvariants aren't defined but we have uniquevariants specified
    // then calculate variant information for the descendant variant component
    if(desiredVariant.subvariants === undefined && serializedComponent.variants.uniquevariants) {
      let variantInfo = this.getUniqueVariant({
        serializedComponent: serializedComponent,
        variantNumber: sharedParameters.variantNumber,
        allComponentClasses: allComponentClasses,
      })
      if(variantInfo.success) {
        Object.assign(desiredVariant, variantInfo.desiredVariant);
      }
    }

    if(desiredVariant !== undefined && desiredVariant.subvariants !== undefined && 
      serializedComponent.variants.descendantVariantComponents !== undefined) {
      for(let ind in desiredVariant.subvariants) {
        let subvariant = desiredVariant.subvariants[ind];
        let variantComponent = serializedComponent.variants.descendantVariantComponents[ind];
        if(variantComponent === undefined) {
          break;
        }
        variantComponent.variants.desiredVariant = subvariant;
      }
    }

  }

  static determineNumberOfUniqueVariants({serializedComponent}) {
    if(serializedComponent.children === undefined) {
      return {success: true};
    }
    
    let variantControlInd;
    let variantControlChild
    for(let [ind,child] of serializedComponent.children.entries()) {
      if(child.componentType === "variantcontrol" || (
        child.createdComponent && components[child.componentName].componentType === "variantcontrol"
      )) {
        variantControlInd = ind;
        variantControlChild = child;
        break;
      }
    }

    if(variantControlInd === undefined) {
      return {success: true};
    }


    // Find number of variants from variantControl
    let numberOfVariants = 100;
    if(variantControlChild.children !== undefined) {
      for(let child of variantControlChild.children) {
        if(child.componentType === "nvariants") {
          // calculate nvariants only if has its value set directly 
          // or if has a single child that is a string
          let foundValid = false;
          if(child.state !== undefined && child.state.value !== undefined) {
            numberOfVariants = Math.round(Number(child.state.value));
            foundValid = true;
          }
          // children overwrite state
          if(child.children !== undefined && child.children.length === 1 &&
              child.children[0].componentType === "string") {
            numberOfVariants = Math.round(Number(child.children[0].state.value));
            foundValid = true;
          }
          if(!foundValid) {
            return {success: false}
          }
          break;
        }
      }
    }

    // check if uniquevariants is already be defined in variants
    if(serializedComponent.variants === undefined) {
      serializedComponent.variants = {};
    }

    let uniqueVariantData;
    if(serializedComponent.variants.uniquevariants) {
      // max number of variants is the product of 
      // number of variants for each descendantVariantComponent
      let maxNumberOfVariants = 1;
      let numberOfVariantsByDescendant = []
      if(serializedComponent.variants.descendantVariantComponents !== undefined) {
        numberOfVariantsByDescendant = serializedComponent.variants.descendantVariantComponents
          .map(x => x.variants.numberOfVariants);
        maxNumberOfVariants = numberOfVariantsByDescendant.reduce((a,c) => a*c, 1);
        uniqueVariantData = {
          numberOfVariantsByDescendant: numberOfVariantsByDescendant,
        }
      }

      numberOfVariants = Math.min(maxNumberOfVariants, numberOfVariants)
    }

    return {
      success: true,
      numberOfVariants: numberOfVariants,
      uniqueVariantData: uniqueVariantData
    }

  }

  static getUniqueVariant({serializedComponent, variantNumber, allComponentClasses}) {
    if(serializedComponent.variants === undefined) {
      return {succes: false}
    }
    let numberOfVariants = serializedComponent.variants.numberOfVariants;
    if(numberOfVariants === undefined) {
      return {success: false}
    }

    if(!Number.isInteger(variantNumber) || variantNumber < 0 || variantNumber >= numberOfVariants) {
      return {success: false}
    }

    let desiredVariant = {
      index: variantNumber,
    }

    if(serializedComponent.variants.uniquevariants) {

      let result = getVariantsForDescendants({
        variantNumber: variantNumber,
        serializedComponent: serializedComponent,
        allComponentClasses: allComponentClasses
      })

      if(result.success) {
        desiredVariant.subvariants = result.desiredVariants
      }else {
        console.log("Failed to get unique variant for " + serializedComponent.componentType);
      }

    }

    return {success: true, desiredVariant: desiredVariant}
  }

  static includeBlankStringChildren = true;


  allowDownstreamUpdates(status) {
    // only allow initial change 
    return(status.initialChange === true);
  }

  get variablesUpdatableDownstream() {
    // only allowed to change these state variables
    return [
      "viewedSolution",
    ];
  }

  calculateDownstreamChanges({stateVariablesToUpdate, stateVariableChangesToSave,
    dependenciesToUpdate}) {

      Object.assign(stateVariableChangesToSave, stateVariablesToUpdate);

    return true; 
  }


}