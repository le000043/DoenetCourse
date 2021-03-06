import ChildLogicClass from '../../ChildLogic';
import readOnlyProxyHandler from '../../ReadOnlyProxyHandler';
import createStateProxyHandler from '../../StateProxyHandler';
import me from 'math-expressions';

export default class BaseComponent {
  constructor({
    componentName, serializedState,
    activeChildren, definingChildren, allChildren,
    serializedChildren, childLogic, trackChanges,
    components, standardComponentTypes, allComponentClasses,
    componentTypesTakingAliases, componentTypesCreatingVariants,
    shadow, requestUpdate, availableRenderers,
    allRenderComponents, graphRenderComponents,
    numerics, sharedParameters,
    requestAnimationFrame, cancelAnimationFrame,
    externalFunctions,
    allowSugarForChildren,
    styleDefinitions,
    flags,
  }) {
    this.styleDefinitions = styleDefinitions,
    
    this.numerics = numerics;
    this.currentTracker = { trackChanges: trackChanges };
    this.sharedParameters = sharedParameters;
    this.requestAnimationFrame = requestAnimationFrame,
      this.cancelAnimationFrame = cancelAnimationFrame;

    this.readOnlyProxyHandler = readOnlyProxyHandler;
    this.availableRenderers = availableRenderers;
    this.allRenderComponents = allRenderComponents;
    this.graphRenderComponents = graphRenderComponents;

    this.componentName = componentName;

    this.componentType = this.constructor.componentType;
    this.components = components;
    this.standardComponentTypes = standardComponentTypes;
    this.allComponentClasses = allComponentClasses;
    this.componentTypesTakingAliases = componentTypesTakingAliases;
    this.componentTypesCreatingVariants = componentTypesCreatingVariants;
    this.componentIsAProperty = false;
    this.requestUpdate = requestUpdate;
    this.externalFunctions = externalFunctions;
    this.allowSugarForChildren = allowSugarForChildren;
    this.flags = flags;

    if (shadow === true) {
      this.isShadow = true;
    }

    this.activeChildren = activeChildren;
    if (this.activeChildren === undefined) {
      this.activeChildren = [];
    }

    this.definingChildren = definingChildren;
    if (this.definingChildren === undefined) {
      this.definingChildren = [];
    }

    this.allChildren = allChildren;

    this.serializedChildren = serializedChildren;

    this.upstreamDependencies = {};
    this.downstreamDependencies = {};

    this.childLogic = childLogic;

    this.childrenWhoRender = [];

    this._state = {};

    // shortcut for setting or getting state values
    this.state = new Proxy(this._state, createStateProxyHandler(this, this.currentTracker));

    // create essential state from serialized state
    for (let item in serializedState.state) {
      let value = serializedState.state[item];
      if (Array.isArray(value)) {
        // shallow copy so that don't have proxy around entire array
        value = value.slice();
      }
      this._state[item] = { value: value, essential: true };
      trackChanges.addNewValue(this, item);
    }

    this.unresolvedState = {};
    if (serializedState.unresolvedState) {
      Object.assign(this.unresolvedState, serializedState.unresolvedState);
    }

    this.propertyChildren = {};

    // create state from properties and child logic
    if (this.childLogic === undefined) {
      this.childLogicSatisfied = false;
    } else {
      if (this.childLogic.logicResult.success) {
        this.childLogicSatisfied = true;
      } else {
        this.childLogicSatisfied = false;
      }

      for (let property in this.childLogic.properties) {

        let theProperty = this.setUpNewProperty(property);

        if (!this.childLogicSatisfied) {
          this.unresolvedState[property] = true;
          continue;
        } else {
          delete this.unresolvedState[property];
        }
        let childResult = this.childLogic.returnMatches('_property_' + property);
        if (childResult.length >= 1) {
          if (theProperty.isArray) {
            for (let [index, child] of childResult.map(x => this.activeChildren[x]).entries()) {
              this.assignNewPropertyFromChildren({
                property: property,
                child: child,
                arrayIndex: index
              });
            }
          } else {
            let child = this.activeChildren[childResult[0]];
            this.assignNewPropertyFromChildren({
              property: property,
              child: child
            });
          }
        } else if (theProperty.value === undefined ||
          (theProperty.isArray && theProperty.value.length === 0)
        ) {
          if (theProperty.required) {
            // if required, then it is an error that don't have it specified
            // either by children or essential state
            // TODO: record the absence of required property
            // for possible future error message
            this.unresolvedState[property] = true;
          } else if (theProperty.default === undefined && theProperty.deleteIfUndefined) {
            // if there was no default value or value defined
            // and deleteIfUndefined specified, then delete the property
            if (theProperty.addedLowerCaseProperty) {
              delete this._state[property.toLowerCase()];
            }
            if (theProperty.singularName) {
              delete this.arrayEntries[theProperty.singularName];
              delete this._state[theProperty.singularName];
            }
            delete this._state[property];

          } else {

            // otherwise, if no value defined, use the default
            theProperty.value = theProperty.default;
            theProperty.usedDefault = true;
            // set the property to be essential so that changes will be saved
            theProperty.essential = true;
          }
        }
      }
    }

    this.doenetAttributes = {};
    if (serializedState.doenetAttributes !== undefined) {
      Object.assign(this.doenetAttributes, serializedState.doenetAttributes);
    }

    if (serializedState.downstreamDependencies !== undefined) {
      for (let depComponentName in serializedState.downstreamDependencies) {

        // create shallow copy of dependency
        let dep = Object.assign({},
          serializedState.downstreamDependencies[depComponentName]);

        // add proxy to actual element
        dep.component = this.components[depComponentName];
        this.downstreamDependencies[depComponentName] = dep;
      }
    }

    if (serializedState.variants !== undefined) {
      this.variants = serializedState.variants;
    }

    this.gatherDescendants();

    // call update state as last step of constructor
    this.updateState({ init: true });
  }

  static componentType = "_base";

  setUpNewProperty(property) {

    let propertySpecification = this.childLogic.properties[property];

    if (propertySpecification.isArray) {

      let propertySingularName = propertySpecification.singularName;
      if (!propertySingularName) {
        propertySingularName = property;
      }

      let componentType = propertySpecification.componentType;
      if (!componentType) {
        componentType = propertySingularName;
      }

      this.makePublicStateVariableArray({
        variableName: property,
        componentType: componentType,
        emptyForOutOfBounds: true,
      });

      if (propertySingularName !== property) {
        this._state[property].singularName = propertySingularName;
        this.makePublicStateVariableArrayEntry({
          entryName: propertySingularName,
          arrayVariableName: property
        });
        this.makePublicStateVariableAlias({
          variableName: propertySingularName,
          targetName: propertySingularName,
          arrayIndex: 1
        });
      }
    }

    if (this._state[property] === undefined) {
      this._state[property] = {};
    }

    let lowerCaseProperty = property.toLowerCase();
    if (lowerCaseProperty !== property) {
      if (!(lowerCaseProperty in this._state)) {
        this._state[lowerCaseProperty] = this._state[property];
        this._state[property].addedLowerCaseProperty = true;
      }
    }

    let theProperty = this._state[property];
    theProperty.isProperty = true;
    theProperty.public = true;

    if (!propertySpecification.isArray) {
      theProperty.componentType = propertySpecification.componentType;
      if (theProperty.componentType === undefined) {
        theProperty.componentType = lowerCaseProperty;
      }
    }

    if (propertySpecification.required) {
      theProperty.required = true;
    } else {
      let defaultValue = propertySpecification.default;
      if (defaultValue === undefined && propertySpecification.deleteIfUndefined) {
        theProperty.deleteIfUndefined = true;
      } else {
        if (theProperty.isArray && !Array.isArray(defaultValue)) {
          if (defaultValue === undefined) {
            defaultValue = [];
          } else {
            defaultValue = [defaultValue];
          }
        }
        theProperty.default = defaultValue;
      }
    }
    return theProperty;
  }

  assignNewPropertyFromChildren({ property, child, arrayIndex }) {
    let theProperty = this._state[property];
    let propertyClass = this.allComponentClasses[property.toLowerCase()];
    if (theProperty.isArray && theProperty.singularName) {
      propertyClass = this.allComponentClasses[theProperty.singularName]
    }
    let stateVariableForPropertyValue = propertyClass.stateVariableForPropertyValue;
    if (stateVariableForPropertyValue === undefined) {
      stateVariableForPropertyValue = "value";
    }

    theProperty.stateVariableForPropertyValue = stateVariableForPropertyValue;

    if (theProperty.isArray) {
      if (!Array.isArray(this.propertyChildren[property])) {
        this.propertyChildren[property] = [];
      }
      this.propertyChildren[property][arrayIndex] = child;

      if (child.unresolvedState[stateVariableForPropertyValue]) {
        if (this.unresolvedState[property] === undefined) {
          this.unresolvedState[property] = { isArray: true, arrayComponents: {} };
        }
        this.unresolvedState[property].arrayComponents[arrayIndex] = true;
      } else {
        let newValue = child.state[stateVariableForPropertyValue];
        // since made public array variable
        // already has proxy to record change
        this.state[property][arrayIndex] = newValue;
      }

    } else {
      this.propertyChildren[property] = child;

      if (child.unresolvedState[stateVariableForPropertyValue]) {
        this.unresolvedState[property] = true;
      }
      else {
        let newValue = child.state[stateVariableForPropertyValue];
        this.currentTracker.trackChanges.logPotentialChange({
          component: this,
          variable: property,
          oldValue: theProperty.value,
        });
        this.currentTracker.trackChanges.logPotentialChange({
          component: this,
          variable: property.toLowerCase(),
          oldValue: theProperty.value,
        });
        theProperty.value = newValue;
      }
    }

    if (!arrayIndex) {
      // either not array (arrayIndex not defined)
      // or we're at the first child of an array (arrayIndex === 0)
      let additionalVars = propertyClass.additionalStateVariablesForProperties;
      if (additionalVars !== undefined) {
        theProperty.additionalVars = {};
        for (let varname of additionalVars) {
          if (child.unresolvedState[varname]) {
            this.unresolvedState[property] = true;
            theProperty.additionalVars[varname] = undefined;
          }
          else {
            theProperty.additionalVars[varname] = child.state[varname];
          }
        }
      }
    }
  }

  setTrackChanges(trackChanges) {
    this.currentTracker.trackChanges = trackChanges;
  }

  get parent() {
    if (this.ancestors === undefined || this.ancestors.length === 0) {
      return;
    }
    return this.ancestors[0];
  }

  getParentUpstreamComponents(includeInactive = false) {
    const parent = this.parent;
    let upstream = Object.values(this.upstreamDependencies)
    if (includeInactive !== true) {
      upstream = upstream.filter(x => x.inactive !== true);
    }
    upstream = upstream.map(x => x.component);
    if (parent === undefined) {
      return upstream;
    } else {
      return [parent, ...upstream];
    }
  }

  getAllChildrenDownstreamComponents(includeInactive = false) {
    const children = Object.values(this.allChildren).map(x => x.component);
    let downstream = Object.values(this.downstreamDependencies);
    if (includeInactive !== true) {
      downstream = downstream.filter(x => x.inactive !== true);
    }
    downstream = downstream.map(x => x.component);
    return [...children, ...downstream];
  }

  get allDescendants() {
    let descendants = [];
    for (let name in this.allChildren) {
      let child = this.allChildren[name].component;
      descendants = [...descendants, child, ...child.allDescendants];
    }
    return descendants;
  }

  updateChildrenWhoRender() {
  }

  updateState({ init } = {}) {

    // create a tracked state variable of active children
    // so that changes to active children will always count as a change
    this.state.lastActiveChildren = this.activeChildren;
    this._state.lastActiveChildren.trackChanges = true;

    if (init) {
      this._state.unresolvedDependenceChain = { trackChanges: true };
    }

    // if called from constructor or still have an unresolved dependence change
    // determine unresolved components that indirectly depend on
    if (init || this.state.unresolvedDependenceChain) {
      this.state.unresolvedDependenceChain = {};

      // TODO: not sure if want to merge from allChildren or definingChildren
      // but currently get infinite loop with allChildren in the map test:
      // 'map with circular dependence in template'

      // for (let childName in this.allChildren) {
      //   this.mergeUnresolved(this.allChildren[childName].component);
      // }
      for (let child of this.definingChildren) {
        this.mergeUnresolved(child);
      }
      for (let childName in this.downstreamDependencies) {
        let child = this.downstreamDependencies[childName].component;
        this.mergeUnresolved(child);
      }
      if (Object.keys(this.state.unresolvedDependenceChain).length === 0) {
        this.state.unresolvedDependenceChain = undefined;
      }
    }

    let trackChanges = this.currentTracker.trackChanges;
    let childrenChanged = trackChanges.childrenChanged(this.componentName);
    if (childrenChanged) {
      // check if have any defining children that are composite
      // or have composite descendants
      this.compositeDescendant = false;
      for (let child of this.definingChildren) {
        if (child instanceof this.allComponentClasses._composite) {
          this.compositeDescendant = true;
          break;
        }
        if (child.compositeDescendant) {
          this.compositeDescendant = true;
          break;
        }
      }
    }

    if (!init) {
      if (this.childLogic === undefined) {
        this.childLogicSatisfied = false;
      } else {
        if (this.childLogic.logicResult.success) {
          this.childLogicSatisfied = true;
        } else {
          this.childLogicSatisfied = false;
        }
      }

      this.updateProperties();
      this.copyStateFromShadowAdapterSource();
    }
    // fixed is shorthand for modifybyreference and draggable (if defined)
    // being set to false
    if (this.state.fixed) {
      if ("modifybyreference" in this._state) {
        if(this.state.modifybyreference) {
          this.state.modifybyreferenceIfNotFixed = true;
        }
        this.state.modifybyreference = false;
      }
      if ("draggable" in this._state) {
        if(this.state.draggable) {
          this.state.draggableIfNotFixed = true;
        }
        this.state.draggable = false;
      }

    } else {
      if(this.state.modifybyreferenceIfNotFixed) {
        this.state.modifybyreference = true;
      }
      if(this.state.draggableIfNotFixed) {
        this.state.draggable = true;
      }
    }
  }

  // merge any unresolvedDependencies or unresolvedDependenceChain from component
  // into this.state.unresolvedDependenceChain
  mergeUnresolved(component) {
    let componentHasUnresolved = false;
    if (component.unresolvedDependencies && Object.keys(component.unresolvedDependencies).length > 0) {
      componentHasUnresolved = true;
      for (let name of Object.keys(component.unresolvedDependencies)) {
        let newDep = component.unresolvedDependencies[name];
        if (name in this.state.unresolvedDependenceChain) {
          let currentDep = this.state.unresolvedDependenceChain[name];
          if (typeof currentDep === "object") {
            if (typeof newDep === "object") {
              // both are objects, so merge them
              // for now, only have props
              if (newDep.props) {
                if (currentDep.props) {
                  currentDep.props.push(...newDep.props);
                } else {
                  currentDep.props = [...newDep.props];
                }
              }
            }
          }
          else {
            this.state.unresolvedDependenceChain[name] = Object.assign({}, newDep);
          }
        }
      }
    }

    if (component.state.unresolvedDependenceChain && Object.keys(component.state.unresolvedDependenceChain).length > 0) {
      componentHasUnresolved = true;
      for (let name in component.state.unresolvedDependenceChain) {
        let newDep = component.state.unresolvedDependenceChain[name];
        if (name in this.state.unresolvedDependenceChain) {
          let currentDep = this.state.unresolvedDependenceChain[name]
          if (typeof currentDep === "object") {
            if (typeof newDep === "object") {
              // both are objects, so merge them
              // for now, only have props
              if (newDep.props) {
                if (currentDep.props) {
                  currentDep.props.push(...newDep.props);
                } else {
                  currentDep.props = [...newDep.props];
                }
              }
            }
          } else {
            this.state.unresolvedDependenceChain[name] = Object.assign({}, newDep);
          }

        } else {
          this.state.unresolvedDependenceChain[name] = Object.assign({}, newDep);
        }
      }
    }

    if (componentHasUnresolved) {
      this.state.unresolvedDependenceChain[component.componentName] = true;
    }

    return componentHasUnresolved;
  }

  updateProperties() {
    // update state from properties and child logic
    if (this.childLogic === undefined) {
      return;
    }

    let trackChanges = this.currentTracker.trackChanges;

    let childrenChanged = trackChanges.childrenChanged(this.componentName);

    for (let property in this.childLogic.properties) {
      let child = this.propertyChildren[property];

      let theProperty = this._state[property];

      if (childrenChanged || theProperty === undefined) {
        // recheck child logic
        if (!this.childLogicSatisfied) {
          continue;
        }
        delete this.unresolvedState[property];


        let childResult = this.childLogic.returnMatches('_property_' + property);
        if (childResult.length >= 1) {

          // possible property was defined if it was deleted due to not being present
          // now a child is present
          if (theProperty === undefined) {
            theProperty = this.setUpNewProperty(property)
          }

          if (theProperty.isArray) {
            let children = child; // for array, child is actually array of children
            let newChildren = childResult.map(x => this.activeChildren[x]);
            if (!Array.isArray(children) || newChildren.length !== children.length ||
              newChildren.some((v, i) => v.componentName !== children[i].componentName)
            ) {
              // at least one child changed, so recreate all
              for (let [index, child] of newChildren.entries()) {
                this.assignNewPropertyFromChildren({
                  property: property,
                  child: child,
                  arrayIndex: index
                });
              }
            }
          } else {
            let newChild = this.activeChildren[childResult[0]];
            if (child === undefined || newChild.componentName !== child.componentName) {
              delete theProperty.usedDefault;
              this.assignNewPropertyFromChildren({
                property: property,
                child: newChild
              });
              continue;
            }
          }
        } else if (child !== undefined) {
          // previous child(ren) must have been deleted
          // mark property as essential so that future changes are saved
          theProperty.essential = true;

          delete this.propertyChildren[property];
          continue;
        } else if (theProperty !== undefined &&
          (theProperty.value === undefined ||
            (theProperty.isArray && theProperty.value.length === 0))
        ) {
          // we have a property that hasn't been deleted but isn't defined
          // since don't have a child
          if (theProperty.required) {
            // if required, then it is an error to not have state
            // specified by child or essential state
            // (although not an error if was previously specified by a child
            // and child is now deleted, as property was made essential, above)
            // TODO: message for future display of error
            this.unresolvedState[property] = true;
            
          } else if (theProperty.default === undefined && theProperty.deleteIfUndefined) {
            // if there was no default value or value defined
            // and deleteIfUndefined specified, then delete the property
            if (theProperty.addedLowerCaseProperty) {
              delete this._state[property.toLowerCase()];
            }
            if (theProperty.singularName) {
              delete this.arrayEntries[theProperty.singularName];
              delete this._state[theProperty.singularName];
            }
            delete this._state[property];

          } else {

            // otherwise, if no value defined, use the default
            theProperty.value = theProperty.default;
            theProperty.usedDefault = true;
            // set the property to be essential so that changes will be saved
            theProperty.essential = true;

          }
        }
      }
      if (child === undefined) {
        continue;
      }

      if (this.unresolvedState[property]) {
        if (theProperty.isArray) {
          let children = child; // for array, child is actually array of children

          delete this.unresolvedState[property];

          for (let [arrayIndex, child] of children.entries()) {
            if (child.unresolvedState[theProperty.stateVariableForPropertyValue]) {
              if (this.unresolvedState[property] === undefined) {
                this.unresolvedState[property] = { isArray: true, arrayComponents: {} };
              }
              this.unresolvedState[property].arrayComponents[arrayIndex] = true;
            } else {
              let newValue = child.state[theProperty.stateVariableForPropertyValue];
              // since made public array variable
              // already has proxy to record change
              this.state[property][arrayIndex] = newValue;
            }

            if (arrayIndex === 0) {
              if (theProperty.additionalVars !== undefined) {
                for (let varname in theProperty.additionalVars) {
                  if (child.unresolvedState[varname]) {
                    propertyResolved = false;
                  } else {
                    theProperty.additionalVars[varname] = child.state[varname];
                  }
                }
              }
            }
          }

        } else {
          if (!child.unresolvedState[theProperty.stateVariableForPropertyValue]) {
            theProperty.value = child.state[theProperty.stateVariableForPropertyValue];
            let propertyResolved = true;

            if (theProperty.additionalVars !== undefined) {
              for (let varname in theProperty.additionalVars) {
                if (child.unresolvedState[varname]) {
                  propertyResolved = false;
                } else {
                  theProperty.additionalVars[varname] = child.state[varname];
                }
              }
            }
            if (propertyResolved) {
              delete this.unresolvedState[property];
              trackChanges.addNewValue(this, property);
            }
          }
        }
      } else {
        // didn't start off with property not being resolved
        if (theProperty.isArray) {
          let children = child; // for array, child is actually array of children
          for (let [arrayIndex, child] of children.entries()) {
            let variableChanges = trackChanges.getVariableChanges({
              component: child,
              variable: theProperty.stateVariableForPropertyValue
            });

            if (variableChanges) {
              let newValue = child.state[theProperty.stateVariableForPropertyValue];
              // since made public array variable
              // already has proxy to record change
              this.state[property][arrayIndex] = newValue;
            }
          }

          // for below additional properties, use first child
          child = children[0];
        } else {
          let variableChanges = trackChanges.getVariableChanges({
            component: child,
            variable: theProperty.stateVariableForPropertyValue
          });

          if (variableChanges) {
            trackChanges.addChange({
              component: this,
              variable: property,
              newChanges: variableChanges,
              mergeChangesIntoCurrent: true
            })
          }
        }

        if (theProperty.additionalVars !== undefined) {
          for (let varname in theProperty.additionalVars) {
            if (trackChanges.getVariableChanges({
              component: child,
              variable: varname
            })) {
              // don't attempt to merge as isn't a state variable
              // just set to new value from child
              theProperty.additionalVars[varname] = child.state[varname];
            }
          }
        }
      }
    }
  }

  copyStateFromShadowAdapterSource() {
    // if find a downstream dependency that is type "referenceShadow" or adapter,
    // this component is a shadowing another.
    // update this components state variables based on that of target

    let trackChanges = this.currentTracker.trackChanges;

    let copiedState = false;
    for (let downDepComponentName in this.downstreamDependencies) {
      let downDep = this.downstreamDependencies[downDepComponentName];
      if (downDep.dependencyType === "referenceShadow" || downDep.dependencyType === "adapter") {
        let shadowedComponent = downDep.component;
        for (let ind in downDep.downstreamStateVariables) {
          let downstreamVar = downDep.downstreamStateVariables[ind];
          let upstreamVar = downDep.upstreamStateVariables[ind];
          let variableChanges;
          if (typeof downstreamVar === "string") {
            if (shadowedComponent.unresolvedState[downstreamVar]) {
              this.unresolvedState[upstreamVar] = true;
            } else {
              delete this.unresolvedState[upstreamVar];
              variableChanges = trackChanges.getVariableChanges({
                component: shadowedComponent,
                variable: downstreamVar
              });
            }
            // this.state[upstreamVar] = shadowedComponent.state[downstreamVar];
          } else if(downstreamVar.arrayName !== undefined) {
            // downstreamVar is actually object giving an array and index
            let arrayName = downstreamVar.arrayName;
            let index = downstreamVar.index;
            if(index < 0) {
              index = downDep.component.state[arrayName].length + index;
            }
            if (shadowedComponent.unresolvedState[arrayName] === true ||
              !(index in shadowedComponent._state[arrayName].arrayComponents) ||
              (shadowedComponent.unresolvedState[arrayName] !== undefined &&
                shadowedComponent.unresolvedState[arrayName].arrayComponents[index])
            ) {
              this.unresolvedState[upstreamVar] = true;
            } else {
              delete this.unresolvedState[upstreamVar];
              variableChanges = trackChanges.getVariableChanges({
                component: shadowedComponent,
                variable: arrayName,
                index: index
              });

              // grab change for index
              if (variableChanges) {
                variableChanges = { changes: variableChanges.arrayComponents[index] }
              } else if(downstreamVar.index < 0) {
                // if originally had a negative index, then value could still change
                // if length of shadowed array changed
                let lengthChange = trackChanges.getVariableChanges({
                  component: shadowedComponent,
                  variable: arrayName,
                  index: "length"
                });
                if(lengthChange) {
                  // if length changes, just assert that a change did occur
                  variableChanges = { changes: downDep.component.state[arrayName][index] }
                }
              }
            }

            // this.state[upstreamVar] = shadowedComponent._state[arrayName].getComponent(index);
          } else if(downstreamVar.childnumberOf !== undefined) {
            let childComponentName = downstreamVar.childnumberOf;
            let childObj = shadowedComponent.allChildren[childComponentName];
            let childnumber;
            if(childObj) {
              childnumber = childObj.activeChildrenIndex;
            }
            if(childnumber === undefined) {
              this.state.value = me.fromAst('\uFF3F');
            } else {
              this.state.value = me.fromAst(childnumber+1);
            }
            
          } else {
            throw Error("Invalid format for downstream state variable");
          }

          if (variableChanges) {

            // state variable that is being shadowed changed
            // merge this change with current value of this component's variable
            trackChanges.addChange({
              component: this,
              variable: upstreamVar,
              newChanges: variableChanges,
              mergeChangesIntoCurrent: true
            })

          }
        }
        copiedState = true;
        break;
      }
    }

    if (copiedState === true) {
      // if component is a first-level replacement of a ref
      // then properties specified directly on ref supercede any from shadow
      // (as such properties on ref are overwritten)

      // look for a downstream dependency of type replacement
      // then check if component is actually a first-level replacement
      for (let downDepComponentName in this.downstreamDependencies) {
        let downDep = this.downstreamDependencies[downDepComponentName];
        if (downDep.dependencyType === "replacement" && downDep.component.componentType === "ref") {
          let refComponent = downDep.component;
          let firstLevelReplacement = false;
          for (let replacement of refComponent.replacements) {
            if (replacement.componentName === this.componentName) {
              firstLevelReplacement = true;
              break;
            }
          }
          if (firstLevelReplacement) {
            // component is a first-level replacement of a ref
            // copy its properties
            // overwrite properties in state from ref
            // (code as in addPropertiesFromRef from Ref.js)
            for (let item in refComponent._state) {
              if (item !== "prop" && item !== "childnumber") {
                if (refComponent._state[item].isProperty && refComponent._state[item].fromRefItself) {
                  // if changed either on this component (from above)
                  // or in ref component, change state variable
                  if (trackChanges.getVariableChanges({
                    component: this,
                    variable: item
                  })) {
                    // don't merge changes as want to overwrite any changes from above
                    this.state[item] = refComponent.state[item];
                    // trackChanges.addNewValue(this, item);
                  } else {
                    let variableChanges = trackChanges.getVariableChanges({
                      component: refComponent,
                      variable: item
                    });
                    if (variableChanges) {
                      trackChanges.addChange({
                        component: this,
                        variable: item,
                        newChanges: variableChanges,
                        mergeChangesIntoCurrent: true
                      });
                    }
                  }
                }
              }
            }
          }
          break;
        }
      }
    }

    return { copiedState: copiedState };
  }

  updateStateVariable({ variable, value }) {

    let varObj = this._state[variable];
    if (varObj === undefined) {
      console.log("Variable " + variable + " not a variable for " + this.componentName);
      return { success: false };
    }
    if (varObj.essential !== true) {
      console.log("Disallowing direct change to variable " + variable + " of " + this.componentName);
      return { success: false };
    }

    // use proxy so changes will be tracked
    this.state[variable] = value;

    return { success: true };
  }

  initializeRenderer({ sstate }) {
  }

  updateRenderer() {
  }

  static createPropertiesObject({ standardComponentTypes }) {

    return {
      hide: { default: false },
      modifybyreference: { default: true },
      fixed: { default: false },
      stylenumber: { default: 1 },
    };
  }

  static returnChildLogic({ standardComponentTypes, allComponentClasses, components }) {
    let childLogic = new ChildLogicClass({
      parentComponentType: this.componentType,
      properties: this.createPropertiesObject({
        standardComponentTypes: standardComponentTypes
      }),
      allComponentClasses: allComponentClasses,
      standardComponentTypes: standardComponentTypes,
      components: components,
    });

    return childLogic;
  }

  get descendantSearchClasses() {
    return [];
  }

  gatherDescendants() {
    const descendantsFound = {};
    for (let classObj of this.descendantSearchClasses) {
      let classNames = [];
      let conditionFunction;
      let recurseToMatchedChildren = true;
      let key;
      if (typeof classObj === "string") {
        classNames = [classObj];
        key = classObj;
      } else {
        if (classObj.skip) {
          continue;
        }
        classNames = classObj.classNames;
        conditionFunction = classObj.childCondition;
        key = classObj.key;
        if ('recurseToMatchedChildren' in classObj) {
          recurseToMatchedChildren = classObj.recurseToMatchedChildren;
        }

      }
      const descendants = descendantsFound[key] = [];
      let descendantClasses = classNames.map(x => this.allComponentClasses[x]);

      this.gatherDescendantsSub({
        activeChildren: this.activeChildren,
        descendantClasses: descendantClasses,
        conditionFunction: conditionFunction,
        recurseToMatchedChildren: recurseToMatchedChildren,
        descendants: descendants,
      });
    }

    this.descendantsFound = descendantsFound;
  }

  gatherDescendantsSub({ activeChildren, descendantClasses, conditionFunction,
    recurseToMatchedChildren, descendants }) {

    for (let child of activeChildren) {
      let matchedChild = false;
      if (descendantClasses.some(x => child instanceof x)) {
        if (conditionFunction === undefined) {
          matchedChild = true;
        } else if (conditionFunction(child)) {
          matchedChild = true;
        }
      }
      if (matchedChild) {
        descendants.push(child);
      }

      if (!matchedChild || recurseToMatchedChildren) {
        // recurse
        this.gatherDescendantsSub({
          activeChildren: child.activeChildren,
          descendantClasses: descendantClasses,
          conditionFunction: conditionFunction,
          recurseToMatchedChildren: recurseToMatchedChildren,
          descendants: descendants
        });
      }
    }
  }

  serialize(parameters = {}) {

    let state = {};

    let includePropertyChildren = true;
    let includeAnyDefiningChildren = true;

    // if being serialized for a reference,
    // serialize properties directly via state variables
    // and check to see if have component-specified state variables
    // to use rather than children
    if (parameters.forReference === true) {
      for (let varname in this._state) {
        if (this._state[varname].isProperty) {
          state[varname] = this.state[varname];
        }
      }
      includePropertyChildren = false;

      if (this.stateVariablesForReference !== undefined) {
        for (let varname of this.stateVariablesForReference) {
          state[varname] = this.state[varname];
        }
        includeAnyDefiningChildren = false;
      }

      if (this.additionalStateVariablesForReference !== undefined) {
        for (let varname of this.additionalStateVariablesForReference) {
          state[varname] = this.state[varname];
        }
      }
    }

    let serializedChildren = [];

    if (includeAnyDefiningChildren === true) {

      for (let child of this.definingChildren) {
        if (includePropertyChildren || child.componentIsAProperty !== true) {
          let serializedChild = child.serialize(parameters);
          if (Array.isArray(serializedChild)) {
            serializedChildren.push(...serializedChild);
          } else {
            serializedChildren.push(serializedChild);
          }
        }
      }

      if (this.serializedChildren !== undefined) {
        for (let child of this.serializedChildren) {
          serializedChildren.push(this.copySerializedComponent({
            serializedComponent: child,
            parameters: parameters
          }));
        }
      }
    }

    let serializedState = {
      componentType: this.componentType,
      children: serializedChildren,
      preserializedName: this.componentName,
      state: state,
      includeAnyDefiningChildren: includeAnyDefiningChildren,
      includePropertyChildren: includePropertyChildren,
    }

    for (let item in this._state) {
      if (this._state[item].essential === true) {
        serializedState.state[item] = this.state[item];
      }
    }

    if (parameters.forReference !== true) {
      serializedState.doenetAttributes = Object.assign({}, this.doenetAttributes);
    }

    if(Object.keys(this.unresolvedState).length > 0) {
      serializedState.unresolvedState = Object.assign({}, this.unresolvedState);
    }

    return serializedState;

  }

  copySerializedComponent({ serializedComponent, parameters }) {

    let serializedChildren = [];
    if (serializedComponent.children !== undefined) {
      for (let child of serializedComponent.children) {
        serializedChildren.push(this.copySerializedComponent({
          serializedComponent: child,
          parameters: parameters
        }));
      }
    }

    let serializedState = {
      componentType: serializedComponent.componentType,
      children: serializedChildren,
      state: {},
      doenetAttributes: {},
    }

    if (//parameters.forReference !== true &&
      serializedComponent.doenetAttributes !== undefined) {
      // shallow copy of doenetAttributes
      Object.assign(serializedState.doenetAttributes, serializedComponent.doenetAttributes);
    }

    if (serializedComponent.state !== undefined) {
      // shallow copy of state
      Object.assign(serializedState.state, serializedComponent.state);
    }

    return serializedState;

  }

  adapters = [];

  get nAdapters() {
    return this.adapters.length;
  }

  getAdapter(ind) {

    if (ind >= this.adapters.length) {
      return;
    }

    let adapter = this.adapters[ind];

    let stateVariableForNewComponent;
    let adapterStateVariable;
    let adapterComponentType;

    // adapter could be either 
    // - a string specifying a public state variable, or
    // - an object specify a public state variable and, optionally
    //   a component type and a state variable for the new component
    if (typeof adapter === "string") {
      adapterStateVariable = adapter;
    } else {
      adapterStateVariable = adapter.stateVariable;
      adapterComponentType = adapter.componentType;
      stateVariableForNewComponent = adapter.stateVariableForNewComponent;
    }

    // look in state for matching public value
    let stateFromAdapter = this._state[adapterStateVariable];
    if (stateFromAdapter === undefined || stateFromAdapter.public !== true) {
      throw Error("Invalid adapter " + adapterStateVariable + " in "
        + this.componentType);
    }

    if (stateVariableForNewComponent === undefined) {
      // adapter behaves like ref, so use the same state variable
      stateVariableForNewComponent = stateFromAdapter.stateVariableForRef;

      // use value if found no other option
      if (stateVariableForNewComponent === undefined) {
        stateVariableForNewComponent = "value";
      }
    }

    if (adapterComponentType === undefined) {
      // if didn't override componentType, use componentType from state variable
      adapterComponentType = stateFromAdapter.componentType;
    }

    let newState = {
      [stateVariableForNewComponent]: stateFromAdapter.value
    };


    let downstreamStateVariables = [adapterStateVariable];
    let upstreamStateVariables = [stateVariableForNewComponent]

    // copy any properties that match the adapter
    // add them both to newState and to dependency state variables
    let adapterClass = this.allComponentClasses[adapterComponentType];
    let availableClassProperties = adapterClass.createPropertiesObject({
      standardComponentTypes: this.standardComponentTypes
    });

    for (let item in availableClassProperties) {
      if (item in this._state) {
        newState[item] = this.state[item];
        downstreamStateVariables.push(item);
        upstreamStateVariables.push(item);
      }
    }

    let downDep = {
      dependencyType: "adapter",
      adapter: adapterStateVariable,
      downstreamStateVariables: downstreamStateVariables,
      upstreamStateVariables: upstreamStateVariables,
    }

    return {
      componentType: adapterComponentType,
      downstreamDependencies: {
        [this.componentName]: downDep
      },
      state: newState,
    };

  }

  addReferenceDependencies({ target, recursive = false, shadowed = false }) {
    let thisDep = this.downstreamDependencies[target.componentName];
    if (thisDep === undefined) {
      thisDep = this.downstreamDependencies[target.componentName] = {
        dependencyType: "reference",
        component: target,
      };
    }
    if (shadowed === true) {
      thisDep.shadowed = true;
    }
    if (recursive === true) {
      if (target.stateVariablesForReference === undefined) {
        if (target instanceof this.allComponentClasses['_composite']) {
          for (let repl of target.replacements) {
            this.addReferenceDependencies({
              target: repl, recursive: recursive, shadowed: shadowed
            });
          }
        } else {
          for (let child of target.definingChildren) {
            if (!child.componentIsAProperty) {
              this.addReferenceDependencies({
                target: child, recursive: recursive, shadowed: shadowed
              });
            }
          }
        }
      }
    } else {
      // if not recursive, mark the dependency as the base reference
      thisDep.baseReference = true;
    }
  }

  applyConstraints(variables, constraintChildrenIndices) {
    let constraintIndices = [];
    let constrained = false;

    let constraintChildren = constraintChildrenIndices.map(x => this.activeChildren[x]);

    for (let [ind, constraintChild] of constraintChildren.entries()) {

      let constraintResult = constraintChild.applyTheConstraint(variables);

      if(constraintResult.constrained) {

        constrained = true;

        for (let varname in variables) {
          if (varname in constraintResult.variables) {
            variables[varname] = constraintResult.variables[varname];
          }
        }

        if(constraintResult.constraintIndices === undefined) {
          constraintIndices = [ind+1];
        } else {
          constraintIndices = [ind+1, ...constraintResult.constraintIndices];
        }
      }
    }

    return {
      constrained: constrained,
      constraintIndices: constraintIndices,
    }
  }

  findFiniteNumericalValue(value) {
    // return undefined if value is undefined
    // returns null if value has a non-numerical value (including Infinity)
    // otherwise, returns numerical value

    if (value === undefined) {
      return undefined;
    }

    if (Number.isFinite(value)) {
      return value;
    }
    if (value.evaluate_to_constant !== undefined) {
      value = value.evaluate_to_constant();
      if (Number.isFinite(value)) {
        return value;
      }
    }

    // couldn't find numerical value
    return null;
  }

  makePublicStateVariable({ variableName, componentType, stateVariableForRef,
    additionalProperties }) {

    if (componentType === undefined) {
      throw Error("Must specify componentType of public state variable")
    }

    if (this._state[variableName] === undefined) {
      this._state[variableName] = {};
    }
    this._state[variableName].componentType = componentType;
    this._state[variableName].public = true;

    if (stateVariableForRef !== undefined) {
      this._state[variableName].stateVariableForRef = stateVariableForRef;
    }
    if (additionalProperties !== undefined) {
      this._state[variableName].additionalProperties = additionalProperties;
    }

    let lowerCaseName = variableName.toLowerCase();
    if (lowerCaseName !== variableName) {
      if (!(lowerCaseName in this._state)) {
        this._state[lowerCaseName] = this._state[variableName];
      }
    }
  }

  makePublicStateVariableArray({ variableName, componentType,
    stateVariableForRef, additionalProperties,
    validateParameters = validateParametersDefault,
    returnSerializedComponents = returnSerializedComponentsDefault,
    nDimensions = 1,
    emptyForOutOfBounds = false,
  }) {

    if (this._state[variableName] === undefined) {
      this._state[variableName] = { value: [] };
    }

    let stateVariable = this._state[variableName];

    stateVariable.componentType = componentType;
    stateVariable.public = true;

    if (stateVariableForRef !== undefined) {
      stateVariable.stateVariableForRef = stateVariableForRef;
    }
    if (additionalProperties !== undefined) {
      stateVariable.additionalProperties = additionalProperties;
    }

    this.makeArrayVariable({
      variableName: variableName,
      nDimensions: nDimensions,
      trackChanges: true
    });

    let unresolvedState = this.unresolvedState;

    stateVariable.validateParameters = function (propChildren) {
      return validateParameters(stateVariable, propChildren)
    };

    stateVariable.returnSerializedComponents = function ({
      propChildren, propName, additionalDepProperties }) {
      return returnSerializedComponents({
        stateVariable: stateVariable,
        variableName: variableName,
        propChildren: propChildren,
        propName: propName,
        componentName: this.componentName,
        additionalDepProperties: additionalDepProperties,
        unresolvedState: unresolvedState,
        emptyForOutOfBounds: emptyForOutOfBounds,
      });
    }.bind(this);

    let lowerCaseName = variableName.toLowerCase();
    if (lowerCaseName !== variableName) {
      if (!(lowerCaseName in this._state)) {
        this._state[lowerCaseName] = this._state[variableName];
      }
    }

  }

  makeArrayVariable({ variableName, nDimensions = 1, trackChanges = true }) {

    if (this._state[variableName] === undefined) {
      this._state[variableName] = { value: [] };
    }

    let stateVariable = this._state[variableName];
    stateVariable.isArray = true;
    if (trackChanges) {
      stateVariable.trackChanges = true;
    }

    let currentTracker = this.currentTracker;
    let thisComponent = this;

    stateVariable.nDimensions = nDimensions;

    stateVariable.arrayProxyHandler = {
      get: function (obj, index) {
        if (stateVariable.nDimensions > 1) {
          if (typeof index === "string") {
            index = index.split(',');
          }
          if (Array.isArray(index)) {
            let val = obj;
            for (let ind of index) {
              if (val === undefined) {
                return undefined;
              }
              val = val[ind];
            }
            return val;
          }
          else {
            return obj[index];
          }
        }
        else {
          return obj[index];
        }
      },
      set: function (obj, index, value) {
        let oldValue;
        if (stateVariable.nDimensions > 1) {
          if (typeof index === "string") {
            index = index.split(',');
          }
          if (Array.isArray(index)) {
            let val = obj;
            for (let ind of index.slice(0, index.length - 1)) {
              if (val[ind] === undefined) {
                val = val[ind] = [];
              } else {
                val = val[ind];
              }
            }
            let lastIndex = index[index.length - 1];
            oldValue = val[lastIndex];
            val[lastIndex] = value;
          } else {
            oldValue = obj[index];
            obj[index] = value;
          }
        } else {
          oldValue = obj[index];
          obj[index] = value;
        }
        if (trackChanges) {
          currentTracker.trackChanges.logPotentialChange({
            component: thisComponent,
            variable: variableName,
            oldValue: oldValue,
            index: index,
          });
        }
        return true;
      },
      has: function (obj, index) {
        if (stateVariable.nDimensions > 1) {
          if (typeof index === "string") {
            index = index.split(',');
          }
          if (Array.isArray(index)) {
            let val = obj;
            for (let ind of index) {
              ind = Number(ind);
              // if empty entry in array, should still be in
              if (!Number.isInteger(ind) || ind < 0 || ind >= val.length) {
                return false;
              }
              if (val === undefined) {
                return false;
              }
              val = val[ind];
            }
            return true;
          } else {
            let ind = Number(index);
            // if empty entry in array, should still be in
            return Number.isInteger(ind) && ind >= 0 && ind < obj.length;
          }
        } else {
          let ind = Number(index);
          // if empty entry in array, should still be in
          return Number.isInteger(ind) && ind >= 0 && ind < obj.length;
        }
      }
    };
    stateVariable.arrayComponents = new Proxy(stateVariable.value, stateVariable.arrayProxyHandler);
  }

  makePublicStateVariableArrayEntry({ entryName, arrayVariableName,
    initialIndex = 1, getSugarReplacement = getSugarReplacementDefault }) {

    if (!(Number.isFinite(initialIndex) && initialIndex >= 0)) {
      initialIndex = 0;
    } else if (!Number.isInteger(initialIndex)) {
      initialIndex = Math.round(initialIndex);
      console.log("rounding initialIndex to " + initialIndex);
    }

    let arrayEntry = {
      arrayVariableName: arrayVariableName,
      initialIndex: initialIndex,
    }

    // add to set of array variables
    if (this.arrayEntries === undefined) {
      this.arrayEntries = {};
    }
    this.arrayEntries[entryName.toLowerCase()] = arrayEntry;

    arrayEntry.getSugarReplacement = function (indexString) {
      return getSugarReplacement({
        arrayEntry: arrayEntry,
        indexString: indexString
      });
    };

  }

  makePublicStateVariableAlias({ variableName, targetName, arrayIndex }) {
    // since aliases aren't intended to be used in component code
    // we make the variable name lower case
    variableName = variableName.toLowerCase();

    if (this._state[variableName] === undefined) {
      this._state[variableName] = {};
    }

    this._state[variableName].isAlias = true;
    this._state[variableName].aliasTargetName = targetName;
    if (arrayIndex !== undefined) {
      this._state[variableName].aliasArrayIndex = arrayIndex;
    }

  }

  allowDownstreamUpdates() {
    return false;
  }

  get variablesUpdatableDownstream() {
    return [];
  }

  updateShadowSources({ newStateVariables, dependenciesToUpdate }) {

    // a set of variableNames that are shadows
    let shadowedStateVariables = new Set();

    // set to true if upstream component is a replacement of a composite
    let isReplacement = false;

    // create instructions to update any downstream sources of referenceShadows
    for (let downDepName in this.downstreamDependencies) {
      let downDep = this.downstreamDependencies[downDepName];
      if (downDep.dependencyType === "referenceShadow" || downDep.dependencyType === "adapter") {
        let depsToUpdate = {};
        for (let ind in downDep.upstreamStateVariables) {
          let upstreamVariable = downDep.upstreamStateVariables[ind];
          if (upstreamVariable in newStateVariables) {
            let newChanges = newStateVariables[upstreamVariable].changes;
            shadowedStateVariables.add(upstreamVariable);
            let downstreamVariable = downDep.downstreamStateVariables[ind];
            if (typeof downstreamVariable === "string") {
              depsToUpdate[downstreamVariable] = { changes: newChanges };
            } else {
              // downstreamVar is actually object giving an array and index
              let arrayName = downstreamVariable.arrayName;
              let index = downstreamVariable.index;
              if(index < 0) {
                index = downDep.component.state[arrayName].length + index;
              }

              if (depsToUpdate[arrayName] === undefined) {
                depsToUpdate[arrayName] = { isArray: true, changes: { arrayComponents: {} } };
              }
              depsToUpdate[arrayName].changes.arrayComponents[index] = newChanges;
            }
          }
        }
        if (Object.keys(depsToUpdate).length > 0) {
          dependenciesToUpdate[downDepName] = depsToUpdate;
        }
      } else if (downDep.dependencyType === "replacement") {
        isReplacement = true;
      }
    }
    return {
      shadowedStateVariables: shadowedStateVariables,
      isReplacement: isReplacement
    }
  }

  updatePropertySources({ newStateVariables, dependenciesToUpdate }) {

    // create instructions to update property children that underlie newStateVariables
    if (this.childLogic !== undefined) {
      for (let property in this.childLogic.properties) {
        if (property in newStateVariables) {

          let theProperty = this._state[property];

          let childResult = this.childLogic.returnMatches('_property_' + property);
          if (childResult.length === 1) {
            let propertyComponentName = this.activeChildren[childResult[0]].componentName;
            dependenciesToUpdate[propertyComponentName] = {
              [theProperty.stateVariableForPropertyValue]: { changes: newStateVariables[property] }
            }
          }
        }
      }
    }
  }

  downstreamUpdate({ status }) {

    if (!this.allowDownstreamUpdates(status)) {
      return { canUpdate: false }
    };

    let stateVariablesToUpdate = status.stateVariablesToUpdate;

    if (stateVariablesToUpdate === undefined) {
      console.log("found undefined stateVariablesToUpdate");
      return { canUpdate: false };
    }

    // check if know how to update the variables
    if (this.determineIfVariableUpdatableDownstream !== undefined) {
      if (this.determineIfVariableUpdatableDownstream(stateVariablesToUpdate) !== true) {
        return { canUpdate: false };
      }
    } else if (!Object.keys(stateVariablesToUpdate).every(
      v => this.variablesUpdatableDownstream.includes(v))) {
      return { canUpdate: false };
    }

    let stateVariableChangesToSave = {};
    let dependenciesToUpdate = {};


    let success = this.calculateDownstreamChanges({
      stateVariablesToUpdate: stateVariablesToUpdate,
      stateVariableChangesToSave: stateVariableChangesToSave,
      dependenciesToUpdate: dependenciesToUpdate,
      initialChange: status.initialChange,
    });
    if (success !== true) {
      return { canUpdate: false };
    }

    return {
      canUpdate: true,
      stateVariableChangesToSave: stateVariableChangesToSave,
      dependenciesToUpdate: dependenciesToUpdate,
    }

  }

}

////////////////////////////////////////////////////////////////////////////
// Default functions for array state variables
//
// Modify the behavior of arrays by passing in different functions
// to makePublicStateVariableArray and makePublicStateVariableArrayEntry
//
// In each function, stateVariable will be the full state variable
// (not the proxied version) of the array
////////////////////////////////////////////////////////////////////////////


// determine if the propChildren are valid parameters for the state variable
// return object with attributes
// - success: true if valid parameters
// - numReplacements: number of replacements for these parameters
// - componentType: component type of replacement (used only if numReplacements==1)
function validateParametersDefault(stateVariable, propChildren) {
  let componentType = stateVariable.componentType;
  if (propChildren === undefined || propChildren.length === 0) {
    let numReplacements = stateVariable.value.length;
    if (numReplacements === 1) {
      if (Array.isArray(componentType)) {
        componentType = componentType[0]
      }
    }
    return { success: true, numReplacements: numReplacements, componentType: componentType };
  } else if (propChildren.length === 1 && propChildren[0].componentType === "index") {
    let index = propChildren[0].state.number;
    if (Number.isInteger(index)) {
      if (Array.isArray(componentType)) {
        if(index >= 0) {
          componentType = componentType[index]
        } else {
          componentType = componentType[componentType.length + index]
        }
        if (componentType === undefined) {
          // if index is too large for componentType array
          return { success: false };
        }
      }
      return { success: true, numReplacements: 1, componentType: componentType };
    } else {
      return { success: false };
    }
  } else {
    return { success: false };
  }
}

// return the JSON representing the portion of array determined by the given propChildren
function returnSerializedComponentsDefault({
  stateVariable, variableName,
  propChildren, propName,
  componentName, additionalDepProperties,
  unresolvedState,
  emptyForOutOfBounds,
}) {

  let stateVariableForRef = "value";
  if (stateVariable.stateVariableForRef !== undefined) {
    stateVariableForRef = stateVariable.stateVariableForRef;
  }

  let downstreamStateVariable = {
    arrayName: variableName,
  }
  let downDep = {
    dependencyType: "referenceShadow",
    prop: propName,
    downstreamStateVariables: [downstreamStateVariable],
    upstreamStateVariables: [stateVariableForRef],
  }

  if (additionalDepProperties !== undefined) {
    Object.assign(downDep, additionalDepProperties);
  }

  if (propChildren === undefined || propChildren.length === 0) {
    let numComponents = stateVariable.value.length;
    let newComponents = [];
    for (let index = 0; index < numComponents; index++) {
      downstreamStateVariable.index = index;
      // so that index is remains different for different components
      // need a deep copy of downDep.downstreamVariables
      // accomplish via two shallow copies, first one here
      downDep.downstreamStateVariables = [Object.assign({}, downstreamStateVariable)];
      let componentType = stateVariable.componentType;
      if (Array.isArray(componentType)) {
        componentType = componentType[index];
      }
      let additionalProperties = stateVariable.additionalProperties;
      if (Array.isArray(additionalProperties)) {
        additionalProperties = additionalProperties[index];
      }
      let componentState = {
        [stateVariableForRef]: stateVariable.value[index],
      }
      if(additionalProperties !== undefined) {
        Object.assign(componentState, additionalProperties)
      }
      newComponents.push({
        componentType: componentType,
        state: componentState,
        // second shallow copy for downDep.downstreamVariables deep copy
        downstreamDependencies: {
          [componentName]: Object.assign({}, downDep),
        },
      });
    }
    return newComponents;
  } else {
    let numComponents = stateVariable.value.length;
    let index = propChildren[0].state.number;

    // already know index is an integer
    // else would have failed validateParameters

    if(index < 0) {
      index = numComponents + index;
    }

    let outOfBounds = index < 0 || index >= numComponents;
    if (outOfBounds && emptyForOutOfBounds) {
      return [];
    }
    downstreamStateVariable.index = propChildren[0].state.number;  // use original index here
    let componentType = stateVariable.componentType;
    if (Array.isArray(componentType)) {
      componentType = componentType[index];
    }
    let additionalProperties = stateVariable.additionalProperties;
    if (Array.isArray(additionalProperties)) {
      additionalProperties = additionalProperties[index];
    }
    let componentState = {
      [stateVariableForRef]: stateVariable.value[index],
    }
    if(additionalProperties !== undefined) {
      Object.assign(componentState, additionalProperties)
    }

    let newComponents = [{
      componentType: componentType,
      state: componentState,
      downstreamDependencies: {
        [componentName]: downDep,
      },
    }];

    let unresolved = outOfBounds;
    if (unresolvedState[variableName] === true ||
      (unresolvedState[variableName] !== undefined && unresolvedState[variableName].arrayComponents[index])) {
      unresolved = true;
    }
    if (unresolved) {
      newComponents[0].unresolvedState = { [stateVariableForRef]: true }
    }

    return newComponents;

  }
}

// parse indexString to give the corresponding propChildren for the array
function getSugarReplacementDefault({ arrayEntry, indexString }) {
  if (typeof indexString === "number") {
    indexString = String(indexString);
  }
  let validIndex = /^(0|-?[1-9]\d*)$/.test(indexString);
  if (validIndex) {
    let index = Number(indexString);
    
    if(index >= 0) {
      index -= arrayEntry.initialIndex;

      if (index < 0) {
        return; // mark as invalid
      } 
    }

    return [{ componentType: "index", state: { value: index } }];
  } else {
    return; // mark as invalid
  }
}

