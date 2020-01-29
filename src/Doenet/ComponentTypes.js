import * as PropertyComponents from './components/PropertyComponents';
import * as TemplateOnly from './components/TemplateOnly';
import * as MMeMen from './components/MMeMen';
import * as MdMdnMrow from './components/MdMdnMrow';
import * as BooleanOperators from './components/BooleanOperators';
import * as BooleanOperatorsOfMath from './components/BooleanOperatorsOfMath';
import * as MathOperators from './components/MathOperators';
import * as FunctionOperators from './components/FunctionOperators';
import * as Extrema from './components/Extrema';
import * as NumberOperators from './components/NumberOperators';
import * as PatternReplace from './components/PatternReplace';
import * as ParagraphMarkup from './components/ParagraphMarkup';
import * as SingleCharacterComponents from './components/SingleCharacterComponents';
import * as Sectioning from './components/Sectioning';
import * as Lists from './components/Lists';
import * as DynamicalSystems from './components/dynamicalSystems';
import Document from './components/Document';
import StringComponent from './components/StringComponent';
import Text from './components/Text';
import Letters from './components/Letters';
import TextList from './components/TextList';
import MathList from './components/MathList';
import P from './components/P';
import BooleanComponent from './components/Boolean';
import BooleanList from './components/BooleanList';
import MathComponent from './components/Math';
import Ref from './components/Ref';
import RefTarget from './components/RefTarget';
import Prop from './components/Prop';
import Extract from './components/Extract';
import Collect from './components/Collect';
import Xref from './components/Xref';
import Point from './components/Point';
import Coords from './components/Coords';
import Line from './components/Line';
import LineSegment from './components/LineSegment';
import Polyline from './components/Polyline';
import Polygon from './components/Polygon';
import Triangle from './components/Triangle';
import Circle from './components/Circle';
import Parabola from './components/Parabola';
import Curve from './components/Curve';
import BezierControls from './components/BezierControls';
import PointListComponent from './components/abstract/PointListComponent';
import VectorListComponent from './components/abstract/VectorListComponent';
import AngleListComponent from './components/abstract/AngleListComponent';
import Vector from './components/Vector';
import Angle from './components/Angle';
import Equation from './components/Equation';
import Answer from './components/Answer';
import Award from './components/Award';
import IfComponent from './components/If';
import Mathinput from './components/Mathinput';
import Textinput from './components/Textinput';
import Booleaninput from './components/Booleaninput';
import Choiceinput from './components/Choiceinput';
import Choice from './components/Choice';
import NumberComponent from './components/Number';
import Graph from './components/Graph';
import Variables from './components/Variables';
import Variable from './components/Variable';
import Function from './components/Function';
import Template from './components/Template';
import Sequence from './components/Sequence';
import Map from './components/Map';
import Substitutions from './components/Substitutions';
import Slider from './components/Slider';
import Markers from './components/Markers';
import ConstrainToGrid from './components/ConstrainToGrid';
import AttractToGrid from './components/AttractToGrid';
import ConstrainTo from './components/ConstrainTo';
import AttractTo from './components/AttractTo';
import ConstraintUnion from './components/ConstraintUnion';
import ConstraintToAttractor from './components/ConstraintToAttractor';
import Intersection from './components/Intersection';
import UpdateValue from './components/UpdateValue';
import MathTarget from './components/MathTarget';
import NewMathValue from './components/NewMathValue';
import Panel from './components/Panel';
import ConstrainToAngles from './components/ConstrainToAngles';
import AttractToAngles from './components/AttractToAngles';
import ConditionalContent from './components/ConditionalContent';
import ConditionalInlineContent from './components/ConditionalInlineContent';
import ConditionalText from './components/ConditionalText';
import ConditionalMath from './components/ConditionalMath';
import AsList from './components/AsList';
import Spreadsheet from './components/Spreadsheet';
import Cell from './components/Cell';
import Row from './components/Row';
import Column from './components/Column';
import Cellblock from './components/Cellblock';
import Table from './components/Table';
import Problem from './components/Problem';
import Variants from './components/Variants';
import Seeds from './components/Seeds';
import VariantControl from './components/VariantControl';
import SelectFromSequence from './components/SelectFromSequence';
import Select from './components/Select';
import Group from './components/Group';
import AnimateFromSequence from './components/AnimateFromSequence';
import Evaluate from './components/Evaluate';
import RandomNumber from './components/RandomNumber';
import GenerateRandomNumbers from './components/GenerateRandomNumbers';
import Substitute from './components/Substitute';
import Offsets from './components/Offsets';
import DiscreteInfiniteSet from './components/DiscreteInfiniteSet';
import Image from './components/Image';
import Video from './components/Video';
import Url from './components/Url';
import Meta from './components/Meta';
import Hint from './components/Hint';
import Solution from './components/Solution';
import IntComma from './components/IntComma';
import Pluralize from './components/Pluralize';
import Feedback from './components/Feedback';
import Container from './components/Container';


//Extended
import BaseComponent from './components/abstract/BaseComponent';
import InlineComponent from './components/abstract/InlineComponent';
import BlockComponent from './components/abstract/BlockComponent';
import GraphicalComponent from './components/abstract/GraphicalComponent';
import ConstraintComponent from './components/abstract/ConstraintComponent';
import Input from './components/abstract/Input';
import CompositeComponent from './components/abstract/CompositeComponent';
import ComponentWithAnyChildren from './components/abstract/ComponentWithAnyChildren';
import ComponentWithSelectableType from './components/abstract/ComponentWithSelectableType';
import ComponentListWithSelectableType from './components/abstract/ComponentListWithSelectableType';
import BooleanBaseOperator from './components/abstract/BooleanBaseOperator';
import BooleanBaseOperatorOfMath from './components/abstract/BooleanBaseOperatorOfMath';
import MathBaseOperator from './components/abstract/MathBaseOperator';
import MathBaseOperatorOneInput from './components/abstract/MathBaseOperatorOneInput';
import FunctionBaseOperator from './components/abstract/FunctionBaseOperator';
import ComponentSize from './components/abstract/ComponentSize';
import ComponentWithSerializedChildren from './components/abstract/ComponentWithSerializedChildren';
import SectioningComponent from './components/abstract/SectioningComponent';
import TextFromSingleStringChild from './components/abstract/TextFromSingleStringChild';
import MathWithVariable from './components/abstract/MathWithVariable';
import NumberBaseOperatorOrNumber from './components/abstract/NumberBaseOperatorOrNumber';
import InlineRenderInlineChildren from './components/abstract/InlineRenderInlineChildren';


const componentTypeArray = [
  ...Object.values(PropertyComponents),
  ...Object.values(TemplateOnly),
  ...Object.values(MMeMen),
  ...Object.values(MdMdnMrow),
  ...Object.values(BooleanOperators),
  ...Object.values(BooleanOperatorsOfMath),
  ...Object.values(MathOperators),
  ...Object.values(FunctionOperators),
  ...Object.values(Extrema),
  ...Object.values(NumberOperators),
  ...Object.values(PatternReplace),
  ...Object.values(ParagraphMarkup),
  ...Object.values(SingleCharacterComponents),
  ...Object.values(Sectioning),
  ...Object.values(Lists),
  ...Object.values(DynamicalSystems),
  Document,
  StringComponent,
  Text, Letters, TextList,
  P,
  BooleanComponent, BooleanList,
  MathComponent, MathList,
  Ref, RefTarget,
  Prop,
  Extract,
  Collect,
  Xref,
  Point, Coords,
  Line, LineSegment, Polyline,
  Polygon,
  Triangle,
  Circle,
  Parabola,
  Curve,
  BezierControls,
  Vector,
  Angle,
  Equation,
  Answer, Award, IfComponent,
  Mathinput, Textinput, Booleaninput, Choiceinput,
  Choice,
  NumberComponent,
  Graph,
  Variables,
  Variable,
  Function,
  Template,
  Sequence,
  Slider,
  Spreadsheet,
  Cell,
  Row,
  Column,
  Cellblock,
  Table,
  Markers,
  Panel,
  Map, Substitutions, 
  ConstrainToGrid,
  AttractToGrid,
  ConstrainTo,
  AttractTo,
  ConstraintUnion,
  ConstraintToAttractor,
  Intersection,
  UpdateValue, MathTarget, NewMathValue,
  ConstrainToAngles, AttractToAngles,
  ConditionalContent,
  ConditionalInlineContent,
  ConditionalText,
  ConditionalMath,
  AsList,
  Problem,
  Seeds, Variants, VariantControl,
  SelectFromSequence, Select,
  Group,
  AnimateFromSequence,
  Evaluate,
  RandomNumber,
  GenerateRandomNumbers,
  Substitute,
  Offsets,
  DiscreteInfiniteSet,
  Image,
  Video,
  Url,
  Meta,
  Hint, Solution,
  IntComma,
  Pluralize,
  Feedback,
  Container,
];

const componentTypeArrayExtended = [
  ...componentTypeArray,
  BaseComponent,
  InlineComponent,
  BlockComponent,
  GraphicalComponent,
  ConstraintComponent,
  Input,
  CompositeComponent,
  ComponentWithAnyChildren,
  ComponentWithSelectableType,
  ComponentListWithSelectableType,
  PointListComponent,
  VectorListComponent,
  AngleListComponent,
  BooleanBaseOperator,
  BooleanBaseOperatorOfMath,
  MathBaseOperator, MathBaseOperatorOneInput,
  FunctionBaseOperator,
  ComponentSize,
  ComponentWithSerializedChildren,
  SectioningComponent,
  TextFromSingleStringChild,
  MathWithVariable,
  NumberBaseOperatorOrNumber,
  InlineRenderInlineChildren,
];

const takingAliasArray = [
  Ref, RefTarget, Collect,
];

const creatingVariantsArray = [
  Document, Select, SelectFromSequence, VariantControl,
];

export function createComponentTypes() {
  const componentTypes = {};
  for(let ct of componentTypeArray) {
    if(ct.componentType === undefined) {
      throw Error("Cannot create component as componentType is undefined for class " + ct)
    }
    if(ct.componentType in componentTypes) {
      throw Error("component type " + ct.componentType + " defined in two classes");
    }
    if(!(/[a-zA-Z]/.test(ct.componentType.substring(0,1)))) {
      throw Error("Invalid component type " + ct.componentType + ". Component types must begin with a letter.");
    }
    componentTypes[ct.componentType] = {maxIndex: 0, class: ct};
  }
  return componentTypes;
}

export function allComponentClasses() {
  const componentClasses = {};
  for(let ct of componentTypeArrayExtended) {
    if(ct.componentType in componentClasses) {
      throw Error("component type " + ct.componentType + " defined in two classes");
    }
    componentClasses[ct.componentType] = ct;
  }
  return componentClasses;
}

export function componentTypesTakingAliases(){
  const componentClasses = {};
  for(let ct of takingAliasArray) {
    if(ct.componentType in componentClasses) {
      throw Error("component type " + ct.componentType + " defined in two classes");
    }
    componentClasses[ct.componentType] = ct;
  }
  return componentClasses;
}

export function componentTypesCreatingVariants(){
  const componentClasses = {};
  for(let ct of creatingVariantsArray) {
    if(ct.componentType in componentClasses) {
      throw Error("component type " + ct.componentType + " defined in two classes");
    }
    componentClasses[ct.componentType] = ct;
  }
  return componentClasses;
}

